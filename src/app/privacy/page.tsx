import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SecondChance Marketplace privacy policy and data protection information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          <p>Last Updated: July 1, 2023</p>

          <h2>Introduction</h2>
          <p>
            At SecondChance Marketplace ("we," "our," or "us"), we respect your privacy and are committed to protecting
            your personal data. This privacy policy explains how we collect, use, and safeguard your information when
            you use our website and services.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect several types of information from and about users of our website, including:</p>
          <ul>
            <li>Personal identifiers such as name, email address, phone number, and postal address</li>
            <li>Account credentials including username and password</li>
            <li>Transaction information when you buy or sell items</li>
            <li>Communications between users regarding marketplace listings</li>
            <li>Device and usage information collected automatically when you visit our site</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Create and maintain your account</li>
            <li>Connect buyers and sellers</li>
            <li>Send notifications and updates about our service</li>
            <li>Respond to your comments and questions</li>
            <li>Protect against fraudulent or illegal activity</li>
          </ul>

          <h2>Sharing Your Information</h2>
          <p>We may share your personal information with:</p>
          <ul>
            <li>Other users as necessary to facilitate transactions</li>
            <li>Service providers who perform services on our behalf</li>
            <li>Law enforcement or other parties when required by law</li>
          </ul>

          <h2>Your Rights and Choices</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul>
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Restriction or objection to certain processing activities</li>
            <li>Data portability</li>
          </ul>

          <h2>Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information from
            unauthorized access, disclosure, alteration, or destruction.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new
            policy on this page and updating the "Last Updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us at
            privacy@secondchance.com.
          </p>
        </div>
      </div>
    </div>
  )
}
