import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about SecondChance Marketplace.",
}

export default function FAQPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">
          Find answers to the most common questions about SecondChance Marketplace.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does SecondChance work?</AccordionTrigger>
            <AccordionContent>
              SecondChance is a platform that connects buyers and sellers of pre-loved items. Sellers can list their
              items for free, and buyers can browse, purchase, and arrange pickup or delivery. We handle the payment
              processing to ensure a safe and secure transaction for both parties.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it free to list items?</AccordionTrigger>
            <AccordionContent>
              Yes, listing items on SecondChance is completely free. We only charge a small commission (5%) when an item
              sells successfully. This helps us maintain the platform and provide customer support.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How do I know the items are in good condition?</AccordionTrigger>
            <AccordionContent>
              Sellers are required to accurately describe the condition of their items and provide clear photos from
              multiple angles. We also have a review system so you can see feedback from previous buyers. If an item
              arrives significantly different from its description, our buyer protection policy may cover you.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
            <AccordionContent>
              We accept all major credit and debit cards, as well as PayPal. All payments are processed securely through
              our platform to protect both buyers and sellers.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>How is shipping handled?</AccordionTrigger>
            <AccordionContent>
              Shipping arrangements are typically made between the buyer and seller after purchase. Sellers can offer
              local pickup, delivery, or shipping options. The cost of shipping is usually added to the item price or
              paid separately by the buyer.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>What if I'm not satisfied with my purchase?</AccordionTrigger>
            <AccordionContent>
              If you receive an item that is significantly different from its description, you can file a claim under
              our buyer protection policy within 48 hours of receiving the item. Our support team will review your case
              and may offer a refund if appropriate. For items that simply don't meet your expectations but were
              accurately described, returns are at the seller's discretion.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <AccordionTrigger>How do I become a seller?</AccordionTrigger>
            <AccordionContent>
              Anyone can become a seller on SecondChance! Simply create an account, verify your email, and select the
              "seller" role during registration. Once your account is set up, you can start listing items right away.
              For high-volume sellers, we offer additional features and reduced commission rates.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <AccordionTrigger>Is my personal information secure?</AccordionTrigger>
            <AccordionContent>
              Yes, we take data security very seriously. We use industry-standard encryption to protect your personal
              and payment information. We never share your data with third parties without your consent, except as
              required to provide our services (such as processing payments). You can review our Privacy Policy for more
              details.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-9">
            <AccordionTrigger>How can I contact customer support?</AccordionTrigger>
            <AccordionContent>
              You can reach our customer support team through the Contact page on our website, by emailing
              support@secondchance.com, or by calling (123) 456-7890 during business hours (Monday-Friday, 9am-5pm PT).
              We aim to respond to all inquiries within 24 hours.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-10">
            <AccordionTrigger>Can I sell any type of item?</AccordionTrigger>
            <AccordionContent>
              While we welcome a wide variety of items, there are some restrictions. Prohibited items include: illegal
              goods, hazardous materials, recalled products, counterfeit items, and adult content. All listings are
              reviewed before being published to ensure they meet our community guidelines.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
        <p className="mb-6 text-muted-foreground">
          If you couldn't find the answer you were looking for, please don't hesitate to reach out to our support team.
        </p>
        <Button asChild size="lg">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  )
}
