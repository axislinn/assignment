import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftRight, ShieldCheck, AlertCircle, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Returns & Refunds | SecondChance Marketplace",
  description: "Learn about the returns and refunds policy on SecondChance Marketplace",
}

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Returns & Refunds Policy</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Learn about our returns process, refund eligibility, and how we handle disputes between buyers and sellers.
        </p>
      </div>

      <Tabs defaultValue="overview" className="mb-12">
        <TabsList className="mb-8 flex w-full flex-wrap justify-center gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="buyers">For Buyers</TabsTrigger>
          <TabsTrigger value="sellers">For Sellers</TabsTrigger>
          <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <ArrowLeftRight className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Return Process</h3>
                <p className="text-muted-foreground">
                  Our streamlined return process makes it easy to return items that don't meet your expectations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <ShieldCheck className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Buyer Protection</h3>
                <p className="text-muted-foreground">
                  Our Buyer Protection program ensures you receive the item as described or get your money back.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Return Eligibility</h3>
                <p className="text-muted-foreground">
                  Learn what items are eligible for returns and the timeframes for initiating a return request.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <HelpCircle className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-bold">Support</h3>
                <p className="text-muted-foreground">
                  Our support team is here to help with any questions or issues related to returns and refunds.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-2xl font-bold">General Return Information</h2>
            <p className="mb-4 text-muted-foreground">
              At SecondChance Marketplace, we understand that sometimes items may not meet your expectations. Our
              returns policy is designed to be fair to both buyers and sellers, ensuring a positive experience for
              everyone on our platform.
            </p>
            <p className="text-muted-foreground">
              While individual sellers may have their own return policies (which will be clearly stated on their
              listings), all transactions on SecondChance are covered by our basic return guidelines. These ensure that
              buyers receive items as described and sellers are protected from unreasonable return requests.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="buyers">
          <Card>
            <CardHeader>
              <CardTitle>Information for Buyers</CardTitle>
              <CardDescription>
                What you need to know about returns and refunds when purchasing on SecondChance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-bold">Return Eligibility</h3>
                <p className="mb-2 text-muted-foreground">You may be eligible for a return or refund if:</p>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  <li>The item received is significantly different from the description or photos</li>
                  <li>The item is damaged or defective upon arrival</li>
                  <li>The wrong item was sent</li>
                  <li>The item never arrived</li>
                </ul>
                <p className="mt-2 text-muted-foreground">
                  Note that buyer's remorse or changing your mind about a purchase is not automatically grounds for a
                  return, unless the seller's policy specifically allows for this.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Return Timeframe</h3>
                <p className="text-muted-foreground">
                  Return requests must be initiated within 7 days of receiving the item. This gives you enough time to
                  inspect the item while also providing sellers with a reasonable timeframe for processing returns.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">How to Request a Return</h3>
                <ol className="ml-6 list-decimal space-y-1 text-muted-foreground">
                  <li>Go to your Orders page in your account dashboard</li>
                  <li>Find the order and select "Request Return"</li>
                  <li>Select a reason for the return and provide details</li>
                  <li>Upload photos if the item is damaged or not as described</li>
                  <li>Submit your request</li>
                </ol>
                <p className="mt-2 text-muted-foreground">
                  The seller will be notified of your request and has 3 days to respond. If they accept, you'll receive
                  return shipping instructions. If they decline or don't respond, you can escalate to our support team.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Refund Process</h3>
                <p className="text-muted-foreground">
                  Once the seller receives the returned item and confirms its condition, your refund will be processed.
                  Refunds typically appear in your account within 3-5 business days, depending on your payment method.
                  Shipping costs may not be refunded unless the return is due to a seller error.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Information for Sellers</CardTitle>
              <CardDescription>Guidelines for handling returns and refunds as a seller on SecondChance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-bold">Setting Your Return Policy</h3>
                <p className="text-muted-foreground">
                  As a seller, you can set your own return policy for your listings. This can be more generous than our
                  platform's basic policy, but cannot be more restrictive. Your return policy should be clearly stated
                  in your listing descriptions to set proper expectations for buyers.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Handling Return Requests</h3>
                <p className="text-muted-foreground">
                  When you receive a return request, you have 3 days to respond. You can accept the return, decline with
                  a reason, or offer an alternative solution such as a partial refund. We encourage open communication
                  with the buyer to resolve any issues amicably.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Return Shipping</h3>
                <p className="text-muted-foreground">
                  If a return is due to an error on your part (item not as described, wrong item sent, etc.), you are
                  responsible for return shipping costs. If the return is for other reasons, you can specify in your
                  policy whether the buyer or seller covers return shipping.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Best Practices</h3>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  <li>Provide accurate and detailed descriptions and photos of your items</li>
                  <li>Clearly state any flaws or imperfections</li>
                  <li>Package items securely to prevent damage during shipping</li>
                  <li>Respond promptly to buyer inquiries and return requests</li>
                  <li>Consider offering a reasonable return window to increase buyer confidence</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Resolution</CardTitle>
              <CardDescription>How we handle disagreements between buyers and sellers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-bold">When to Open a Dispute</h3>
                <p className="text-muted-foreground">
                  If you and the other party cannot reach an agreement regarding a return or refund, you can open a
                  dispute through our platform. This should be done only after you've attempted to resolve the issue
                  directly with the buyer/seller.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Dispute Process</h3>
                <ol className="ml-6 list-decimal space-y-1 text-muted-foreground">
                  <li>Go to the order in question and select "Open Dispute"</li>
                  <li>Provide all relevant information and evidence (photos, messages, etc.)</li>
                  <li>The other party will be notified and given a chance to respond</li>
                  <li>Our support team will review all information from both sides</li>
                  <li>A decision will be made based on our policies and the evidence provided</li>
                </ol>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Dispute Resolution Timeframe</h3>
                <p className="text-muted-foreground">
                  Most disputes are resolved within 5-7 business days. During this time, any funds related to the
                  transaction will be held securely. We strive to be fair and thorough in our review process to ensure
                  the best outcome for all parties involved.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-bold">Possible Outcomes</h3>
                <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
                  <li>Full refund to the buyer (with or without return of the item)</li>
                  <li>Partial refund to the buyer</li>
                  <li>No refund (transaction stands as completed)</li>
                  <li>Other resolution as determined appropriate by our team</li>
                </ul>
                <p className="mt-2 text-muted-foreground">
                  Our decisions are based on our platform policies, the evidence provided, and what we determine to be
                  fair to both parties. Decisions made by our dispute resolution team are final.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Have Questions About Returns?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          If you have specific questions about returns or refunds that aren't covered here, our support team is ready to
          help.
        </p>
        <Link href="/contact">
          <Button>Contact Support</Button>
        </Link>
      </div>
    </div>
  )
}
