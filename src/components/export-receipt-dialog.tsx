import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">Order Confirmed!</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-sm sm:text-base text-muted-foreground">
            Your order has been successfully placed. Would you like to export the receipt as a PDF?
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onSkip}
            className="w-full sm:w-32"
          >
            No, Skip
          </Button>
          <Button
            onClick={onExport}
            className="w-full sm:w-32"
          >
            Yes, Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 