"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword as updateUserPassword,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { setupPresence } from "@/lib/firebase/presence"

type UserRole = "buyer" | "seller" | "admin"

interface AuthContextType {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  signUp: (email: string, password: string, role: UserRole, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Set up presence tracking
        setupPresence(user.uid)
        
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as UserRole)
          } else {
            // Default to buyer if no role is set
            setUserRole("buyer")
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
          setUserRole("buyer")
        }
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, role: UserRole, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Set display name if provided
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: displayName || user.email?.split("@")[0],
        role,
        createdAt: new Date().toISOString(),
        approved: role === "buyer", // Auto-approve buyers, sellers need admin approval
      })

      setUserRole(role)
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("Successfully authenticated user:", user.uid)

      // Fetch user role from Firestore
      console.log("Fetching user role from Firestore...")
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log("User role found:", userData.role)
        setUserRole(userData.role as UserRole)
      } else {
        console.log("No user document found in Firestore, defaulting to buyer")
        setUserRole("buyer")
      }
    } catch (error: any) {
      console.error("Detailed sign-in error:", {
        code: error.code,
        message: error.message,
        email: email,
        timestamp: new Date().toISOString()
      })
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password. Please check your credentials and try again.")
      } else if (error.code === 'auth/user-disabled') {
        throw new Error("This account has been disabled. Please contact support.")
      } else if (error.code === 'auth/user-not-found') {
        throw new Error("No account found with this email. Please check your email or register.")
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed login attempts. Please try again later.")
      } else {
        throw new Error(error.message || "An error occurred during sign in. Please try again.")
      }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        // Create new user document with default role as buyer
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "buyer",
          createdAt: new Date().toISOString(),
          approved: true,
        })

        setUserRole("buyer")
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      if (!user) throw new Error("No user logged in")

      await updateProfile(user, {
        displayName,
        photoURL: photoURL || user.photoURL,
      })

      // Update user document in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName,
          photoURL: photoURL || user.photoURL,
        },
        { merge: true },
      )

      // Force refresh to update UI
      setUser({ ...user, displayName, photoURL: photoURL || user.photoURL })
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error("No user is currently signed in")
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      )
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updateUserPassword(auth.currentUser, newPassword)
    } catch (error: any) {
      console.error("Error updating password:", error)
      if (error.code === "auth/wrong-password") {
        throw new Error("Current password is incorrect")
      }
      throw new Error(error.message || "Failed to update password")
    }
  }

  const value = {
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
