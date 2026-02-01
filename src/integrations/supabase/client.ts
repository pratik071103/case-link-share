// Main Database Connection (PROJECT A - consolidated)
// Migration completed from PROJECT B (gjffcxlvjljsslpilgvv)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// PROJECT A - Main Database (ttmkznpfdjwygksspmjz)
const SUPABASE_URL = "https://ttmkznpfdjwygksspmjz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bWt6bnBmZGp3eWdrc3NwbWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzEwNzYsImV4cCI6MjA3NDc0NzA3Nn0.texvU7Iv4K2fDJaoBEebFOb5dna6xCq8M0XtopcMo94";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});