import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Code } from "@/components/ui/code"
import { Info } from "lucide-react"

export default function FirebaseSetupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Firebase Configuration Guide</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This guide will help you set up Firebase for all features of the SecondChance Marketplace. Follow each step
          carefully to ensure proper configuration.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="project" className="mb-12">
        <TabsList className="mb-8 flex w-full flex-wrap justify-center gap-2">
          <TabsTrigger value="project">Project Setup</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="firestore">Firestore Database</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="fcm">Push Notifications</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="project">
          <Card>
            <CardHeader>
              <CardTitle>Firebase Project Setup</CardTitle>
              <CardDescription>Create a new Firebase project and register your web app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Create a Firebase Project</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>
                    Go to the{" "}
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Firebase Console
                    </a>
                  </li>
                  <li>Click "Add project" and follow the setup wizard</li>
                  <li>Enter a project name (e.g., "SecondChance Marketplace")</li>
                  <li>Choose whether to enable Google Analytics (recommended)</li>
                  <li>Accept the terms and click "Create project"</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Register Your Web App</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>From your Firebase project dashboard, click the web icon (&lt;/&gt;) to add a web app</li>
                  <li>Enter a nickname for your app (e.g., "SecondChance Web")</li>
                  <li>Check the box for "Also set up Firebase Hosting" if you plan to deploy with Firebase</li>
                  <li>Click "Register app"</li>
                  <li>Copy the Firebase configuration object for your environment variables</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Set Up Environment Variables</h3>
                <p>
                  Create a <code>.env.local</code> file in the root of your project with the following variables:
                </p>
                <Code className="my-2">
                  {`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_for_web_push`}
                </Code>
                <p>Replace the placeholder values with your actual Firebase configuration.</p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Next Steps</h3>
                <p className="text-sm text-muted-foreground">
                  After setting up your Firebase project, proceed to configure Authentication, Firestore Database, and
                  Storage.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Setup</CardTitle>
              <CardDescription>Configure authentication methods for user sign-up and login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Enable Authentication Methods</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>In the Firebase Console, go to "Authentication" &gt; "Sign-in method"</li>
                  <li>
                    Enable the following authentication methods:
                    <ul className="ml-6 list-disc space-y-1 mt-2">
                      <li>Email/Password</li>
                      <li>Google</li>
                    </ul>
                  </li>
                  <li>For Google authentication, configure the OAuth consent screen if prompted</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Set Up Email Templates (Optional)</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Go to "Authentication" > "Templates"</li>
                  <li>Customize email verification, password reset, and other email templates</li>
                  <li>Add your logo and brand colors to match your marketplace design</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Configure Authentication in Your App</h3>
                <p>
                  The app is already configured to use Firebase Authentication. The main authentication logic is in:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>
                    <code>lib/auth-context.tsx</code> - Authentication context provider
                  </li>
                  <li>
                    <code>app/auth/login/page.tsx</code> - Login page
                  </li>
                  <li>
                    <code>app/auth/register/page.tsx</code> - Registration page
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Testing Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  After setting up authentication, test the sign-up and login flows to ensure they work correctly.
                  Create accounts with different roles (buyer, seller, admin) to test role-based access control.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firestore">
          <Card>
            <CardHeader>
              <CardTitle>Firestore Database Setup</CardTitle>
              <CardDescription>Configure the database and security rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Create Firestore Database</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Go to "Firestore Database" in the Firebase Console</li>
                  <li>Click "Create database"</li>
                  <li>Choose "Start in production mode" (recommended for security)</li>
                  <li>Select a location closest to your target users</li>
                  <li>Click "Enable"</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Set Up Firestore Security Rules</h3>
                <p>Go to "Firestore Database" > "Rules" tab and replace the default rules with the following:</p>
                <Code className="my-2 max-h-96 overflow-y-auto">
                  {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    function isSeller() {
      return isAuthenticated() && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "seller" ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      
      allow create: if isSeller() && request.resource.data.sellerId == request.auth.uid;
      
      allow update: if isAdmin() || 
                    (isSeller() && resource.data.sellerId == request.auth.uid);
      
      allow delete: if isAdmin() || 
                    (isSeller() && resource.data.sellerId == request.auth.uid);
    }
    
    // Wishlists collection
    match /wishlists/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    // Carts collection
    match /carts/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isAdmin() || 
                  isOwner(resource.data.buyerId) || 
                  (isSeller() && resource.data.sellerId == request.auth.uid);
      
      allow create: if isAuthenticated() && request.resource.data.buyerId == request.auth.uid;
      
      allow update: if isAdmin() || 
                    (isOwner(resource.data.buyerId) && 
                     (request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['shippingAddress', 'paymentMethod']))) ||
                    (isSeller() && 
                     resource.data.sellerId == request.auth.uid && 
                     request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['status', 'updatedAt']));
      
      allow delete: if isAdmin();
    }
    
    // Chats collection
    match /chats/{chatId} {
      allow read: if isAuthenticated() && 
                  request.auth.uid in resource.data.participants;
      
      allow create: if isAuthenticated() && 
                    request.auth.uid in request.resource.data.participants;
      
      allow update: if isAuthenticated() && 
                    request.auth.uid in resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
                    request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        
        allow create: if isAuthenticated() && 
                      request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants &&
                      request.resource.data.senderId == request.auth.uid;
      }
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && 
                  resource.data.userId == request.auth.uid;
      
      allow create: if isAdmin() || 
                    (isAuthenticated() && request.resource.data.userId == request.auth.uid);
      
      allow update: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
      
      allow delete: if isAuthenticated() && 
                    resource.data.userId == request.auth.uid;
    }
  }
}`}
                </Code>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Create Initial Data</h3>
                <p>To get your marketplace started, you'll need to create some initial data:</p>

                <h4 className="font-medium mt-4">Create Admin User</h4>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Register a regular user account through your application</li>
                  <li>Go to Firestore Database in the Firebase Console</li>
                  <li>Find your user document in the "users" collection</li>
                  <li>Edit the document and change the "role" field to "admin"</li>
                </ol>

                <h4 className="font-medium mt-4">Create Categories</h4>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>In Firestore, create a new collection called "categories"</li>
                  <li>
                    Add documents with the following structure:
                    <Code className="my-2">
                      {`{
  "id": "electronics",
  "name": "Electronics",
  "icon": "📱",
  "description": "Phones, computers, and other electronic devices"
}`}
                    </Code>
                  </li>
                  <li>Repeat for other categories like "clothing", "furniture", "books", etc.</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">4. Set Up Firestore Indexes</h3>
                <p>For complex queries to work properly, you'll need to create some composite indexes:</p>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Go to "Firestore Database" > "Indexes" tab</li>
                  <li>Click "Add index"</li>
                  <li>
                    Create the following indexes:
                    <ul className="ml-6 list-disc space-y-2 mt-2">
                      <li>
                        Collection: "products"
                        <br />
                        Fields: "category" (Ascending), "createdAt" (Descending)
                        <br />
                        Query scope: Collection
                      </li>
                      <li>
                        Collection: "products"
                        <br />
                        Fields: "sellerId" (Ascending), "createdAt" (Descending)
                        <br />
                        Query scope: Collection
                      </li>
                      <li>
                        Collection: "products"
                        <br />
                        Fields: "featured" (Ascending), "createdAt" (Descending)
                        <br />
                        Query scope: Collection
                      </li>
                      <li>
                        Collection: "orders"
                        <br />
                        Fields: "userId" (Ascending), "createdAt" (Descending)
                        <br />
                        Query scope: Collection
                      </li>
                      <li>
                        Collection: "notifications"
                        <br />
                        Fields: "userId" (Ascending), "createdAt" (Descending)
                        <br />
                        Query scope: Collection
                      </li>
                      <li>
                        Collection: "notifications"
                        <br />
                        Fields: "userId" (Ascending), "read" (Ascending)
                        <br />
                        Query scope: Collection
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Firebase Storage Setup</CardTitle>
              <CardDescription>Configure storage for product images and user uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Create Storage Bucket</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Go to "Storage" in the Firebase Console</li>
                  <li>Click "Get started"</li>
                  <li>Choose "Start in production mode"</li>
                  <li>Click "Next" and select a location</li>
                  <li>Click "Done"</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Set Up Storage Security Rules</h3>
                <p>Go to "Storage" > "Rules" tab and replace the default rules with the following:</p>
                <Code className="my-2 max-h-96 overflow-y-auto">
                  {`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    function isSeller() {
      return isAuthenticated() && 
        (firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == "seller" ||
         firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == "admin");
    }
    
    function isValidImage() {
      return request.resource.contentType.matches('image/.*') && 
             request.resource.size < 5 * 1024 * 1024; // 5MB
    }
    
    // Product images
    match /products/{imageId} {
      allow read: if true;
      allow create: if isSeller() && isValidImage();
      allow update: if isSeller() && isValidImage();
      allow delete: if isSeller() || isAdmin();
    }
    
    // User profile images
    match /users/{userId}/{imageId} {
      allow read: if true;
      allow write: if isAuthenticated() && request.auth.uid == userId && isValidImage();
    }
    
    // Order attachments
    match /orders/{orderId}/{imageId} {
      allow read: if isAuthenticated() && 
                  (firestore.get(/databases/(default)/documents/orders/$(orderId)).data.userId == request.auth.uid ||
                   isAdmin());
      allow write: if isAuthenticated() && 
                   firestore.get(/databases/(default)/documents/orders/$(orderId)).data.userId == request.auth.uid &&
                   isValidImage();
    }
  }
}`}
                </Code>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Storage Folder Structure</h3>
                <p>The app uses the following folder structure in Firebase Storage:</p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>
                    <strong>/products/</strong> - For product images
                  </li>
                  <li>
                    <strong>/users/</strong> - For user profile images
                  </li>
                  <li>
                    <strong>/orders/</strong> - For order-related attachments
                  </li>
                </ul>
                <p>These folders will be created automatically as files are uploaded.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fcm">
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications Setup</CardTitle>
              <CardDescription>Configure Firebase Cloud Messaging (FCM) for push notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Set Up FCM</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Go to "Project settings" > "Cloud Messaging" tab</li>
                  <li>Generate a new Web Push certificate if needed</li>
                  <li>Copy the Server key and Sender ID</li>
                  <li>Generate a VAPID key for web push notifications</li>
                  <li>
                    Add the VAPID key to your environment variables as <code>NEXT_PUBLIC_FIREBASE_VAPID_KEY</code>
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Configure Service Worker</h3>
                <p>
                  The app includes a service worker file at <code>public/firebase-messaging-sw.js</code> that handles
                  push notifications.
                </p>
                <p>Make sure this file is properly configured with your Firebase project details.</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Test Push Notifications</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Log in to your app and accept notification permissions when prompted</li>
                  <li>Perform an action that triggers a notification (e.g., create an order)</li>
                  <li>Verify that the notification is received</li>
                  <li>
                    You can also test notifications from the Firebase Console:
                    <ul className="ml-6 list-disc space-y-1 mt-2">
                      <li>Go to "Messaging" > "Send your first message"</li>
                      <li>Configure the notification and send it to your test users</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Note on FCM Implementation</h3>
                <p className="text-sm text-muted-foreground">
                  For a complete server-side implementation of FCM, you would typically use Firebase Admin SDK in a
                  server environment. The client-side implementation in this app demonstrates the basics, but for
                  production use, consider implementing a server-side solution for sending notifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle>Deployment</CardTitle>
              <CardDescription>Deploy your SecondChance Marketplace to production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Vercel Deployment (Recommended)</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Push your code to a GitHub repository</li>
                  <li>
                    Go to{" "}
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Vercel
                    </a>{" "}
                    and create a new project
                  </li>
                  <li>Import your GitHub repository</li>
                  <li>
                    Add your environment variables:
                    <ul className="ml-6 list-disc space-y-1 mt-2">
                      <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                      <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                      <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                      <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                      <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                      <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
                      <li>NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID</li>
                      <li>NEXT_PUBLIC_FIREBASE_VAPID_KEY</li>
                    </ul>
                  </li>
                  <li>Deploy the application</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Firebase Hosting Deployment</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>
                    Install Firebase CLI: <code>npm install -g firebase-tools</code>
                  </li>
                  <li>
                    Login to Firebase: <code>firebase login</code>
                  </li>
                  <li>
                    Initialize Firebase in your project: <code>firebase init</code>
                  </li>
                  <li>Select Hosting and configure it</li>
                  <li>
                    Build your Next.js app: <code>npm run build</code>
                  </li>
                  <li>
                    Deploy to Firebase: <code>firebase deploy</code>
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. Post-Deployment Steps</h3>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>Add your production domain to Firebase Authentication > Settings > Authorized domains</li>
                  <li>Test all features in the production environment</li>
                  <li>Set up monitoring and analytics to track usage</li>
                </ol>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Production Considerations</h3>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Set up proper error monitoring (e.g., Sentry)</li>
                  <li>Configure Firebase Performance Monitoring</li>
                  <li>Set up regular database backups</li>
                  <li>Implement rate limiting for API endpoints</li>
                  <li>Consider implementing server-side rendering for better SEO</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Ready to Get Started?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          Now that you've configured Firebase for your SecondChance Marketplace, you're ready to start adding products
          and growing your platform!
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/seller/listings/new">
            <Button size="lg">Add Your First Product</Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
