import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReceiptHistory } from "@/lib/firebase/collections"
import { format } from "date-fns"

interface ReceiptVoucherProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  orderData: Omit<ReceiptHistory, 'createdAt' | 'updatedAt' | 'status'>
}

export function ReceiptVoucher({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  orderData,
}: ReceiptVoucherProps) {
  if (!orderData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onCancel()
      }
    }}>
      <DialogContent className="max-w-[210mm] w-[210mm] p-8 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">Order Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-semibold">SecondChance Marketplace</h2>
            <p className="text-sm text-muted-foreground">Order Receipt</p>
            <p className="text-sm text-muted-foreground">{format(new Date(), 'PPP')}</p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Order Information</h3>
              <p className="text-sm">Order ID: {orderData.orderId}</p>
              <p className="text-sm">Date: {format(new Date(), 'PPP')}</p>
              <p className="text-sm">Buyer: {orderData.buyerName}</p>
              <p className="text-sm">Seller: {orderData.sellerName}</p>
            </div>
            <div>
              <h3 className="font-medium">Payment Method</h3>
              <p className="text-sm capitalize">{orderData.paymentMethod}</p>
            </div>
          </div>

          {/* Product Details */}
          <h3 className="font-medium mb-2">Product Details</h3>
          <div className="space-y-4">
            {orderData.products.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <img
                  src={product.productImage}
                  alt={product.productTitle}
                  className="h-20 w-20 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{product.productTitle}</p>
                  <p className="text-sm">Quantity: {product.quantity}</p>
                  <p className="text-sm">Price: ${product.price.toFixed(2)}</p>
                  <p className="text-sm">Subtotal: ${product.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div>
            <h3 className="font-medium mb-2">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${orderData.products.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${orderData.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-32"
          >
            Cancel Order
          </Button>
          <Button
            onClick={onConfirm}
            className="w-32"
          >
            Confirm Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 