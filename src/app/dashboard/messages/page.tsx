"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Search, User } from 'lucide-react'

interface Chat {
  id: string
  participants: string[]
  productId: string
  productTitle: string
  productImage: string
  lastMessage: string | null
  lastMessageTime: any
}

export default function DashboardMessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    )
    
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[]
      
      setChats(chatsData)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [user, router])
  
  const filteredChats = chats.filter((chat) =>
    chat.productTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <DashboardShell>
      <DashboardShell.Header>
        <DashboardShell.Title>Messages</DashboardShell.Title>
        <DashboardShell.Description>
          Manage your conversations with buyers and sellers
        </DashboardShell.Description>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="w-full min-w-[200px] pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </DashboardShell.Header>
      <DashboardShell.Content>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-4">No messages found</p>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : "Start a conversation by contacting a seller from a product page"}
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat) => {
              const otherParticipantId = chat.participants.find((id) => id !== user?.uid)
              
              return (
                <Link key={chat.id} href={`/dashboard/messages/${chat.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chat.productImage} alt={chat.productTitle} />
                        <AvatarFallback>{chat.productTitle?.[0] || "P"}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold truncate">{chat.productTitle}</h3>
                          {chat.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(chat.lastMessageTime.seconds * 1000), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || "No messages yet"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </DashboardShell.Content>
    </DashboardShell>
  )
}
