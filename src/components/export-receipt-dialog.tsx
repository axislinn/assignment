import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect } from "react"

interface ExportReceiptDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: () => void
  onSkip: () => void
}

export function ExportReceiptDialog({
  isOpen,
  onClose,
  onExport,
  onSkip,
}: ExportReceiptDialogProps) {
  useEffect(() => {
    console.log('ExportReceiptDialog mounted, isOpen:', isOpen)
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Order Confirmed!</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            Your order has been successfully placed. Would you like to export the receipt as a PDF?
          </p>
        </div>
        <DialogFooter className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onSkip}
            className="w-32"
          >
            No, Skip
          </Button>
          <Button
            onClick={onExport}
            className="w-32"
          >
            Yes, Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 