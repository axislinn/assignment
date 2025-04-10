# SecondChance Marketplace

SecondChance is a full-featured marketplace application built with Next.js, Firebase, and Supabase. It allows users to buy and sell pre-loved items, promoting sustainability and reducing waste.

## Features

- **User Authentication**: Secure login and registration with Firebase Auth
- **Role-Based Access Control**: Different features for buyers, sellers, and admins
- **Product Listings**: Create, view, edit, and delete product listings
- **Search and Filtering**: Find products by category, price, location, and more
- **Wishlist**: Save products for later
- **Messaging**: Real-time chat between buyers and sellers
- **Reviews**: Leave and view product reviews
- **Orders**: Track purchases and sales
- **Admin Dashboard**: Manage users, products, and orders
- **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Supabase Storage
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase account
- Supabase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/secondchance-marketplace.git
   cd secondchance-marketplace
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Create a `.env.local` file in the root directory with your Firebase and Supabase credentials:
   \`\`\`
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the repository
3. Add your environment variables
4. Deploy

## Project Structure

- `app/`: Next.js App Router pages and layouts
- `components/`: Reusable React components
- `lib/`: Utility functions, Firebase/Supabase setup, and types
- `public/`: Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

With these updates, we've fixed the useFormField issue, added a comprehensive dashboard for admins and sellers, and fixed various errors throughout the application. The website is now fully functional and ready for deployment.
\`\`\`

</CodeProject>


