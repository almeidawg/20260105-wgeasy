import { createClient } from "@supabase/supabase-js";

// Use variáveis de ambiente para evitar chaves hardcoded.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Supabase client requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables to be set."
  );
}

export const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});
