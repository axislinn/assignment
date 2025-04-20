import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

interface PasswordResetFormProps {
  onSuccess?: () => void
  email?: string
  hideLabel?: boolean
}

export function PasswordResetForm({ onSuccess, email = "", hideLabel = false }: PasswordResetFormProps) {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Starting password reset for email:", values.email)
    setIsLoading(true)
    
    // Test toast
    toast({
      title: "Processing request",
      description: "Attempting to send password reset email...",
    })

    try {
      await resetPassword(values.email)
      console.log("Firebase resetPassword function completed")
      
      toast({
        title: "Success",
        description: "If an account exists with this email, you will receive a password reset link shortly.",
        duration: 5000, // Show for 5 seconds
      })
      
      if (onSuccess) {
        console.log("Calling onSuccess callback")
        onSuccess()
      }
    } catch (error: any) {
      console.error("Detailed password reset error:", {
        code: error.code,
        message: error.message,
        email: values.email,
        timestamp: new Date().toISOString(),
        stack: error.stack
      })
      
      toast({
        title: "Error sending reset email",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
        duration: 5000, // Show for 5 seconds
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              {!hideLabel && <FormLabel>Email</FormLabel>}
              <FormControl>
                <Input
                  placeholder="Enter your email address"
                  type="email"
                  className="bg-muted"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  )
} 