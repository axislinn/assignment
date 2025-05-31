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
  doc.text(`Buyer: ${receipt.buyerName || ''}`, margin, yPos)
  yPos += 7
  doc.text(`Payment Method: ${receipt.paymentMethod}`, margin, yPos)
  yPos += 20

  // Group products by seller
  const productsBySeller = receipt.products.reduce((acc, product) => {
    const sellerKey = `${product.sellerId}-${product.sellerName}`
    if (!acc[sellerKey]) {
      acc[sellerKey] = {
        sellerName: product.sellerName,
        products: []
      }
    }
    acc[sellerKey].products.push(product)
    return acc
  }, {} as Record<string, { sellerName: string; products: typeof receipt.products }>)

  // Product Details
  doc.setFontSize(14)
  doc.text('Product Details', margin, yPos)
  yPos += 10

  // Add products grouped by seller
  Object.values(productsBySeller).forEach(({ sellerName, products }) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    // Seller header
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Seller: ${sellerName}`, margin, yPos)
    yPos += 10

    // Table header
    doc.setFont('helvetica', 'normal')
    doc.text('Product', margin, yPos)
    doc.text('Quantity', margin + 80, yPos)
    doc.text('Price', margin + 120, yPos)
    doc.text('Subtotal', margin + 160, yPos)
    yPos += 10

    // Add products for this seller
    products.forEach(product => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.text(product.productTitle, margin, yPos)
      doc.text(product.quantity.toString(), margin + 80, yPos)
      doc.text(`$${product.price.toFixed(2)}`, margin + 120, yPos)
      doc.text(`$${product.subtotal.toFixed(2)}`, margin + 160, yPos)
      yPos += 10
    })

    yPos += 10 // Add space between sellers
  })

  // Check if we need a new page for price breakdown
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  // Price Breakdown
  doc.setFontSize(14)
  doc.text('Price Breakdown', margin, yPos)
  yPos += 10

  doc.setFontSize(12)
  const subtotal = receipt.products.reduce((sum, p) => sum + p.subtotal, 0)
  doc.text(`Subtotal: $${subtotal.toFixed(2)}`, margin, yPos)
  yPos += 7
  doc.text(`Shipping: $${receipt.shipping.toFixed(2)}`, margin, yPos)
  yPos += 7
  doc.text(`Tax: $${receipt.tax.toFixed(2)}`, margin, yPos)
  yPos += 7

  // Total
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total: $${receipt.total.toFixed(2)}`, margin, yPos)
  yPos += 20

  // Footer
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Thank you for your purchase!', pageWidth / 2, yPos, { align: 'center' })
  yPos += 7
  doc.text('SecondChance Marketplace', pageWidth / 2, yPos, { align: 'center' })

  // Save the PDF
  doc.save(`receipt-${receipt.orderId}.pdf`)
} 