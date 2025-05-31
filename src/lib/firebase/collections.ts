import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

export interface ReceiptProduct {
  productId: string
  productTitle: string
  productImage: string
  quantity: number
  price: number
  subtotal: number
  sellerId: string
  sellerName: string
}

export interface ReceiptHistory {
  orderId: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  products: ReceiptProduct[]
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: any // Firestore Timestamp
  updatedAt: any // Firestore Timestamp
}

// Function to create a new receipt
export const createReceipt = async (receiptData: Omit<ReceiptHistory, 'createdAt' | 'updatedAt'>) => {
  try {
    const receiptWithTimestamps = {
      ...receiptData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'receipt_history'), receiptWithTimestamps)
    return docRef.id
  } catch (error) {
    console.error('Error creating receipt:', error)
    throw error
  }
} 