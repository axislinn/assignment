import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PasswordResetForm } from "./password-reset-form"
import { useState } from "react"

interface PasswordResetDialogProps {
  trigger: React.ReactNode
  email?: string
}

export function PasswordResetDialog({ trigger, email }: PasswordResetDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <PasswordResetForm 
          email={email} 
          onSuccess={() => setOpen(false)}
          hideLabel 
        />
      </DialogContent>
    </Dialog>
  )
} 