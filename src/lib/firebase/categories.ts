import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "./config"

interface Category {
  id: string
  name: string
  icon?: string
  description?: string
}

export async function getCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[]
  } catch (error) {
    console.error("Error getting categories:", error)
    // Return empty array instead of throwing
    return []
  }
}

export async function getCategory(id: string) {
  try {
    const docRef = doc(db, "categories", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error("Category not found")
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Category
  } catch (error) {
    console.error("Error getting category:", error)
    throw error
  }
}

export async function createCategory(id: string, data: Omit<Category, "id">) {
  try {
    await setDoc(doc(db, "categories", id), data)
    return { id, ...data }
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

export async function updateCategory(id: string, data: Partial<Omit<Category, "id">>) {
  try {
    const docRef = doc(db, "categories", id)
    await setDoc(docRef, data, { merge: true })
    return { id, ...data }
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    await deleteDoc(doc(db, "categories", id))
    return true
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}
