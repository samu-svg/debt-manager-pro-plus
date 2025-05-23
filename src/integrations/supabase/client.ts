
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xcextmkpjsubhipxdvmu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZXh0bWtwanN1YmhpcHhkdm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDg5MDEsImV4cCI6MjA2MzU4NDkwMX0.G9caj75RPKnqS5NhQef6o1CoK6PxiaQWjrjmA9N-A0Y";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
