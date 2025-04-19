import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"

export async function getChats(userId: string) {
  try {
    // Get all chats where the user is a participant
    const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", userId))

    const chatsSnapshot = await getDocs(chatsQuery)

    if (chatsSnapshot.empty) {
      return []
    }

    // For each chat, get the other participant's info
    const chats = await Promise.all(
      chatsSnapshot.docs.map(async (chatDoc) => {
        const chatData = chatDoc.data()

        // Find the other participant's ID
        const otherUserId = chatData.participants.find((id: string) => id !== userId)

        // Get the other user's info
        let otherUser = null
        if (otherUserId) {
          try {
            const userDoc = await getDoc(doc(db, "users", otherUserId))
            if (userDoc.exists()) {
              otherUser = {
                id: userDoc.id,
                displayName: userDoc.data().displayName || "Unknown User",
                photoURL: userDoc.data().photoURL,
              }
            }
          } catch (error) {
            console.error("Error fetching other user:", error)
          }
        }

        return {
          id: chatDoc.id,
          ...chatData,
          lastMessage: chatData.lastMessage
            ? {
                ...chatData.lastMessage,
                timestamp: chatData.lastMessage.timestamp?.toDate() || new Date(),
              }
            : {
                text: "No messages yet",
                timestamp: new Date(),
              },
          otherUser: otherUser || {
            id: otherUserId || "unknown",
            displayName: "Unknown User",
            photoURL: null,
          },
        }
      }),
    )

    // Sort chats by last message timestamp
    return chats.sort((a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime())
  } catch (error) {
    console.error("Error getting chats:", error)
    return []
  }
}

export async function getMessages(chatId: string) {
  try {
    const messagesQuery = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"))

    const messagesSnapshot = await getDocs(messagesQuery)

    return messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    }))
  } catch (error) {
    console.error("Error getting messages:", error)
    return []
  }
}

export async function sendMessage(chatId: string, message: { text: string; senderId: string; timestamp: Date }) {
  try {
    // Add message to the chat's messages subcollection
    await addDoc(collection(db, "chats", chatId, "messages"), {
      ...message,
      timestamp: serverTimestamp(),
    })

    // Update the chat's last message
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: {
        text: message.text,
        timestamp: serverTimestamp(),
      },
    })

    return true
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

export async function createChat(participants: string[], initialMessage?: { text: string; senderId: string }) {
  try {
    // Create a new chat document
    const chatData = {
      participants,
      createdAt: serverTimestamp(),
      lastMessage: initialMessage
        ? {
            text: initialMessage.text,
            timestamp: serverTimestamp(),
          }
        : null,
    }

    const chatRef = await addDoc(collection(db, "chats"), chatData)

    // If there's an initial message, add it to the messages subcollection
    if (initialMessage) {
      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        ...initialMessage,
        timestamp: serverTimestamp(),
      })
    }

    return chatRef.id
  } catch (error) {
    console.error("Error creating chat:", error)
    throw error
  }
}
