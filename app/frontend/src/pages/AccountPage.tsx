import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BadgeCheck, BriefcaseBusiness, Building2, Gift, Loader2, LogIn, MessageCircle, ShieldCheck, UserRound, Wrench } from 'lucide-react';
import { getWhatsAppLink, getWhatsAppQuoteMessage } from '@/lib/whatsapp';

type AccountType = 'customer' | 'business';
type Profile = {
  id: number;
  email: string;
  account_type: AccountType;
  display_name: string;
  phone: string;
  area?: string;
  preferred_language: 'en' | 'he';
  whatsapp_opt_in: boolean;
  vip_number: string;
  business_name?: string;
  business_category?: string;
  business_description?: string;
  application_status: string;
};

const emptyForm = {
  account_type: 'customer' as AccountType,
  display_name: '', phone: '', area: 'Harish', preferred_language: 'en' as 'en' | 'he',
  whatsapp_opt_in: false, business_name: '', business_category: '', business_description: '',
};

export default function AccountPage() {
  const { user, loading, login, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (loading) return;
    if (!user) { setChecking(false); return; }
    authApi.getProfile().then((data) => {
      setProfile(data);
      setForm({
        account_type: data.account_type, display_name: data.display_name, phone: data.phone,
        area: data.area || 'Harish', preferred_language: data.preferred_language,
        whatsapp_opt_in: data.whatsapp_opt_in, business_name: data.business_name || '',
        business_category: data.business_category || '', business_description: data.business_description || '',
      });
    }).catch(() => setEditing(true)).finally(() => setChecking(false));
  }, [loading, user]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await authApi.updateProfile(form);
      setProfile(data);
      setEditing(false);
      toast.success('Your CleanFixHarish account is ready.');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'We could not save your account. Please check the details.');
    } finally { setSaving(false); }
  };

  if (loading || checking) return <Page><div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#174E57]"/><span className="ml-3 text-sm text-[#746D65]">Opening your account…</span></div></Page>;

  if (!user) return <Page><main className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">CleanFixHarish account</p><h1 className="mt-4 text-4xl text-[#173F46] sm:text-5xl">One calm place for your home services.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#6F675F]">Sign in securely to save your details, receive a personal customer number, follow service requests, or apply as a local business provider.</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><RolePreview icon={UserRound} title="Customer account" text="Faster requests, saved details, service history, and future local benefits."/><RolePreview icon={Building2} title="Business account" text="Apply to join the local provider network and manage your business profile."/></div></div><Card className="border-[#D8D0C6] bg-[#FBF8F3] shadow-[0_24px_80px_rgba(23,63,70,.10)]"><CardContent className="p-7 sm:p-9"><img src="/assets/brand/cf-home-support-emblem-128.png" alt="CleanFixHarish home support emblem" className="h-16 w-16 rounded-2xl"/><h2 className="mt-6 text-2xl text-[#173F46]">Sign in or create an account</h2><p className="mt-3 text-sm leading-6 text-[#756D64]">Use the secure sign-in connection. New accounts continue to a short customer or business setup.</p><Button size="lg" onClick={login} className="mt-7 w-full bg-[#174E57] hover:bg-[#103A41]"><LogIn className="mr-2 h-4 w-4"/>Continue securely</Button><div className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#81786F]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/>We only request the account information needed to provide and manage the service.</div></CardContent></Card></main></Page>;

  if (editing || !profile) return <Page><main className="mx-auto max-w-3xl px-4 py-12 sm:py-16"><div className="mb-8 text-center"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">Account setup</p><h1 className="mt-3 text-3xl text-[#173F46]">How will you use CleanFixHarish?</h1><p className="mt-3 text-sm text-[#756D64]">Choose one starting role. The owner reviews business applications before they appear publicly.</p></div><form onSubmit={save}><Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="space-y-6 p-6 sm:p-8"><div className="grid gap-3 sm:grid-cols-2"><RoleChoice active={form.account_type === 'customer'} icon={UserRound} title="Customer" text="Book and follow home services" onClick={() => setForm({...form, account_type:'customer'})}/><RoleChoice active={form.account_type === 'business'} icon={BriefcaseBusiness} title="Business / provider" text="Apply to offer local services" onClick={() => setForm({...form, account_type:'business'})}/></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" required><Input required minLength={2} value={form.display_name} onChange={(e)=>setForm({...form,display_name:e.target.value})}/></Field><Field label="Mobile / WhatsApp" required><Input required type="tel" dir="ltr" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></Field></div><Field label="Area"><Input value={form.area} onChange={(e)=>setForm({...form,area:e.target.value})}/></Field>{form.account_type === 'business' && <div className="space-y-5 rounded-2xl border border-[#D8D0C6] bg-white p-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Business name" required><Input required value={form.business_name} onChange={(e)=>setForm({...form,business_name:e.target.value})}/></Field><Field label="Service category"><Input placeholder="Handyman, cleaning…" value={form.business_category} onChange={(e)=>setForm({...form,business_category:e.target.value})}/></Field></div><Field label="Tell us briefly about your work"><Textarea rows={4} value={form.business_description} onChange={(e)=>setForm({...form,business_description:e.target.value})}/></Field></div>}<div className="flex items-start justify-between gap-4 rounded-xl bg-[#E8EFEA] p-4"><div><p className="text-sm font-medium text-[#294B45]">Local updates and benefits</p><p className="mt-1 text-xs leading-5 text-[#66736E]">Allow useful WhatsApp updates. No fake urgency or message overload.</p></div><Switch checked={form.whatsapp_opt_in} onCheckedChange={(value)=>setForm({...form,whatsapp_opt_in:value})}/></div><Button type="submit" size="lg" disabled={saving} className="w-full bg-[#174E57] hover:bg-[#103A41]">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Create my account</Button></CardContent></Card></form></main></Page>;

  return <Page><main className="mx-auto max-w-6xl px-4 py-10 sm:py-14"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{profile.account_type === 'business' ? 'Business workspace' : 'Customer dashboard'}</p><h1 className="mt-2 text-3xl text-[#173F46]">Welcome, {profile.display_name.split(' ')[0]}.</h1><p className="mt-2 text-sm text-[#756D64]">Your account number: <strong className="text-[#173F46]">{profile.vip_number}</strong></p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>setEditing(true)}>Edit profile</Button><Button variant="ghost" onClick={logout}>Sign out</Button></div></div>{profile.account_type === 'business' ? <BusinessDashboard profile={profile}/> : <CustomerDashboard profile={profile}/>}</main></Page>;
}

function CustomerDashboard({ profile }: { profile: Profile }) { return <><div className="mt-8 grid gap-4 md:grid-cols-3"><DashboardCard icon={Wrench} title="Request a service" text="Tell us what needs attention and add photos when useful." action={<Button asChild className="bg-[#174E57]"><Link to="/quote">Start a request</Link></Button>}/><DashboardCard icon={MessageCircle} title="WhatsApp support" text="Reach the CleanFixHarish service number directly." action={<Button asChild variant="outline"><a href={getWhatsAppLink(getWhatsAppQuoteMessage())} target="_blank" rel="noreferrer">Open WhatsApp</a></Button>}/><DashboardCard icon={Gift} title="Local benefits" text="Useful Harish offers and VIP benefits will appear here when approved." action={<Badge variant="outline">Coming carefully</Badge>}/></div><Card className="mt-6 border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-[#174E57]"/><h2 className="font-sans text-lg font-semibold text-[#173F46]">Profile ready</h2></div><p className="mt-2 text-sm text-[#756D64]">{profile.email} · {profile.phone} · {profile.area || 'Harish'}</p><p className="mt-2 text-xs leading-5 text-[#81786F]">Request history and live job tracking activate as jobs are connected to this account.</p></div><Badge className="w-fit bg-[#DCEADF] text-[#2E6840]">VIP member</Badge></CardContent></Card></>; }

function BusinessDashboard({ profile }: { profile: Profile }) { return <><div className="mt-8 grid gap-4 md:grid-cols-3"><DashboardCard icon={Building2} title={profile.business_name || 'Business profile'} text={`${profile.business_category || 'Service category pending'} · ${profile.area || 'Harish'}`} action={<Badge className="bg-[#EEE4D4] text-[#765D38]">{profile.application_status}</Badge>}/><DashboardCard icon={ShieldCheck} title="Verification" text="The owner reviews qualifications, service fit, and reliability before activation." action={<span className="text-xs text-[#81786F]">No public listing yet</span>}/><DashboardCard icon={MessageCircle} title="Provider contact" text="Send documents or questions directly to CleanFixHarish." action={<Button asChild variant="outline"><a href={getWhatsAppLink('Hi CleanFixHarish, I am following up on my business provider application.')} target="_blank" rel="noreferrer">Open WhatsApp</a></Button>}/></div><Card className="mt-6 border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-6"><h2 className="font-sans text-lg font-semibold text-[#173F46]">Future provider tools</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{['Availability and service areas','Assigned job requests','Quality and payment records'].map((item)=><div key={item} className="rounded-xl border border-[#E0D7CC] bg-white p-4 text-sm text-[#625B53]">{item}<p className="mt-2 text-xs text-[#9A7548]">Activates after approval</p></div>)}</div></CardContent></Card></>; }

function Page({children}:{children:React.ReactNode}) { return <div className="min-h-screen bg-[#F3EFE7] bg-[url('/assets/brand/v2/ivory-golden-orbit.svg')] bg-[length:1200px_auto] bg-top text-[#243538]"><Header/>{children}<Footer/></div>; }
function RolePreview({icon:Icon,title,text}:{icon:any;title:string;text:string}) { return <div className="rounded-2xl border border-[#D8D0C6] bg-[#FBF8F3] p-4"><Icon className="h-5 w-5 text-[#174E57]"/><h3 className="mt-4 font-sans text-base font-semibold text-[#173F46]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#756D64]">{text}</p></div>; }
function RoleChoice({active,icon:Icon,title,text,onClick}:{active:boolean;icon:any;title:string;text:string;onClick:()=>void}) { return <button type="button" onClick={onClick} className={`rounded-2xl border p-5 text-left transition ${active?'border-[#174E57] bg-[#E5EEEB] ring-1 ring-[#174E57]':'border-[#D8D0C6] bg-white hover:border-[#9EB6B2]'}`}><Icon className="h-5 w-5 text-[#174E57]"/><p className="mt-3 font-medium text-[#173F46]">{title}</p><p className="mt-1 text-xs text-[#756D64]">{text}</p></button>; }
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}) { return <div><Label>{label}{required?' *':''}</Label><div className="mt-1.5">{children}</div></div>; }
function DashboardCard({icon:Icon,title,text,action}:{icon:any;title:string;text:string;action:React.ReactNode}) { return <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="flex h-full flex-col p-6"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDE9E7] text-[#174E57]"><Icon className="h-5 w-5"/></div><h2 className="mt-5 font-sans text-lg font-semibold text-[#173F46]">{title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-[#756D64]">{text}</p><div className="mt-5">{action}</div></CardContent></Card>; }
