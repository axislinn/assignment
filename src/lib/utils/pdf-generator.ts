import jsPDF from 'jspdf'
import { ReceiptHistory } from '@/lib/firebase/collections'
import { format } from 'date-fns'

export function generateReceiptPDF(receipt: Omit<ReceiptHistory, 'createdAt' | 'updatedAt'>) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = 20

  // Add header
  doc.setFontSize(24)
  doc.text('SecondChance Marketplace', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  doc.setFontSize(16)
  doc.text('Order Receipt', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  doc.setFontSize(12)
  doc.text(format(new Date(), 'PPP'), pageWidth / 2, yPos, { align: 'center' })
  yPos += 20

  // Order Information
  doc.setFontSize(14)
  doc.text('Order Information', margin, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.text(`Order ID: ${receipt.orderId}`, margin, yPos)
  yPos += 7
  doc.text(`Date: ${format(new Date(), 'PPP')}`, margin, yPos)
  yPos += 7
  doc.text(`Payment Method: ${receipt.paymentMethod}`, margin, yPos)
  yPos += 20

  // Product Details
  doc.setFontSize(14)
  doc.text('Product Details', margin, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.text(`Product: ${receipt.productTitle}`, margin, yPos)
  yPos += 7
  doc.text(`Quantity: ${receipt.quantity}`, margin, yPos)
  yPos += 7
  doc.text(`Price: $${receipt.price.toFixed(2)}`, margin, yPos)
  yPos += 20

  // Price Breakdown
  doc.setFontSize(14)
  doc.text('Price Breakdown', margin, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.text(`Subtotal: $${receipt.subtotal.toFixed(2)}`, margin, yPos)
  yPos += 7
  doc.text(`Shipping: $${receipt.shipping.toFixed(2)}`, margin, yPos)
  yPos += 7
  doc.text(`Tax: $${receipt.tax.toFixed(2)}`, margin, yPos)
  yPos += 7

  // Total
  doc.setFontSize(14)
  doc.text(`Total: $${receipt.total.toFixed(2)}`, margin, yPos)
  yPos += 20

  // Footer
  doc.setFontSize(10)
  doc.text('Thank you for your purchase!', pageWidth / 2, yPos, { align: 'center' })
  yPos += 7
  doc.text('SecondChance Marketplace', pageWidth / 2, yPos, { align: 'center' })

  // Save the PDF
  doc.save(`receipt-${receipt.orderId}.pdf`)
} 