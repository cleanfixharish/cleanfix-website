import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authApi } from './auth';

type RuntimeConfig = {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
};

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!clientPromise) {
    clientPromise = fetch('/api/config', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Authentication configuration is unavailable.');
        return response.json() as Promise<RuntimeConfig>;
      })
      .then((config) => {
        if (!config.SUPABASE_URL || !config.SUPABASE_PUBLISHABLE_KEY) {
          throw new Error('Email authentication is not configured.');
        }
        return createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
          },
        });
      });
  }
  return clientPromise;
}

export async function exchangeCurrentSupabaseSession() {
  const client = await getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error('No verified email session was received.');
  await authApi.exchangeSupabaseToken(data.session.access_token);
  return data.session;
}

export async function signOutSupabase() {
  try {
    const client = await getSupabaseClient();
    await client.auth.signOut({ scope: 'local' });
  } catch {
    // App logout must still complete if the provider is temporarily unavailable.
  }
}
