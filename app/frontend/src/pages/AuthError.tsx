import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/whatsapp';

export default function AuthErrorPage() {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('msg') || 'The secure sign-in could not be completed. Please try again.';

  return <div className="min-h-screen bg-[#F3EFE7] text-[#173F46]"><Header/><main className="cf-ivory-orbit flex min-h-[65vh] items-center justify-center px-4 py-16"><div className="cf-panel max-w-xl p-7 text-center sm:p-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1E3D5] text-[#9B4B36]"><AlertCircle className="h-8 w-8"/></div><p className="cf-eyebrow mt-6">Secure account connection</p><h1 className="mt-3 text-4xl">We could not complete sign-in.</h1><p className="mt-4 leading-7 text-[#6F675F]">{errorMessage}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild className="bg-[#174E57] hover:bg-[#103A41]"><Link to="/account"><RefreshCw className="mr-2 h-4 w-4"/>Return to account</Link></Button><Button asChild variant="outline" className="border-[#B8842F]/55"><a href={getWhatsAppLink()} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4"/>Use WhatsApp</a></Button></div><p className="mt-6 text-xs text-[#81786F]">Your customer information was not submitted.</p></div></main><Footer/></div>;
}
