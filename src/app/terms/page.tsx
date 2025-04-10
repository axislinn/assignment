import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "SecondChance Marketplace terms of service and user agreement.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          <p>Last Updated: July 1, 2023</p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using SecondChance Marketplace, you agree to be bound by these Terms of Service. If you do
            not agree to these terms, please do not use our service.
          </p>

          <h2>Eligibility</h2>
          <p>
            You must be at least 18 years old to use SecondChance Marketplace. By using our service, you represent and
            warrant that you meet this requirement.
          </p>

          <h2>User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate and complete information. You are responsible
            for maintaining the confidentiality of your account credentials and for all activities that occur under your
            account.
          </p>

          <h2>Marketplace Rules</h2>
          <p>As a user of SecondChance Marketplace, you agree to:</p>
          <ul>
            <li>Provide accurate descriptions and images of items you list for sale</li>
            <li>Honor commitments to buy or sell items</li>
            <li>Communicate promptly and respectfully with other users</li>
            <li>Not list prohibited items (illegal goods, hazardous materials, counterfeit items, etc.)</li>
            <li>Not engage in fraudulent or deceptive practices</li>
          </ul>

          <h2>Fees and Payments</h2>
          <p>
            Listing items on SecondChance is free. We charge a 5% commission on successful sales. Payment processing
            fees may also apply. All fees are non-refundable unless required by law.
          </p>

          <h2>Buyer and Seller Responsibilities</h2>
          <p>
            <strong>Sellers</strong> are responsible for accurately describing items, setting fair prices, and shipping
            items promptly after sale.
          </p>
          <p>
            <strong>Buyers</strong> are responsible for reviewing item descriptions before purchase, making prompt
            payment, and communicating shipping preferences.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            The SecondChance service, including all content, features, and functionality, is owned by us and is
            protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, SecondChance shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use or inability to use the service.
          </p>

          <h2>Dispute Resolution</h2>
          <p>
            Any dispute arising from these Terms shall be resolved through binding arbitration in accordance with the
            rules of the American Arbitration Association.
          </p>

          <h2>Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service at our sole discretion, without notice,
            for conduct that we determine violates these Terms or is harmful to other users, us, or third parties.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of any changes by posting the new Terms on this
            page and updating the "Last Updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at legal@secondchance.com.</p>
        </div>
      </div>
    </div>
  )
}
