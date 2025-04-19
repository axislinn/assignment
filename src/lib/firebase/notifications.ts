import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"

export interface Notification {
  id: string
  userId: string
  type: "new_order" | "order_status" | "message" | "system" | "product_sold"
  title: string
  message: string
  read: boolean
  link?: string
  orderId?: string
  productId?: string
  createdAt: Date
}

// Get user notifications
export async function getUserNotifications(userId: string, limitCount = 50): Promise<Notification[]> {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    )

    const querySnapshot = await getDocs(notificationsQuery)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Notification[]
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
    )

    const querySnapshot = await getDocs(notificationsQuery)
    return querySnapshot.size
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    return 0
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    })

    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
    )

    const querySnapshot = await getDocs(notificationsQuery)

    const batch = db.batch()
    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    await batch.commit()

    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }
}

// Create a notification
export async function createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<string> {
  try {
    const notificationRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      createdAt: serverTimestamp(),
    })

    // Get user's FCM tokens to send push notification
    const userDoc = await getDoc(doc(db, "users", notification.userId))
    if (userDoc.exists() && userDoc.data().fcmTokens) {
      const fcmTokens = userDoc.data().fcmTokens

      // Send push notification to each token
      for (const token of fcmTokens) {
        try {
          await sendPushNotification(token, {
            title: notification.title,
            body: notification.message,
            data: {
              notificationId: notificationRef.id,
              type: notification.type,
              orderId: notification.orderId,
              productId: notification.productId,
              link: notification.link,
            },
          })
        } catch (error) {
          console.error("Error sending push notification:", error)
        }
      }
    }

    return notificationRef.id
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "notifications", notificationId))
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

// Send push notification using Firebase Cloud Messaging
async function sendPushNotification(token: string, notification: { title: string; body: string; data?: any }) {
  // This would typically be done via a server-side function
  // For client-side, we'll use a placeholder implementation
  console.log(`Sending push notification to token ${token}:`, notification)

  // In a real implementation, you would call your backend API that uses Firebase Admin SDK
  // Example server-side code:
  /*
  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    token: token,
  }
  
  return admin.messaging().send(message)
  */

  return true
}
