import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PublicSite from '@/components/PublicSite';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BadgeCheck, BriefcaseBusiness, Building2, Gift, Loader2, LogIn, Mail, MessageCircle, ShieldCheck, Store, UserPlus, UserRound, Wrench } from 'lucide-react';
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
  const { t, lang } = useLanguage();
  const a = t.account;
  const { user, loading, login, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authReady, setAuthReady] = useState<boolean | null>(null);
  const [form, setForm] = useState(() => ({ ...emptyForm, account_type: requestedRole || emptyForm.account_type }));
  const [entryRole, setEntryRole] = useState<AccountType>(() => requestedRole || (sessionStorage.getItem('cleanfix_account_type') as AccountType) || 'customer');
  const [emailIntent, setEmailIntent] = useState<'signin' | 'signup' | null>(null);

  useEffect(() => {
    if (!requestedRole) return;
    setEntryRole(requestedRole);
    setForm((current) => ({ ...current, account_type: requestedRole }));
    sessionStorage.setItem('cleanfix_account_type', requestedRole);
  }, [requestedRole]);

  const beginGoogle = (intent: 'signin' | 'signup') => {
    sessionStorage.setItem('cleanfix_auth_intent', intent);
    if (intent === 'signup') sessionStorage.setItem('cleanfix_account_type', entryRole);
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

  if (!user) return <Page><main className="mx-auto grid max-w-6xl min-w-0 gap-10 px-4 py-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:py-20 public-grid"><div><span className="cf-logo-shine"><img src="/assets/brand/cf-gold-monogram-256.png" alt="CleanFixHarish official CF gold monogram" className="h-28 w-28 rounded-[30px] shadow-[0_18px_45px_rgba(8,31,40,.2)]"/></span><p className="mt-7 text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{a.eyebrow}</p><h1 className="mt-4 text-4xl text-[#173F46] sm:text-5xl">{a.joinTitle}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#6F675F]">{a.joinSubtitle}</p><div className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#81786F]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#174E57]"/>{lang === 'he' ? 'השרת מזהה הרשאות לפי האימייל המאומת ופותח אוטומטית את לוח הבקרה הנכון.' : 'The server recognizes permissions from the verified email and automatically opens the correct dashboard.'}</div></div><Card className="overflow-hidden border-[#B8842F]/45 bg-[#FBF8F3] shadow-[0_28px_90px_rgba(23,63,70,.14)]"><div className="bg-[#102E38] px-7 py-6 text-[#F7F2EA]"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#F0C96F]">{lang === 'he' ? 'כניסה אחת לכל סוגי החשבון' : 'One secure entrance for every account'}</p><h2 className="mt-2 text-3xl">{lang === 'he' ? 'כניסה או הרשמה' : 'Sign in or create an account'}</h2><p className="mt-2 text-sm text-white/70">{lang === 'he' ? 'מנהלים מאושרים מועברים אוטומטית ללוח הניהול.' : 'Approved administrators are routed to the admin dashboard automatically.'}</p></div><CardContent className="space-y-5 p-6 sm:p-8"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.14em] text-[#8A7049]">{lang === 'he' ? 'לחשבון חדש: בחרו סוג חשבון' : 'For a new account: choose account type'}</p><div className="grid gap-3 sm:grid-cols-2"><RoleChoice active={entryRole === 'customer'} icon={UserRound} title={a.customerRole} text={a.customerRoleText} onClick={() => setEntryRole('customer')}/><RoleChoice active={entryRole === 'business'} icon={Building2} title={a.businessRole} text={a.businessRoleText} onClick={() => setEntryRole('business')}/></div></div><div className="grid gap-3 sm:grid-cols-2"><AuthChoice icon={LogIn} title={lang === 'he' ? 'כניסה עם Google' : 'Sign in with Google'} onClick={() => beginGoogle('signin')} disabled={authReady !== true} primary/><AuthChoice icon={Mail} title={lang === 'he' ? 'כניסה עם אימייל' : 'Sign in with email'} onClick={() => setEmailIntent('signin')}/><AuthChoice icon={UserPlus} title={lang === 'he' ? 'הרשמה עם Google' : 'Sign up with Google'} onClick={() => beginGoogle('signup')} disabled={authReady !== true}/><AuthChoice icon={Mail} title={lang === 'he' ? 'הרשמה עם אימייל' : 'Sign up with email'} onClick={() => setEmailIntent('signup')}/></div>{emailIntent && <div className="rounded-2xl border border-[#D8D0C6] bg-white p-5" aria-live="polite"><div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#174E57]"/><div><h3 className="font-sans font-semibold text-[#173F46]">{emailIntent === 'signin' ? (lang === 'he' ? 'כניסה באימייל עדיין אינה מחוברת' : 'Email sign-in is not connected yet') : (lang === 'he' ? 'הרשמה באימייל עדיין אינה מחוברת' : 'Email sign-up is not connected yet')}</h3><p className="mt-1 text-xs leading-5 text-[#756D64]">{lang === 'he' ? 'לא נאסוף סיסמה עד שיחובר ספק אימייל מאובטח עם אימות כתובת ושחזור חשבון. בינתיים Google פעיל.' : 'We will not collect a password until a managed email provider with verification and account recovery is connected. Google is available now.'}</p></div></div></div>}{authReady === false && <p className="rounded-xl border border-[#C49332]/40 bg-[#F5EBDD] p-3 text-center text-xs leading-5 text-[#76541F]">{a.paused}</p>}<p className="text-center text-xs leading-5 text-[#81786F]">{lang === 'he' ? 'אותם כפתורי Google משמשים בצורה מאובטחת לחשבונות קיימים וחדשים; ההפרדה מבהירה את הפעולה.' : 'Google securely handles both existing and new accounts; the separate choices make the intention clear.'}</p></CardContent></Card></main></Page>;

  if (editing || !profile) return <Page><main className="mx-auto max-w-3xl px-4 py-12 sm:py-16"><div className="mb-8 text-center"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{a.setup}</p><h1 className="mt-3 text-3xl text-[#173F46]">{a.howUse}</h1><p className="mt-3 text-sm text-[#756D64]">{a.chooseRole}</p></div><form onSubmit={save}><Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="space-y-6 p-6 sm:p-8"><div className="grid gap-3 sm:grid-cols-2"><RoleChoice active={form.account_type === 'customer'} icon={UserRound} title={a.customer} text={a.customerText} onClick={() => setForm({...form, account_type:'customer'})}/><RoleChoice active={form.account_type === 'business'} icon={BriefcaseBusiness} title={a.business} text={a.businessText} onClick={() => setForm({...form, account_type:'business'})}/></div><div className="grid gap-5 sm:grid-cols-2"><Field label={a.fullName} required><Input required minLength={2} value={form.display_name} onChange={(e)=>setForm({...form,display_name:e.target.value})}/></Field><Field label={a.mobile} required><Input required type="tel" dir="ltr" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></Field></div><Field label={a.area}><Input value={form.area} onChange={(e)=>setForm({...form,area:e.target.value})}/></Field>{form.account_type === 'business' && <div className="space-y-5 rounded-2xl border border-[#D8D0C6] bg-white p-5"><div className="grid gap-5 sm:grid-cols-2"><Field label={a.businessName} required><Input required value={form.business_name} onChange={(e)=>setForm({...form,business_name:e.target.value})}/></Field><Field label={a.serviceCategory}><Input placeholder={a.categoryPlaceholder} value={form.business_category} onChange={(e)=>setForm({...form,business_category:e.target.value})}/></Field></div><Field label={a.aboutWork}><Textarea rows={4} value={form.business_description} onChange={(e)=>setForm({...form,business_description:e.target.value})}/></Field></div>}<div className="flex items-start justify-between gap-4 rounded-xl bg-[#E8EFEA] p-4"><div><p className="text-sm font-medium text-[#294B45]">{a.localUpdates}</p><p className="mt-1 text-xs leading-5 text-[#66736E]">{a.whatsappOptIn}</p></div><Switch checked={form.whatsapp_opt_in} onCheckedChange={(value)=>setForm({...form,whatsapp_opt_in:value})}/></div><Button type="submit" size="lg" disabled={saving} className="w-full bg-[#174E57] hover:bg-[#103A41]">{saving && <Loader2 className="me-2 h-4 w-4 animate-spin"/>}{a.createAccount}</Button></CardContent></Card></form></main></Page>;

  return <Page><main className="mx-auto max-w-6xl px-4 py-10 sm:py-14"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9A7548]">{profile.account_type === 'business' ? a.businessWorkspace : a.customerDashboard}</p><h1 className="mt-2 text-3xl text-[#173F46]">{a.welcome}, {profile.display_name.split(" ")[0]}.</h1><p className="mt-2 text-sm text-[#756D64]">{a.accountNumber} <strong className="text-[#173F46]" dir="ltr">{profile.vip_number}</strong></p></div><div className="flex gap-2"><Button variant="outline" onClick={()=>setEditing(true)}>{a.editProfile}</Button><Button variant="ghost" onClick={logout}>{a.signOut}</Button></div></div>{profile.account_type === 'business' ? <BusinessDashboard profile={profile}/> : <CustomerDashboard profile={profile}/>}</main></Page>;
}

function CustomerDashboard({ profile }: { profile: Profile }) { const a = useLanguage().t.account; return <><div className="public-grid mt-8 grid min-w-0 gap-4 md:grid-cols-3"><DashboardCard icon={Wrench} title={a.requestService} text={a.requestServiceText} action={<Button asChild className="bg-[#174E57]"><Link to="/quote">{a.startRequest}</Link></Button>}/><DashboardCard icon={MessageCircle} title={a.whatsappSupport} text={a.whatsappSupportText} action={<Button asChild variant="outline"><a href={getWhatsAppLink(getWhatsAppQuoteMessage())} target="_blank" rel="noreferrer">{a.openWhatsApp}</a></Button>}/><DashboardCard icon={Gift} title={a.localBenefits} text={a.localBenefitsText} action={<Badge variant="outline">{a.comingCarefully}</Badge>}/></div><Card className="mt-6 border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-[#174E57]"/><h2 className="font-sans text-lg font-semibold text-[#173F46]">{a.profileReady}</h2></div><p className="mt-2 text-sm text-[#756D64]" dir="ltr">{profile.email} · {profile.phone} · {profile.area || "Harish"}</p><p className="mt-2 text-xs leading-5 text-[#81786F]">{a.historyNote}</p></div><Badge className="w-fit bg-[#DCEADF] text-[#2E6840]">{a.vipMember}</Badge></CardContent></Card></>; }

function BusinessDashboard({ profile }: { profile: Profile }) { const { lang, t } = useLanguage(); const a = t.account; const he = lang === 'he'; return <><div className="public-grid mt-8 grid min-w-0 gap-4 md:grid-cols-3"><DashboardCard icon={Building2} title={profile.business_name || a.businessWorkspace} text={`${profile.business_category || a.categoryPending} · ${profile.area || 'Harish'}`} action={<Badge className="bg-[#EEE4D4] text-[#765D38]">{profile.application_status}</Badge>}/><DashboardCard icon={ShieldCheck} title={a.verification} text={a.verificationText} action={<span className="text-xs text-[#81786F]">{a.noListing}</span>}/><DashboardCard icon={MessageCircle} title={a.providerContact} text={a.providerContactText} action={<Button asChild variant="outline"><a href={getWhatsAppLink('Hi CleanFixHarish, I am following up on my business application.')} target="_blank" rel="noreferrer">{a.openWhatsApp}</a></Button>}/></div><Card className="mt-6 border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9A7548]">{he ? 'בחרו את הקשר הנכון' : 'Choose the correct relationship'}</p><h2 className="mt-2 font-sans text-xl font-semibold text-[#173F46]">{he ? 'שתי סביבות עבודה נפרדות לחלוטין' : 'Two completely separate business workspaces'}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#756D64]">{he ? 'שותף ביצוע עובד בשם CleanFix בעבודות שאנחנו מנהלים. עסק מפורסם הוא עצמאי ומקבל רק פניות בהסכמת לקוח. אישור אחד אינו נותן גישה לשני.' : 'A service partner works under CleanFix on jobs we manage. An advertised business stays independent and receives only consented introductions. Approval for one never grants access to the other.'}</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><DashboardCard icon={Wrench} title={he ? 'סביבת שותף ביצוע' : 'Managed provider workspace'} text={he ? 'הצעות עבודה, היקף, תיעוד, שינויי עבודה ותשלומים — ללא מחיר לקוח או ספר לקוחות.' : 'Offers, scope, evidence, change orders and payouts—without customer price or a reusable customer list.'} action={<Button asChild className="bg-[#174E57]"><Link to="/provider">{he ? 'פתיחת סביבת ביצוע' : 'Open provider workspace'}</Link></Button>}/><DashboardCard icon={Store} title={he ? 'סטודיו לעסק עצמאי' : 'Independent business studio'} text={he ? 'פרופיל מותג, פניות בהסכמה, ביצועים וחיוב — ללא גישה לעבודות CleanFix.' : 'Brand profile, consented introductions, performance and billing—without CleanFix job access.'} action={<Button asChild variant="outline"><Link to="/partner">{he ? 'פתיחת סטודיו עסקי' : 'Open business studio'}</Link></Button>}/></div></CardContent></Card></>; }

function Page({children}:{children:React.ReactNode}) { return <PublicSite className="bg-[#F3EFE7] bg-[url('/assets/brand/v2/ivory-golden-orbit.svg')] bg-[length:min(1200px,100%)_auto] bg-top text-[#243538]"><Header/>{children}<Footer/></PublicSite>; }
function RoleChoice({active,icon:Icon,title,text,onClick}:{active:boolean;icon:any;title:string;text:string;onClick:()=>void}) { return <button type="button" onClick={onClick} className={`rounded-2xl border p-5 text-start transition ${active?'border-[#174E57] bg-[#E5EEEB] ring-1 ring-[#174E57]':'border-[#D8D0C6] bg-white hover:border-[#9EB6B2]'}`}><Icon className="h-5 w-5 text-[#174E57]"/><p className="mt-3 font-medium text-[#173F46]">{title}</p><p className="mt-1 text-xs text-[#756D64]">{text}</p></button>; }
function AuthChoice({icon:Icon,title,onClick,disabled,primary}:{icon:any;title:string;onClick:()=>void;disabled?:boolean;primary?:boolean}) { return <Button type="button" size="lg" variant={primary?'default':'outline'} disabled={disabled} onClick={onClick} className={`min-h-12 justify-start ${primary?'bg-[#174E57] hover:bg-[#103A41]':'border-[#B8B0A7] bg-white text-[#173F46]'}`}><Icon className="me-2 h-4 w-4"/>{title}</Button>; }
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}) { return <div><Label>{label}{required?' *':''}</Label><div className="mt-1.5">{children}</div></div>; }
function DashboardCard({icon:Icon,title,text,action}:{icon:any;title:string;text:string;action:React.ReactNode}) { return <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="flex h-full flex-col p-6"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDE9E7] text-[#174E57]"><Icon className="h-5 w-5"/></div><h2 className="mt-5 font-sans text-lg font-semibold text-[#173F46]">{title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-[#756D64]">{text}</p><div className="mt-5">{action}</div></CardContent></Card>; }
