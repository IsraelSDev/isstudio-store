import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

function env(name: string): string {
  return (process.env[name] || "").trim();
}

function supabaseUrl(): string {
  return env("SUPABASE_URL") || env("NEXT_PUBLIC_SUPABASE_URL");
}

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl() && env("SUPABASE_SERVICE_ROLE_KEY"));
}

/**
 * Cliente com service_role — só pode ser importado em código de servidor.
 * A service_role ignora RLS, por isso a chave nunca deve ir para o bundle do cliente.
 */
export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = supabaseUrl();
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "isstudio-store" } },
  });
  return cached;
}
