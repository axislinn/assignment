"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  where,
  increment,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, User, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { subscribeToUserPresence } from "@/lib/firebase/presence"

interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  createdAt: any
  read: boolean
  readAt?: any
}

interface ChatParticipant {
  id: string
  displayName: string
  photoURL: string | null
}

interface ChatData {
  id: string
  participants: string[]
  productId?: string
  productTitle?: string
  productImage?: string
  lastMessage?: string
  lastMessageTime?: any
}

export default function ChatPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [chat, setChat] = useState<ChatData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<ChatParticipant | null>(null)
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInitialized = useRef(false)
  const isInitialLoad = useRef(true)
  const shouldScrollRef = useRef(false)

  // Function to check if user is near bottom
  const isNearBottom = () => {
    const messageContainer = messagesEndRef.current?.parentElement
    if (!messageContainer) return false
    
    const threshold = 100 // pixels from bottom
    return messageContainer.scrollHeight - messageContainer.scrollTop - messageContainer.clientHeight <= threshold
  }

  useEffect(() => {
    if (!user || !id || chatInitialized.current) return

    chatInitialized.current = true
    let messagesUnsubscribe: (() => void) | undefined

    const initializeChat = async () => {
      try {
        // First, fetch chat data
        const chatDoc = await getDoc(doc(db, "chats", id as string))

        if (!chatDoc.exists()) {
          toast({
            title: "Chat not found",
            description: "The conversation you are looking for does not exist",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        const chatData = { 
          id: chatDoc.id, 
          ...chatDoc.data() 
        } as ChatData
        setChat(chatData)

        // Get the other participant's info
        const otherParticipantId = chatData.participants.find((pid: string) => pid !== user.uid)
        if (otherParticipantId) {
          const userDoc = await getDoc(doc(db, "users", otherParticipantId))
          if (userDoc.exists()) {
            setOtherUser({
              id: userDoc.id,
              displayName: userDoc.data().displayName,
              photoURL: userDoc.data().photoURL,
            })
          }
        }

        // Set up messages subscription only after chat data is loaded
        const messagesQuery = query(
          collection(db, "chats", id as string, "messages"),
          orderBy("createdAt", "asc")
        )

        messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const messagesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[]

          const wasNearBottom = isNearBottom()
          setMessages(messagesData)

          // Only scroll if it's initial load or user was already near bottom
          if (isInitialLoad.current || wasNearBottom) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: isInitialLoad.current ? 'auto' : 'smooth' })
              isInitialLoad.current = false
            }, 100)
          }
        })

        // Set up presence subscription
        let presenceSub: (() => void) | undefined
        if (chatData.participants) {
          const otherUserId = chatData.participants.find(pid => pid !== user.uid)
          if (otherUserId) {
            presenceSub = subscribeToUserPresence(otherUserId, setIsOtherUserOnline)
          }
        }

        setLoading(false)

        return () => {
          if (messagesUnsubscribe) messagesUnsubscribe()
          if (presenceSub) presenceSub()
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    initializeChat()

    return () => {
      if (messagesUnsubscribe) messagesUnsubscribe()
    }
  }, [id, user, toast])

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!messageText.trim() || !user || !chat) return

    setSending(true)
    const form = e.currentTarget
    const messageToSend = messageText.trim()
    shouldScrollRef.current = true

    try {
      // Clear input immediately
      setMessageText("")
      form.reset()

      // Add message to chat's messages subcollection
      const messageData = {
        chatId: id,
        senderId: user.uid,
        text: messageToSend,
        createdAt: serverTimestamp(),
        read: false,
        readAt: null
      }

      await addDoc(collection(db, "chats", id as string, "messages"), messageData)

      // Update chat with last message and unread status
      await updateDoc(doc(db, "chats", id as string), {
        lastMessage: messageToSend,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: user.uid,
        unreadCount: {
          [chat.participants.find(pid => pid !== user.uid)]: increment(1)
        }
      })

      // Scroll to bottom after sending own message
      if (shouldScrollRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      // Only show error toast if it's not a "document already exists" error
      if (!error.message?.includes("Document already exists")) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
        // Restore the message text if sending failed
        setMessageText(messageToSend)
      }
    } finally {
      setSending(false)
      shouldScrollRef.current = false
    }
  }

  // Add useEffect to mark messages as read when viewed
  useEffect(() => {
    if (!user || !chat || messages.length === 0) return

    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => !msg.read && msg.senderId !== user.uid
      )

      if (unreadMessages.length === 0) return

      // Mark messages as read
      const batch = writeBatch(db)
      unreadMessages.forEach(msg => {
        const msgRef = doc(db, "chats", id as string, "messages", msg.id)
        batch.update(msgRef, { 
          read: true,
          readAt: serverTimestamp()
        })
      })

      // Update chat unread count
      const chatRef = doc(db, "chats", id as string)
      batch.update(chatRef, {
        [`unreadCount.${user.uid}`]: 0
      })

      await batch.commit()
    }

    markMessagesAsRead()
  }, [messages, user, chat, id])

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view your messages</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
            <p className="text-muted-foreground mb-4">
              The conversation you are looking for does not exist or has been deleted
            </p>
            <Button asChild>
              <Link href="/messages">Back to Messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-4 pb-4 border-b">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/messages">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser?.photoURL || undefined} alt={otherUser?.displayName || "User"} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{otherUser?.displayName || "User"}</h2>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isOtherUserOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
                <span className="text-xs text-muted-foreground">
                  {isOtherUserOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {chat.productId && (
            <div className="ml-auto flex items-center gap-2 bg-muted p-2 rounded-md">
              <div className="relative h-10 w-10 overflow-hidden rounded">
                <Image
                  src={chat.productImage || "/placeholder.svg?height=40&width=40"}
                  alt={chat.productTitle || "Product image"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-medium">{chat.productTitle}</p>
                <Link href={`/products/${chat.productId}`} className="text-xs text-blue-600 hover:underline">
                  View Product
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : !chat ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">Chat not found</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === user.uid

              return (
                <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className={isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}>
                        {message.createdAt
                          ? formatDistanceToNow(new Date(message.createdAt.seconds * 1000), { addSuffix: true })
                          : "Just now"}
                      </span>
                      {isOwnMessage && (
                        <span className="ml-2">
                          {message.read ? (
                            <Check className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Check className="h-4 w-4 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !messageText.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
