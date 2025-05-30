"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, getDocs, getFirestore, where, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from "date-fns"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ReceiptVoucher } from "@/components/receipt-voucher"
import { generateReceiptPDF } from '@/lib/utils/pdf-generator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/lib/auth-context'

interface Receipt {
    id: string
    name: string
    productPrice: number
    buyingDate: Date
    orderId?: string
    buyerId?: string
    buyerName?: string
    sellerId?: string
    sellerName?: string
    productId?: string
    productTitle?: string
    productImage?: string
    quantity?: number
    price?: number
    subtotal?: number
    shipping?: number
    tax?: number
    total?: number
    paymentMethod?: string
    status?: string
    products?: {
        productImage: string
        productTitle: string
        quantity: number
        price: number
        subtotal: number
        sellerId: string
        sellerName: string
    }[]
}

export default function ReceiptHistoryPage() {
    const { user, userRole, loading: authLoading } = useAuth();
    const [receipts, setReceipts] = useState<Receipt[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
    const [showModal, setShowModal] = useState(false)

    // Block sellers immediately
    if (!authLoading && userRole === "seller") {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                <p className="text-muted-foreground">Sellers do not have access to receipt history.</p>
            </div>
        );
    }

    useEffect(() => {
        if (authLoading || !user || !userRole) return;
        const fetchReceipts = async () => {
            try {
                let q;
                if (userRole === "admin") {
                    q = collection(db, "receipt_history");
                } else if (userRole === "buyer") {
                    q = query(collection(db, "receipt_history"), where("buyerId", "==", user.uid));
                } else {
                    setReceipts([]);
                    setLoading(false);
                    return;
                }
                const querySnapshot = await getDocs(q);
                const receiptsData = await Promise.all(querySnapshot.docs.map(async docSnapshot => {
                    const data = docSnapshot.data();
                    return {
                        id: docSnapshot.id,
                        name: data.products?.[0]?.productTitle ?? "Multiple Products",
                        productPrice: data.total ?? 0,
                        buyingDate: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                        ...data
                    }
                }));
                receiptsData.sort((a, b) => b.buyingDate.getTime() - a.buyingDate.getTime())
                setReceipts(receiptsData)
            } catch (error) {
                setError(error instanceof Error ? error.message : "Failed to fetch receipts")
            } finally {
                setLoading(false)
            }
        }
        fetchReceipts()
    }, [authLoading, user, userRole])

    const handleRowClick = (receipt: Receipt) => {
        setSelectedReceipt(receipt)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedReceipt(null)
    }

    const handleExportPDF = () => {
        if (selectedReceipt) {
            generateReceiptPDF(selectedReceipt as any)
        }
    }

    if (authLoading || !user || !userRole) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Receipt History</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-red-500">Error: {error}</div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Receipt History</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Order ID</TableHead>
                                    <TableHead className="whitespace-nowrap">Total Amount</TableHead>
                                    <TableHead className="whitespace-nowrap">Purchase Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {receipts.map((receipt) => (
                                    <TableRow
                                        key={receipt.id}
                                        onClick={() => handleRowClick(receipt)}
                                        className="cursor-pointer hover:bg-primary/10"
                                    >
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {receipt.orderId}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            ${receipt.total?.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {format(receipt.buyingDate, "MMM dd, yyyy HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {receipts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            No purchase history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            {showModal && selectedReceipt && (
                <Dialog open={showModal} onOpenChange={handleCloseModal}>
                    <DialogContent className="max-w-[95vw] sm:max-w-[210mm] w-full p-4 sm:p-8 max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Order Receipt</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
                            <div className="text-center">
                                <h2 className="text-lg sm:text-xl font-semibold">SecondChance Marketplace</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">Order Receipt</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">{format(new Date(), 'PPP')}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium">Order Information</h3>
                                        <p className="text-xs sm:text-sm">Order ID: {selectedReceipt.orderId}</p>
                                        <p className="text-xs sm:text-sm">Date: {format(selectedReceipt.buyingDate || new Date(), 'PPP')}</p>
                                        <p className="text-xs sm:text-sm">Buyer: {selectedReceipt.buyerName}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Payment Method</h3>
                                        <p className="text-xs sm:text-sm capitalize">{selectedReceipt.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-2">Product Details</h3>
                                    <div className="space-y-4">
                                        {selectedReceipt.products && selectedReceipt.products.length > 0 ? (
                                            selectedReceipt.products.map((product, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                    <img
                                                        src={product.productImage}
                                                        alt={product.productTitle}
                                                        className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-sm sm:text-base">{product.productTitle}</p>
                                                        <p className="text-xs sm:text-sm text-muted-foreground">Seller: {product.sellerName}</p>
                                                        <p className="text-xs sm:text-sm">Quantity: {product.quantity}</p>
                                                        <p className="text-xs sm:text-sm">Price: ${product.price.toFixed(2)}</p>
                                                        <p className="text-xs sm:text-sm">Subtotal: ${product.subtotal.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div>No products found.</div>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-2">Price Breakdown</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>${selectedReceipt.products?.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping</span>
                                            <span>${selectedReceipt.shipping?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Tax</span>
                                            <span>${selectedReceipt.tax?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t pt-2 text-sm">
                                            <span>Total</span>
                                            <span>${selectedReceipt.total?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex justify-center mt-4 sm:mt-6">
                            <Button
                                onClick={handleExportPDF}
                                className="w-full sm:w-32"
                            >
                                Export to PDF
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
} 