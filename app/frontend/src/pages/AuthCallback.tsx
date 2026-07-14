import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/auth';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogin = async () => {
      const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1));
      const token = params.get('token');
      if (!token) {
        navigate('/auth/error?msg=No secure login token was received.', { replace: true });
        return;
      }

      authApi.storeSession(token, params.get('expires_at') || undefined);
      window.history.replaceState({}, document.title, '/auth/callback');
      try {
        const user = await authApi.getCurrentUser();
        navigate(user?.role === 'admin' ? '/admin' : '/account', { replace: true });
      } catch {
        navigate('/auth/error?msg=We could not complete sign-in. Please try again.', { replace: true });
      }
    };
    completeLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Securing your CleanFixHarish account…</p>
      </div>
    </div>
  );
}
