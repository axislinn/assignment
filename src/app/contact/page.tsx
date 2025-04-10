import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the SecondChance Marketplace team. We're here to help!",
}

export default function ContactPage() {
  return <ContactPageClient />
}
