import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Package, Clock, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Shipping Policy | SecondChance Marketplace",
  description: "Learn about shipping options, costs, and policies on SecondChance Marketplace",
}

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Shipping Policy</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Learn about our shipping options, delivery times, and policies for both buyers and sellers.
        </p>
      </div>

      <Tabs defaultValue="overview" className="mb-12">
        <TabsList className="mb-8 flex w-full flex-wrap justify-center gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="buyers">For Buyers</TabsTrigger>
          <TabsTrigger value="sellers">For Sellers</TabsTrigger>
          <TabsTrigger value="international">International Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Truck className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Shipping Options</h3>
                <p className="text-muted-foreground">
                  We offer various shipping methods to meet your needs, from standard to express delivery.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Package className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Packaging</h3>
                <p className="text-muted-foreground">
                  All items should be securely packaged to ensure they arrive in the condition described.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Clock className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Delivery Times</h3>
                <p className="text-muted-foreground">
                  Delivery times vary by location and shipping method, typically ranging from 2-7 business days.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <Shield className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Shipping Protection</h3>
                <p className="text-muted-foreground">
                  We offer shipping protection for eligible purchases to safeguard against loss or damage.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-2xl font-bold">General Shipping Information</h2>
            <p className="mb-4 text-muted-foreground">
              SecondChance Marketplace connects buyers and sellers directly. While we provide the platform for these
              transactions, shipping arrangements are primarily between the buyer and seller. However, we have
              established guidelines to ensure a smooth shipping process for all parties.
            </p>
            <p className="text-muted-foreground">
              All sellers are required to ship items within 3 business days of receiving payment and to provide tracking
              information when available. Buyers should expect to receive their items within the timeframe specified in
              the product listing.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="buyers">
          <Card>
            <CardHeader>
              <CardTitle>Information for Buyers</CardTitle>
              <CardDescription>
                What you need to know about shipping when purchasing items on SecondChance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-bold">Shipping Costs</h3>
                <p className="text-muted-foreground">
                  Shipping costs are set by individual sellers and will be clearly displayed on the product listing
                  before you make a purchase. Some sellers offer free shipping, while others charge based on location
                  and package weight.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Tracking Your Order</h3>
                <p className="text-muted-foreground">
                  Once your item has been shipped, you'll receive a notification with tracking information (when
                  available). You can also find this information in your order history on your account dashboard.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Delivery Issues</h3>
                <p className="text-muted-foreground">
                  If you experience any issues with delivery, such as delays or damaged packages, please contact the
                  seller first. If you can't resolve the issue with the seller, our customer support team is here to
                  help.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Estimated Delivery Times</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipping Method</TableHead>
                      <TableHead>Domestic Delivery</TableHead>
                      <TableHead>International Delivery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Standard Shipping</TableCell>
                      <TableCell>3-7 business days</TableCell>
                      <TableCell>10-20 business days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expedited Shipping</TableCell>
                      <TableCell>2-3 business days</TableCell>
                      <TableCell>5-10 business days</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Express Shipping</TableCell>
                      <TableCell>1-2 business days</TableCell>
                      <TableCell>3-5 business days</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Information for Sellers</CardTitle>
              <CardDescription>Guidelines and best practices for shipping items to buyers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-bold">Shipping Timeframes</h3>
                <p className="text-muted-foreground">
                  As a seller, you're expected to ship items within 3 business days of receiving payment. If you need
                  more time, please communicate with the buyer. Failure to ship items in a timely manner may affect your
                  seller rating.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Packaging Guidelines</h3>
                <p className="text-muted-foreground">
                  Items should be packaged securely to prevent damage during transit. Use appropriate packaging
                  materials such as bubble wrap, packing peanuts, or air pillows for fragile items. Make sure the
                  shipping label is clearly visible and protected from the elements.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Shipping Carriers</h3>
                <p className="text-muted-foreground">
                  You're free to use any reputable shipping carrier of your choice. Popular options include USPS, FedEx,
                  UPS, and DHL. We recommend using carriers that provide tracking information to ensure transparency for
                  both you and the buyer.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Setting Shipping Costs</h3>
                <p className="text-muted-foreground">
                  When listing an item, you can choose to offer free shipping (absorbing the cost yourself) or charge a
                  shipping fee. Be transparent about shipping costs and consider offering multiple shipping options to
                  accommodate different buyer preferences.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="international">
          <Card>
            <CardHeader>
              <CardTitle>International Shipping</CardTitle>
              <CardDescription>Information about shipping items internationally on SecondChance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-bold">Customs and Duties</h3>
                <p className="text-muted-foreground">
                  International shipments may be subject to customs fees, import duties, and taxes imposed by the
                  destination country. These fees are typically the responsibility of the buyer and are not included in
                  the shipping cost. Sellers should clearly state this in their international shipping policies.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Customs Documentation</h3>
                <p className="text-muted-foreground">
                  When shipping internationally, sellers are responsible for completing all necessary customs forms
                  accurately. This includes providing a detailed description of the item, its value, and whether it's a
                  gift or merchandise.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Restricted Items</h3>
                <p className="text-muted-foreground">
                  Many countries have restrictions on what can be imported. Before shipping internationally, sellers
                  should verify that the item can legally be shipped to the destination country. Items like electronics,
                  food, and certain materials may be subject to additional restrictions.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">International Shipping Carriers</h3>
                <p className="text-muted-foreground">
                  For international shipping, we recommend using carriers with global networks such as DHL, FedEx, UPS,
                  or your country's postal service international options. These carriers typically provide reliable
                  tracking and delivery confirmation.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Need More Information?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          If you have specific questions about shipping that aren't covered here, please don't hesitate to contact our
          support team.
        </p>
        <Link href="/contact">
          <Button>Contact Support</Button>
        </Link>
      </div>
    </div>
  )
}
