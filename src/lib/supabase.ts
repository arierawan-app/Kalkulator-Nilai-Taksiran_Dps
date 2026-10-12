import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let klien: SupabaseClient | null = null;

export function klienSupabase(): SupabaseClient {
  if (klien) return klien;
  const url = process.env.SUPABASE_URL;
  const kunci = process.env.SUPABASE_ANON_KEY;
  if (!url || !kunci) {
    throw new Error("SUPABASE_URL dan SUPABASE_ANON_KEY belum diatur.");
  }
  klien = createClient(url, kunci, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return klien;
}
