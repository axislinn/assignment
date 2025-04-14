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
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  chatId: string
  senderId: string
  text: string
  createdAt: any
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

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    const fetchChatData = async () => {
      try {
        const chatDoc = await getDoc(doc(db, "chats", id as string))

        if (chatDoc.exists()) {
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
        } else {
          toast({
            title: "Chat not found",
            description: "The conversation you are looking for does not exist",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching chat:", error)
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChatData()

    // Subscribe to messages
    const messagesQuery = query(collection(db, "messages"), where("chatId", "==", id), orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]

      setMessages(messagesData)

      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    })

    return () => unsubscribe()
  }, [id, user, toast])

  useEffect(() => {
    // Scroll to bottom on initial load
    messagesEndRef.current?.scrollIntoView()
  }, [loading])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageText.trim() || !user || !chat) return

    setSending(true)

    try {
      // Add message to Firestore
      const messageData = {
        chatId: id,
        senderId: user.uid,
        text: messageText,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "messages"), messageData)

      // Update chat with last message
      await updateDoc(doc(db, "chats", id as string), {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
      })

      // Clear input
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

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
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Online</span>
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
          {messages.length === 0 ? (
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
                    <p
                      className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {message.createdAt
                        ? formatDistanceToNow(new Date(message.createdAt.seconds * 1000), { addSuffix: true })
                        : "Just now"}
                    </p>
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
