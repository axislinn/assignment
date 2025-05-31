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
      <DialogContent className="max-w-[95vw] sm:max-w-[210mm] w-full p-4 sm:p-8 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Order Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold">SecondChance Marketplace</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Order Receipt</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{format(new Date(), 'PPP')}</p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Order Information</h3>
              <p className="text-xs sm:text-sm">Order ID: {orderData.orderId}</p>
              <p className="text-xs sm:text-sm">Date: {format(new Date(), 'PPP')}</p>
              <p className="text-xs sm:text-sm">Buyer: {orderData.buyerName}</p>
              <p className="text-xs sm:text-sm">Seller: {orderData.sellerName}</p>
            </div>
            <div>
              <h3 className="font-medium">Payment Method</h3>
              <p className="text-xs sm:text-sm capitalize">{orderData.paymentMethod}</p>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="font-medium mb-2">Product Details</h3>
            <div className="space-y-4">
              {orderData.products.map((product, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={product.productImage}
                    alt={product.productTitle}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-sm sm:text-base">{product.productTitle}</p>
                    <p className="text-xs sm:text-sm">Quantity: {product.quantity}</p>
                    <p className="text-xs sm:text-sm">Price: ${product.price.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm">Subtotal: ${product.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <h3 className="font-medium mb-2">Price Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${orderData.products.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${orderData.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 text-sm">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mt-4 sm:mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-32"
          >
            Cancel Order
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-32"
          >
            Confirm Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 