"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Bell, Check, MessageSquare, Package, ShoppingBag, Tag } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  type Notification,
} from "@/lib/firebase/notifications"
import { requestNotificationPermission } from "@/lib/firebase/push-notifications"

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [permissionRequested, setPermissionRequested] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?redirect=/notifications")
      return
    }

    const fetchNotifications = async () => {
      try {
        const userNotifications = await getUserNotifications(user.uid)
        setNotifications(userNotifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load your notifications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Request notification permission if not already requested
    if (!permissionRequested && "Notification" in window) {
      setPermissionRequested(true)

      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        requestNotificationPermission(user.uid)
          .then((token) => {
            if (token) {
              toast({
                title: "Notifications enabled",
                description: "You'll now receive push notifications for important updates",
              })
            }
          })
          .catch((error) => {
            console.error("Error requesting notification permission:", error)
          })
      }
    }
  }, [user, router, toast, permissionRequested])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user!.uid)

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true })),
      )

      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)

      // Update local state
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId),
      )
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "new_order":
        return <ShoppingBag className="h-5 w-5 text-blue-500" />
      case "order_status":
        return <Package className="h-5 w-5 text-green-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "product_sold":
        return <Tag className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.link) {
      return notification.link
    }

    if (notification.orderId) {
      return `/orders/${notification.orderId}`
    }

    if (notification.productId) {
      return `/products/${notification.productId}`
    }

    switch (notification.type) {
      case "message":
        return "/messages"
      case "new_order":
      case "order_status":
        return "/orders"
      default:
        return "#"
    }
  }

  if (!user) {
    return null // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some((notification) => !notification.read) && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <Check className="mr-2 h-4 w-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Bell className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No notifications</h2>
            <p className="text-center text-muted-foreground">
              You don't have any notifications yet. We'll notify you about important updates and activity.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "bg-card" : "bg-muted/20"}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {notification.createdAt.toLocaleDateString()} at{" "}
                        {notification.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link href={getNotificationLink(notification)}>
                        <Button variant="link" className="h-auto p-0 text-sm">
                          View Details
                        </Button>
                      </Link>
                      {!notification.read && (
                        <Button
                          variant="link"
                          className="h-auto p-0 text-sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm text-destructive"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
