import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('type') === 'business' ? 'business' : searchParams.get('type') === 'customer' ? 'customer' : null;
  const { t } = useLanguage();
  const a = t.account;
  const { user, loading, login, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authReady, setAuthReady] = useState<boolean | null>(null);
  const [form, setForm] = useState(() => ({ ...emptyForm, account_type: requestedRole || emptyForm.account_type }));
  const [entryRole, setEntryRole] = useState<AccountType>(() => requestedRole || (sessionStorage.getItem('cleanfix_account_type') as AccountType) || 'customer');

  useEffect(() => {
    if (!requestedRole) return;
    setEntryRole(requestedRole);
    setForm((current) => ({ ...current, account_type: requestedRole }));
    sessionStorage.setItem('cleanfix_account_type', requestedRole);
  }, [requestedRole]);

  const beginSignup = (role: AccountType) => {
    sessionStorage.setItem('cleanfix_account_type', role);
    setEntryRole(role);
    login();
  };

  useEffect(() => {
    authApi.getStatus().then((result) => setAuthReady(result.configured)).catch(() => setAuthReady(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { setChecking(false); return; }
    authApi.getProfile().then((data) => {
      setProfile(data);
      setForm({
        account_type: data.account_type || (sessionStorage.getItem('cleanfix_account_type') as AccountType) || 'customer', display_name: data.display_name, phone: data.phone,
        area: data.area || 'Harish', preferred_language: data.preferred_language,
        whatsapp_opt_in: data.whatsapp_opt_in, business_name: data.business_name || '',
        business_category: data.business_category || '', business_description: data.business_description || '',
      });
    }).catch(() => {
      const savedRole = (sessionStorage.getItem('cleanfix_account_type') as AccountType) || 'customer';
      setForm((current) => ({ ...current, account_type: savedRole }));
      setEditing(true);
    }).finally(() => setChecking(false));
  }, [loading, user]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await authApi.updateProfile(form);
      setProfile(data);
      setEditing(false);
      toast.success(a.ready);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || a.saveFailed);
    } finally { setSaving(false); }
  };

  if (loading || checking) return <Page><div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#174E57]"/><span className="ms-3 text-sm text-[#746D65]">{a.opening}</span></div></Page>;

  if (!user) return <Page><main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:py-20"><div><span className="cf-logo-shine"><img src="/assets/brand/cf-gold-monogram-256.png" alt="CleanFixHarish official CF gold monogram" className="h-28 w-28 rounded-[30px] shadow-[0_18px_45px_rgba(8,31,40,.2)]"/></span><p className="mt-7 text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{a.eyebrow}</p><h1 className="mt-4 text-4xl text-[#173F46] sm:text-5xl">{a.joinTitle}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#6F675F]">{a.joinSubtitle}</p><div className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#81786F]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#174E57]"/>{a.secureNote}</div></div><Card className="overflow-hidden border-[#B8842F]/45 bg-[#FBF8F3] shadow-[0_28px_90px_rgba(23,63,70,.14)]"><div className="bg-[#102E38] px-7 py-6 text-[#F7F2EA]"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#F0C96F]">{a.step}</p><h2 className="mt-2 text-3xl">{a.selectAccount}</h2><p className="mt-2 text-sm text-white/70">{a.thenGoogle}</p></div><CardContent className="space-y-3 p-6 sm:p-8"><RoleChoice active={entryRole === 'customer'} icon={UserRound} title={a.customerRole} text={a.customerRoleText} onClick={() => setEntryRole('customer')}/><RoleChoice active={entryRole === 'business'} icon={Building2} title={a.businessRole} text={a.businessRoleText} onClick={() => setEntryRole('business')}/><Button size="lg" disabled={authReady !== true} onClick={() => beginSignup(entryRole)} className="mt-3 w-full bg-[#174E57] hover:bg-[#103A41]"><LogIn className="me-2 h-4 w-4"/>{authReady === null ? a.checking : authReady ? a.continueGoogle : a.googlePending}</Button>{authReady === false && <p className="rounded-xl border border-[#C49332]/40 bg-[#F5EBDD] p-3 text-center text-xs leading-5 text-[#76541F]">{a.paused}</p>}<p className="text-center text-xs text-[#81786F]">{a.alreadyRegistered}</p><div className="border-t border-[#E2D8CC] pt-4 text-center"><Link to="/admin" className="text-xs font-semibold text-[#805416] underline underline-offset-4">{a.ownerSignIn}</Link></div></CardContent></Card></main></Page>;

  if (editing || !profile) return <Page><main className="mx-auto max-w-3xl px-4 py-12 sm:py-16"><div className="mb-8 text-center"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{a.setup}</p><h1 className="mt-3 text-3xl text-[#173F46]">{a.howUse}</h1><p className="mt-3 text-sm text-[#756D64]">{a.chooseRole}</p></div><form onSubmit={save}><Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="space-y-6 p-6 sm:p-8"><div className="grid gap-3 sm:grid-cols-2"><RoleChoice active={form.account_type === 'customer'} icon={UserRound} title={a.customer} text={a.customerText} onClick={() => setForm({...form, account_type:'customer'})}/><RoleChoice active={form.account_type === 'business'} icon={BriefcaseBusiness} title={a.business} text={a.businessText} onClick={() => setForm({...form, account_type:'business'})}/></div><div className="grid gap-5 sm:grid-cols-2"><Field label={a.fullName} required><Input required minLength={2} value={form.display_name} onChange={(e)=>setForm({...form,display_name:e.target.value})}/></Field><Field label={a.mobile} required><Input required type="tel" dir="ltr" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></Field></div><Field label={a.area}><Input value={form.area} onChange={(e)=>setForm({...form,area:e.target.value})}/></Field>{form.account_type === 'business' && <div className="space-y-5 rounded-2xl border border-[#D8D0C6] bg-white p-5"><div className="grid gap-5 sm:grid-cols-2"><Field label={a.businessName} required><Input required value={form.business_name} onChange={(e)=>setForm({...form,business_name:e.target.value})}/></Field><Field label={a.serviceCategory}><Input placeholder={a.categoryPlaceholder} value={form.business_category} onChange={(e)=>setForm({...form,business_category:e.target.value})}/></Field></div><Field label={a.aboutWork}><Textarea rows={4} value={form.business_description} onChange={(e)=>setForm({...form,business_description:e.target.value})}/></Field></div>}<div className="flex items-start justify-between gap-4 rounded-xl bg-[#E8EFEA] p-4"><div><p className="text-sm font-medium text-[#294B45]">{a.localUpdates}</p><p className="mt-1 text-xs leading-5 text-[#66736E]">{a.whatsappOptIn}</p></div><Switch checked={form.whatsapp_opt_in} onCheckedChange={(value)=>setForm({...form,whatsapp_opt_in:value})}/></div><Button type="submit" size="lg" disabled={saving} className="w-full bg-[#174E57] hover:bg-[#103A41]">{saving && <Loader2 className="me-2 h-4 w-4 animate-spin"/>}{a.createAccount}</Button></CardContent></Card></form></main></Page>;

  return <Page><main className="mx-auto max-w-6xl px-4 py-10 sm:py-14"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{profile.account_type === 'business' ? a.businessWorkspace : a.customerDashboard}</p><h1 className="mt-2 text-3xl text-[#173F46]">{a.welcome}, {profile.display_name.split(" ")[0]}.</h1><p className="mt-2 text-sm text-[#756D64]">{a.accountNumber} <strong className="text-[#173F46]" dir="ltr">{profile.vip_number}</strong></p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>setEditing(true)}>{a.editProfile}</Button><Button variant="ghost" onClick={logout}>{a.signOut}</Button></div></div>{profile.account_type === 'business' ? <BusinessDashboard profile={profile}/> : <CustomerDashboard profile={profile}/>}</main></Page>;
}

function CustomerDashboard({ profile }: { profile: Profile }) { const a = useLanguage().t.account; return <><div className="mt-8 grid gap-4 md:grid-cols-3"><DashboardCard icon={Wrench} title={a.requestService} text={a.requestServiceText} action={<Button asChild className="bg-[#174E57]"><Link to="/quote">{a.startRequest}</Link></Button>}/><DashboardCard icon={MessageCircle} title={a.whatsappSupport} text={a.whatsappSupportText} action={<Button asChild variant="outline"><a href={getWhatsAppLink(getWhatsAppQuoteMessage())} target="_blank" rel="noreferrer">{a.openWhatsApp}</a></Button>}/><DashboardCard icon={Gift} title={a.localBenefits} text={a.localBenefitsText} action={<Badge variant="outline">{a.comingCarefully}</Badge>}/></div><Card className="mt-6 border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-[#174E57]"/><h2 className="font-sans text-lg font-semibold text-[#173F46]">{a.profileReady}</h2></div><p className="mt-2 text-sm text-[#756D64]" dir="ltr">{profile.email} · {profile.phone} · {profile.area || "Harish"}</p><p className="mt-2 text-xs leading-5 text-[#81786F]">{a.historyNote}</p></div><Badge className="w-fit bg-[#DCEADF] text-[#2E6840]">{a.vipMember}</Badge></CardContent></Card></>; }

function BusinessDashboard({ profile }: { profile: Profile }) { const a = useLanguage().t.account; return <><div className="mt-8 grid gap-4 md:grid-cols-3"><DashboardCard icon={Building2} title={profile.business_name || a.businessWorkspace} text={`${profile.business_category || a.categoryPending} · ${profile.area || 'Harish'}`} action={<Badge className="bg-[#EEE4D4] text-[#765D38]">{profile.application_status}</Badge>}/><DashboardCard icon={ShieldCheck} title={a.verification} text={a.verificationText} action={<span className="text-xs text-[#81786F]">{a.noListing}</span>}/><DashboardCard icon={MessageCircle} title={a.providerContact} text={a.providerContactText} action={<Button asChild variant="outline"><a href={getWhatsAppLink('Hi CleanFixHarish, I am following up on my business provider application.')} target="_blank" rel="noreferrer">{a.openWhatsApp}</a></Button>}/></div><Card className="mt-6 border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-6"><h2 className="font-sans text-lg font-semibold text-[#173F46]">{a.futureTools}</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{[a.availability, a.assignedJobs, a.qualityRecords].map((item)=><div key={item} className="rounded-xl border border-[#E0D7CC] bg-white p-4 text-sm text-[#625B53]">{item}<p className="mt-2 text-xs text-[#9A7548]">{a.afterApproval}</p></div>)}</div></CardContent></Card></>; }

function Page({children}:{children:React.ReactNode}) { return <div className="min-h-screen bg-[#F3EFE7] bg-[url('/assets/brand/v2/ivory-golden-orbit.svg')] bg-[length:1200px_auto] bg-top text-[#243538]"><Header/>{children}<Footer/></div>; }
function RoleChoice({active,icon:Icon,title,text,onClick}:{active:boolean;icon:any;title:string;text:string;onClick:()=>void}) { return <button type="button" onClick={onClick} className={`rounded-2xl border p-5 text-start transition ${active?'border-[#174E57] bg-[#E5EEEB] ring-1 ring-[#174E57]':'border-[#D8D0C6] bg-white hover:border-[#9EB6B2]'}`}><Icon className="h-5 w-5 text-[#174E57]"/><p className="mt-3 font-medium text-[#173F46]">{title}</p><p className="mt-1 text-xs text-[#756D64]">{text}</p></button>; }
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}) { return <div><Label>{label}{required?' *':''}</Label><div className="mt-1.5">{children}</div></div>; }
function DashboardCard({icon:Icon,title,text,action}:{icon:any;title:string;text:string;action:React.ReactNode}) { return <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="flex h-full flex-col p-6"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDE9E7] text-[#174E57]"><Icon className="h-5 w-5"/></div><h2 className="mt-5 font-sans text-lg font-semibold text-[#173F46]">{title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-[#756D64]">{text}</p><div className="mt-5">{action}</div></CardContent></Card>; }
