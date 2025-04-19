export interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  location: string
  imageUrl: string
  sellerId: string
  sellerName: string
  status: "pending" | "approved" | "rejected"
  createdAt: any
  inStockQuantity: number
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userPhotoURL: string | null
  rating: number
  text: string
  createdAt: any
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  createdAt: any
}

export interface Chat {
  id: string
  participants: string[]
  productId: string
  productTitle: string
  productImage: string
  lastMessage: string | null
  lastMessageTime: any
}
