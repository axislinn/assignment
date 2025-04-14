import { createClient } from "@supabase/supabase-js"

// Replace with your actual Supabase config when ready
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  || "your-supabase-url"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  || "your-supabase-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)