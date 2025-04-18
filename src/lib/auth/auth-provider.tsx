"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

type UserRole = "buyer" | "seller" | "admin"

interface AuthContextType {
  user: User | null
  userRole: UserRole | null
  loading: boolean
  register: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as UserRole)
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const register = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, { displayName })

      // Store user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        role,
        createdAt: new Date().toISOString(),
      })

      setUserRole(role)
      
      // Store user data in cookie for server-side access
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName,
        role
      }
      
      // Set cookie with user data
      document.cookie = `user-session=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60*60*24*7}`

      toast({
        title: "Account created successfully",
        description: "Welcome to SecondChance Marketplace!",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      })
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))
      let userRole = null
      
      if (userDoc.exists()) {
        userRole = userDoc.data().role as UserRole
        setUserRole(userRole)
      }
      
      // Store user data in cookie for server-side access
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userRole
      }
      
      // Set cookie with user data
      document.cookie = `user-session=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60*60*24*7}`
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to SecondChance Marketplace!",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      
      // Clear the user session cookie
      document.cookie = "user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      
      toast({
        title: "Logged out successfully",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, register, login, logout }}>{children}</AuthContext.Provider>
  )
}
