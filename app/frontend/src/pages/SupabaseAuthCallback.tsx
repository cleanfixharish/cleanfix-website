import { useEffect, useState } from 'react';
import { getSupabaseClient, exchangeCurrentSupabaseSession } from '@/lib/supabaseAuth';

export default function SupabaseAuthCallback() {
  const [message, setMessage] = useState('Securing your CleanFixHarish account…');

  useEffect(() => {
    const finish = async () => {
      try {
        const client = await getSupabaseClient();
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        await exchangeCurrentSupabaseSession();
        const user = await import('@/lib/auth').then(({ authApi }) => authApi.getCurrentUser());
        const reset = new URLSearchParams(window.location.search).get('next') === 'reset';
        window.location.replace(reset ? '/account?reset=1' : (['admin', 'viewer'].includes(user?.role || '') ? '/admin' : '/account'));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'We could not complete email authentication.');
      }
    };
    finish();
  }, []);

  return <main className="flex min-h-screen items-center justify-center bg-[#F3EFE7] px-4"><div className="max-w-md text-center"><div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-[#174E57]/25 border-t-[#174E57]"/><p className="text-sm text-[#5F5A54]">{message}</p></div></main>;
}
