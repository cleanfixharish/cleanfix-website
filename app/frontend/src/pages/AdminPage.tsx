import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Activity, BadgeCheck, Bell, BookOpen, BriefcaseBusiness, Building2, CalendarClock,
  Check, CheckCircle2, ChevronRight, CircleDollarSign, ClipboardCheck, Clock3, ExternalLink,
  FileText, Gauge, Globe2, HardHat, HeartHandshake, Inbox, LayoutDashboard, LogOut, Menu,
  MessageCircle, MoreHorizontal, PencilLine, Phone, Plus, Search, Send, Settings2, ShieldCheck,
  Sparkles, Star, Users, Wrench, X,
} from 'lucide-react';
import { cleanfixApi } from '@/lib/cleanfixApi';
import { activity, DashboardLead, jobs, LeadStatus, providers, services, starterLeads } from '@/data/adminStarterData';

type Section = 'overview' | 'leads' | 'whatsapp' | 'jobs' | 'providers' | 'services' | 'content' | 'followups' | 'internal';
type CmsItem = { id: number; section_key: string; title_en?: string; title_he?: string; content_en?: string; content_he?: string; is_active?: boolean };

const navigation: { id: Section; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads CRM', icon: Inbox },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'jobs', label: 'Jobs & tasks', icon: BriefcaseBusiness },
  { id: 'providers', label: 'Providers', icon: HardHat },
  { id: 'services', label: 'Services & pricing', icon: Wrench },
  { id: 'content', label: 'Website content', icon: Globe2 },
  { id: 'followups', label: 'Follow-ups', icon: HeartHandshake },
  { id: 'internal', label: 'Internal OS', icon: BookOpen },
];

const pipeline: LeadStatus[] = ['new', 'contacted', 'quoted', 'scheduled', 'in progress', 'completed', 'follow-up', 'cancelled'];
const statusStyle: Record<LeadStatus, string> = {
  new: 'bg-[#DCE9EA] text-[#174E57]', contacted: 'bg-[#EEE4D4] text-[#765D38]', quoted: 'bg-[#E7E2EF] text-[#5A4C70]',
  scheduled: 'bg-[#DBE5D9] text-[#405F43]', 'in progress': 'bg-[#DCE5F0] text-[#35546D]', completed: 'bg-[#DCEADF] text-[#2E6840]',
  'follow-up': 'bg-[#F2E1D7] text-[#854D37]', cancelled: 'bg-[#EAE7E3] text-[#746D65]',
};

const templates = [
  { title: 'New inquiry', body: 'Hi {{name}}, thank you for contacting CleanFixHarish. Please send a few photos and your Harish neighborhood so we can understand the job clearly.' },
  { title: 'Scheduling', body: 'Hi {{name}}, we can offer {{date/time}}. Please confirm the address and that this time works for you.' },
  { title: 'Quote follow-up', body: 'Hi {{name}}, just checking whether you had a chance to review the quote. I am happy to clarify anything.' },
  { title: 'Review request', body: 'Hi {{name}}, thank you for choosing CleanFixHarish. If everything was handled well, we would appreciate your honest review.' },
];

function Metric({ label, value, note, icon: Icon, tone = 'teal' }: { label: string; value: string | number; note: string; icon: typeof Users; tone?: string }) {
  const tones: Record<string, string> = { teal: 'bg-[#DDE9E7] text-[#174E57]', brass: 'bg-[#EEE4D4] text-[#84673F]', sage: 'bg-[#DFE8DA] text-[#466049]', stone: 'bg-[#E9E4DE] text-[#615950]' };
  return <Card className="border-[#D8D0C6] bg-[#FBF8F3] shadow-[0_8px_30px_rgba(32,45,44,.04)]"><CardContent className="p-4 lg:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#786F65]">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-[#173F46]">{value}</p><p className="mt-1 text-xs text-[#786F65]">{note}</p></div><div className={`rounded-2xl p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div></CardContent></Card>;
}

function SectionTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#A47D4A]">{eyebrow}</p><h1 className="mt-1 text-2xl font-semibold text-[#173F46] sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-[#756D64]">{description}</p></div>{action}</div>;
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [leads, setLeads] = useState<DashboardLead[]>(starterLeads);
  const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiMode, setApiMode] = useState<'loading' | 'live' | 'starter'>('loading');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await cleanfixApi.listLeads(100);
        const items = response?.items || [];
        if (!items.length) return setApiMode('starter');
        setLeads(items.map((lead: any) => ({
          id: lead.id, customerName: lead.customer_name, phone: lead.phone, service: lead.service_requested,
          location: lead.area || 'Harish', message: lead.description || '', source: lead.source || 'Website',
          date: lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IL') : '—',
          status: normalizeStatus(lead.status), provider: lead.assignment || 'Unassigned', notes: lead.notes || '',
          needsReply: lead.status === 'new' || lead.follow_up_status === 'pending',
        })));
        setApiMode('live');
      } catch { setApiMode('starter'); }
    };
    load();
  }, []);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const haystack = `${lead.customerName} ${lead.phone} ${lead.service} ${lead.location} ${lead.provider}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (statusFilter === 'all' || lead.status === statusFilter);
  }), [leads, query, statusFilter]);

  const changeStatus = async (lead: DashboardLead, status: LeadStatus) => {
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status, needsReply: false } : item));
    setSelectedLead((current) => current?.id === lead.id ? { ...current, status, needsReply: false } : current);
    if (apiMode === 'live') {
      try { await cleanfixApi.updateLead(lead.id, { status }); }
      catch { toast.error('The local view changed, but the server did not save it.'); return; }
    }
    toast.success(`${lead.customerName} moved to ${status}`);
  };

  const openWhatsApp = (lead: DashboardLead, message?: string) => {
    const number = lead.phone.replace(/\D/g, '').replace(/^0/, '972');
    const body = message?.replace('{{name}}', lead.customerName.split(' ')[0]) || `Hi ${lead.customerName.split(' ')[0]}, thank you for contacting CleanFixHarish.`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
  };

  const counts = { new: leads.filter((l) => l.status === 'new').length, active: leads.filter((l) => ['scheduled', 'in progress'].includes(l.status)).length, completed: leads.filter((l) => l.status === 'completed').length, replies: leads.filter((l) => l.needsReply).length };

  return <div className="min-h-screen bg-[#F2EDE5] text-[#243538]">
    <div className="fixed inset-0 pointer-events-none opacity-50 [background-image:url('/assets/brand/background-grid.svg')] [background-size:900px_auto]" />
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#D8D0C6] bg-[#153E45] text-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5"><img src="/assets/brand/cf-home-support-emblem-128.png" alt="CleanFixHarish home support emblem" className="h-11 w-11 rounded-xl"/><div><p className="font-semibold">CleanFixHarish</p><p className="text-[10px] uppercase tracking-[.18em] text-white/55">Manager OS</p></div></div>
      <nav className="flex-1 space-y-1 p-3">{navigation.map((item) => <button key={item.id} onClick={() => setSection(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${section === item.id ? 'bg-[#F7F2EA] text-[#173F46] shadow-sm' : 'text-white/72 hover:bg-white/8 hover:text-white'}`}><item.icon className="h-4 w-4"/><span className="flex-1 text-left">{item.label}</span>{item.id === 'leads' && counts.new > 0 && <span className="rounded-full bg-[#B8905B] px-2 py-0.5 text-[10px] text-white">{counts.new}</span>}</button>)}</nav>
      <div className="border-t border-white/10 p-4"><div className="rounded-2xl bg-white/7 p-3"><div className="flex items-center gap-2 text-xs"><ShieldCheck className="h-4 w-4 text-[#D8C092]"/><span>Owner workspace</span></div><p className="mt-2 truncate text-xs text-white/55">{user?.email || 'CleanFixHarish admin'}</p></div></div>
    </aside>

    <header className="sticky top-0 z-30 border-b border-[#D8D0C6] bg-[#F7F2EA]/90 backdrop-blur-xl lg:ml-64"><div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNav(true)}><Menu className="h-5 w-5"/></Button><div className="hidden sm:block"><p className="text-xs text-[#786F65]">Saturday, 12 July</p><p className="text-sm font-medium text-[#173F46]">Good morning, Aviel</p></div></div><div className="flex items-center gap-2"><Badge variant="outline" className="hidden border-[#BFCFCB] bg-[#E4ECEA] text-[#31585E] sm:flex"><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${apiMode === 'live' ? 'bg-emerald-600' : 'bg-[#B8905B]'}`}/>{apiMode === 'live' ? 'Live data' : apiMode === 'loading' ? 'Connecting' : 'Starter workspace'}</Badge><Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out"><LogOut className="h-4 w-4"/></Button></div></div></header>

    <Sheet open={mobileNav} onOpenChange={setMobileNav}><SheetContent side="left" className="w-[290px] bg-[#153E45] p-0 text-white"><SheetHeader className="border-b border-white/10 p-5 text-left"><SheetTitle className="flex items-center gap-3 text-white"><img src="/assets/brand/cf-home-support-emblem-128.png" className="h-10 w-10 rounded-xl" alt=""/>Manager OS</SheetTitle></SheetHeader><nav className="space-y-1 p-3">{navigation.map((item) => <button key={item.id} onClick={() => {setSection(item.id);setMobileNav(false);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${section === item.id ? 'bg-[#F7F2EA] text-[#173F46]' : 'text-white/75'}`}><item.icon className="h-4 w-4"/>{item.label}</button>)}</nav></SheetContent></Sheet>

    <main className="relative z-10 p-4 sm:p-6 lg:ml-64 lg:p-8">
      {section === 'overview' && <Overview leads={leads} counts={counts} setSection={setSection} setSelectedLead={setSelectedLead} openWhatsApp={openWhatsApp}/>}
      {section === 'leads' && <Leads leads={filteredLeads} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} setSelectedLead={setSelectedLead}/>}
      {section === 'whatsapp' && <WhatsAppOps leads={leads} openWhatsApp={openWhatsApp}/>}
      {section === 'jobs' && <Jobs/>}
      {section === 'providers' && <Providers/>}
      {section === 'services' && <Services/>}
      {section === 'content' && <ContentControl/>}
      {section === 'followups' && <FollowUps leads={leads} openWhatsApp={openWhatsApp}/>}
      {section === 'internal' && <InternalOS/>}
    </main>

    <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-[#D8D0C6] bg-[#FBF8F3]">{selectedLead && <><DialogHeader><DialogTitle className="text-2xl text-[#173F46]">{selectedLead.customerName}</DialogTitle></DialogHeader><div className="space-y-5"><div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#F0EAE1] p-4 text-sm"><Info label="Phone" value={selectedLead.phone}/><Info label="Service" value={selectedLead.service}/><Info label="Location" value={selectedLead.location}/><Info label="Provider" value={selectedLead.provider}/></div><div><Label>Customer message</Label><p className="mt-1 rounded-xl border border-[#DDD3C7] bg-white p-3 text-sm">{selectedLead.message}</p></div><div><Label>Status</Label><Select value={selectedLead.status} onValueChange={(value) => changeStatus(selectedLead, value as LeadStatus)}><SelectTrigger className="mt-1 bg-white"><SelectValue/></SelectTrigger><SelectContent>{pipeline.map((status) => <SelectItem key={status} value={status}>{title(status)}</SelectItem>)}</SelectContent></Select></div><div><Label>Internal notes</Label><Textarea className="mt-1 bg-white" defaultValue={selectedLead.notes} rows={4}/></div><div className="flex flex-col gap-2 sm:flex-row"><Button className="flex-1 bg-[#174E57] hover:bg-[#0E343B]" onClick={() => openWhatsApp(selectedLead)}><MessageCircle className="mr-2 h-4 w-4"/>Open WhatsApp</Button><Button variant="outline" className="flex-1" onClick={() => toast.success('Notes saved')}><Check className="mr-2 h-4 w-4"/>Save notes</Button></div></div></>}</DialogContent></Dialog>
  </div>;
}

function Overview({ leads, counts, setSection, setSelectedLead, openWhatsApp }: { leads: DashboardLead[]; counts: any; setSection: (s: Section) => void; setSelectedLead: (l: DashboardLead) => void; openWhatsApp: (l: DashboardLead) => void }) {
  return <><SectionTitle eyebrow="Owner workspace" title="Business overview" description="What needs your attention today, across leads, jobs and customer follow-up." action={<Button className="bg-[#174E57] hover:bg-[#0E343B]" onClick={() => setSection('leads')}><Plus className="mr-2 h-4 w-4"/>Add lead</Button>}/><div className="grid grid-cols-2 gap-3 xl:grid-cols-6"><Metric label="Total leads" value={leads.length} note="All sources" icon={Users}/><Metric label="New leads" value={counts.new} note="Needs triage" icon={Inbox} tone="brass"/><Metric label="Active jobs" value={counts.active} note="Scheduled + active" icon={BriefcaseBusiness} tone="sage"/><Metric label="Completed" value={counts.completed} note="This workspace" icon={CheckCircle2}/><Metric label="Follow-ups" value={counts.replies} note="Needs reply" icon={Clock3} tone="brass"/><Metric label="Providers" value={providers.length} note="Active directory" icon={HardHat} tone="stone"/></div>
  <div className="mt-6 grid gap-6 xl:grid-cols-[1.62fr_1fr]"><Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-lg text-[#173F46]">Priority inbox</CardTitle><p className="mt-1 text-xs text-[#786F65]">New and unanswered customer requests</p></div><Button variant="ghost" size="sm" onClick={() => setSection('leads')}>View all<ChevronRight className="ml-1 h-4 w-4"/></Button></CardHeader><CardContent className="space-y-2">{leads.filter((l) => l.needsReply || l.status === 'new').slice(0,4).map((lead) => <div key={lead.id} className="flex flex-col gap-3 rounded-2xl border border-[#E0D7CC] bg-white p-3 sm:flex-row sm:items-center"><button className="flex-1 text-left" onClick={() => setSelectedLead(lead)}><div className="flex items-center gap-2"><span className="font-medium text-[#243538]">{lead.customerName}</span><Badge className={statusStyle[lead.status]}>{lead.status}</Badge></div><p className="mt-1 text-xs text-[#786F65]">{lead.service} · {lead.location} · {lead.date}</p></button><Button variant="outline" size="sm" onClick={() => openWhatsApp(lead)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>Reply</Button></div>)}</CardContent></Card><Card className="border-[#D8D0C6] bg-[#173F46] text-white"><CardHeader><CardTitle className="text-lg text-white">Quick actions</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{[{l:'Add lead',i:Plus,s:'leads'},{l:'Assign provider',i:HardHat,s:'providers'},{l:'Send WhatsApp',i:MessageCircle,s:'whatsapp'},{l:'Review jobs',i:ClipboardCheck,s:'jobs'}].map((a) => <button key={a.l} onClick={() => setSection(a.s as Section)} className="rounded-2xl border border-white/10 bg-white/7 p-4 text-left transition hover:bg-white/12"><a.i className="mb-5 h-5 w-5 text-[#D8C092]"/><span className="block text-sm">{a.l}</span></button>)}</CardContent></Card></div>
  <div className="mt-6 grid gap-6 lg:grid-cols-2"><Panel title="Today’s jobs" subtitle="Upcoming work and next actions">{jobs.map((job) => <div key={job.id} className="flex items-start gap-3 border-b border-[#E5DDD3] py-3 last:border-0"><div className="mt-1 rounded-xl bg-[#DFE8DA] p-2 text-[#466049]"><CalendarClock className="h-4 w-4"/></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{job.customer} · {job.service}</p><p className="text-xs text-[#786F65]">{job.when} · {job.provider}</p><p className="mt-1 text-xs text-[#A47D4A]">Next: {job.next}</p></div><Badge variant="outline">{job.status}</Badge></div>)}</Panel><Panel title="Recent activity" subtitle="A clear record of operational changes">{activity.map((item) => <div key={`${item.time}-${item.text}`} className="flex gap-3 border-b border-[#E5DDD3] py-3 last:border-0"><div className="mt-1 h-2 w-2 rounded-full bg-[#B8905B]"/><div className="flex-1"><p className="text-sm">{item.text}</p><p className="mt-0.5 text-xs text-[#786F65]">{item.time} · {item.type}</p></div></div>)}</Panel></div></>;
}

function Leads({ leads, query, setQuery, statusFilter, setStatusFilter, setSelectedLead }: any) { return <><SectionTitle eyebrow="Customer pipeline" title="Leads CRM" description="Search, triage and move every inquiry toward a clear next action." action={<Button className="bg-[#174E57]" onClick={() => toast.info('Lead form will connect to the backend create endpoint.')}><Plus className="mr-2 h-4 w-4"/>Add lead</Button>}/><Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-[#8A8177]"/><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, service or provider" className="bg-white pl-9"/></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="bg-white md:w-48"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{pipeline.map((status) => <SelectItem key={status} value={status}>{title(status)}</SelectItem>)}</SelectContent></Select></div></CardContent></Card><div className="mt-4 overflow-hidden rounded-2xl border border-[#D8D0C6] bg-[#FBF8F3]"><div className="hidden grid-cols-[1.2fr_1fr_.8fr_.8fr_1fr_38px] gap-4 border-b bg-[#ECE5DB] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[#786F65] md:grid"><span>Customer</span><span>Service</span><span>Source</span><span>Status</span><span>Provider</span><span/></div>{leads.map((lead: DashboardLead) => <button key={lead.id} onClick={() => setSelectedLead(lead)} className="grid w-full gap-2 border-b border-[#E5DDD3] px-4 py-4 text-left transition last:border-0 hover:bg-white md:grid-cols-[1.2fr_1fr_.8fr_.8fr_1fr_38px] md:items-center md:gap-4"><div><div className="flex items-center gap-2"><p className="text-sm font-medium">{lead.customerName}</p>{lead.needsReply && <span className="h-2 w-2 rounded-full bg-[#B8905B]" title="Needs reply"/>}</div><p className="text-xs text-[#786F65]">{lead.phone} · {lead.location}</p></div><div><p className="text-sm">{lead.service}</p><p className="line-clamp-1 text-xs text-[#786F65]">{lead.message}</p></div><p className="text-xs text-[#786F65]">{lead.source}<br/>{lead.date}</p><Badge className={`w-fit ${statusStyle[lead.status]}`}>{lead.status}</Badge><p className="text-xs">{lead.provider}</p><MoreHorizontal className="hidden h-4 w-4 md:block"/></button>)}{!leads.length && <div className="p-12 text-center text-sm text-[#786F65]">No leads match these filters.</div>}</div></> }

function WhatsAppOps({ leads, openWhatsApp }: { leads: DashboardLead[]; openWhatsApp: (l: DashboardLead, m?: string) => void }) { const pending = leads.filter((l) => l.needsReply); return <><SectionTitle eyebrow="WhatsApp-first operations" title="Customer messages" description="Use approved, calm templates and keep unanswered customers visible."/><div className="grid gap-6 xl:grid-cols-[1fr_1.62fr]"><Panel title={`${pending.length} replies needed`} subtitle="Oldest unanswered inquiries should be handled first">{pending.map((lead) => <div key={lead.id} className="flex items-center gap-3 border-b border-[#E5DDD3] py-3 last:border-0"><div className="rounded-full bg-[#DCE9EA] p-2"><MessageCircle className="h-4 w-4 text-[#174E57]"/></div><div className="flex-1"><p className="text-sm font-medium">{lead.customerName}</p><p className="text-xs text-[#786F65]">{lead.service} · {lead.date}</p></div><Button size="sm" className="bg-[#174E57]" onClick={() => openWhatsApp(lead)}>Reply</Button></div>)}</Panel><Panel title="Approved response templates" subtitle="Review the text before WhatsApp opens">{templates.map((template) => <div key={template.title} className="mb-3 rounded-2xl border border-[#E0D7CC] bg-white p-4 last:mb-0"><div className="flex items-center justify-between"><p className="text-sm font-medium text-[#173F46]">{template.title}</p><Badge variant="outline">English</Badge></div><p className="mt-2 text-xs leading-5 text-[#786F65]">{template.body}</p><div className="mt-3 flex gap-2"><Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(template.body).then(() => toast.success('Template copied'))}><FileText className="mr-1.5 h-3.5 w-3.5"/>Copy</Button>{pending[0] && <Button size="sm" className="bg-[#174E57]" onClick={() => openWhatsApp(pending[0], template.body)}><Send className="mr-1.5 h-3.5 w-3.5"/>Use for next lead</Button>}</div></div>)}</Panel></div></> }

function Jobs() { return <><SectionTitle eyebrow="Delivery" title="Jobs & tasks" description="Track commitments, ownership and the next action for every active job." action={<Button className="bg-[#174E57]" onClick={() => toast.info('Job creation is ready for backend wiring.')}><Plus className="mr-2 h-4 w-4"/>Create job</Button>}/><div className="grid gap-4">{jobs.map((job) => <Card key={job.id} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_.8fr_.8fr] md:items-center"><div><p className="text-xs font-semibold text-[#A47D4A]">{job.id}</p><p className="mt-1 font-medium text-[#173F46]">{job.customer}</p><p className="text-sm text-[#786F65]">{job.service}</p></div><div><p className="text-xs text-[#786F65]">Assigned provider</p><p className="mt-1 text-sm font-medium">{job.provider}</p><p className="text-xs text-[#786F65]">{job.when}</p></div><div><Badge className="bg-[#DCE5F0] text-[#35546D]">{job.status}</Badge><p className="mt-2 text-xs">{job.price} · {job.urgency}</p></div><div><p className="text-xs text-[#786F65]">Next action</p><p className="mt-1 text-sm">{job.next}</p></div></CardContent></Card>)}</div></> }

function Providers() { return <><SectionTitle eyebrow="Trusted network" title="Provider management" description="Internal availability and reliability notes. Provider contact details remain private." action={<Button className="bg-[#174E57]"><Plus className="mr-2 h-4 w-4"/>Add provider</Button>}/><div className="grid gap-4 md:grid-cols-2">{providers.map((provider) => <Card key={provider.name} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-5"><div className="flex items-start justify-between"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDE9E7] font-semibold text-[#174E57]">{provider.name.split(' ').map((p) => p[0]).slice(0,2).join('')}</div><div><p className="font-medium text-[#173F46]">{provider.name}</p><p className="text-xs text-[#786F65]">{provider.specialty}</p></div></div><div className="flex items-center text-sm text-[#84673F]"><Star className="mr-1 h-3.5 w-3.5 fill-current"/>{provider.rating}</div></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#F0EAE1] p-3 text-xs"><Info label="Area" value={provider.area}/><Info label="Availability" value={provider.availability}/></div><p className="mt-4 text-xs leading-5 text-[#6F675F]">Internal: {provider.trust}</p><div className="mt-4 flex gap-2"><Button variant="outline" size="sm"><Phone className="mr-1.5 h-3.5 w-3.5"/>{provider.phone}</Button><Button variant="ghost" size="sm">Assign</Button></div></CardContent></Card>)}</div></> }

function Services() { const [items, setItems] = useState(services); return <><SectionTitle eyebrow="Offer management" title="Services & pricing" description="Keep public promises separate from internal quoting guidance."/><div className="space-y-4">{items.map((service, index) => <Card key={service.name} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start"><div className="flex-1"><div className="flex items-center gap-2"><h3 className="font-sans text-base font-semibold text-[#173F46]">{service.name}</h3><Badge variant="outline">{service.priority}</Badge></div><p className="mt-2 text-sm text-[#625B53]">{service.publicCopy}</p><p className="mt-3 rounded-xl bg-[#F0EAE1] p-3 text-xs text-[#756D64]"><strong>Internal guidance:</strong> {service.guidance}</p></div><div className="flex items-center gap-3"><span className="text-xs text-[#786F65]">Public</span><Switch checked={service.active} onCheckedChange={(active) => setItems((current) => current.map((item, i) => i === index ? {...item, active} : item))}/><Button variant="outline" size="sm"><PencilLine className="mr-1.5 h-3.5 w-3.5"/>Edit</Button></div></div></CardContent></Card>)}</div></> }

function ContentControl() {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [selected, setSelected] = useState<CmsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cleanfixApi.listSiteContent().then((result) => setItems(result?.items || []))
      .catch(() => toast.error('Website content could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await cleanfixApi.updateSiteContent(selected.id, {
        title_en: selected.title_en, title_he: selected.title_he,
        content_en: selected.content_en, content_he: selected.content_he,
        is_active: selected.is_active,
      });
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelected(null);
      toast.success('Website content published. The public page will use it on refresh.');
    } catch { toast.error('The content was not saved.'); }
    finally { setSaving(false); }
  };

  return <><SectionTitle eyebrow="Website control" title="Content & visuals" description="Edit the live English and Hebrew content stored by the CleanFixHarish backend." action={<Button variant="outline" asChild><a href="/" target="_blank">Preview website<ExternalLink className="ml-2 h-4 w-4"/></a></Button>}/><div className="grid gap-6 xl:grid-cols-[1.62fr_1fr]"><Panel title="Live content blocks" subtitle={loading ? 'Connecting to content storage…' : `${items.length} bilingual blocks available`}>{items.map((item) => <button key={item.id} onClick={() => setSelected({...item})} className="flex w-full items-center gap-3 border-b border-[#E5DDD3] py-4 text-left last:border-0"><div className="rounded-xl bg-[#DDE9E7] p-2"><FileText className="h-4 w-4 text-[#174E57]"/></div><div className="flex-1"><p className="text-sm font-medium">{title(item.section_key)}</p><p className="line-clamp-1 text-xs text-[#786F65]">{item.title_en || 'Untitled'} · EN/HE</p></div><Badge variant="outline" className={item.is_active === false ? 'text-[#854D37]' : 'text-[#2E6840]'}>{item.is_active === false ? 'Hidden' : 'Published'}</Badge><ChevronRight className="h-4 w-4"/></button>)}{!loading && !items.length && <p className="py-8 text-center text-sm text-[#786F65]">No content blocks are stored yet.</p>}</Panel><Panel title="Visual system" subtitle="Approved brand assets and image assignments"><div className="rounded-2xl bg-[#173F46] p-5 text-white"><div className="flex items-center gap-3"><img src="/assets/brand/cf-home-support-emblem-128.png" className="h-14 w-14 rounded-2xl" alt="CleanFixHarish home support emblem"/><div><p className="font-medium">Home Support Emblem</p><p className="text-xs text-white/60">Navy · ivory · brushed gold</p></div></div><div className="mt-5 flex gap-2">{['#102E38','#F7F2EA','#E8D8BE','#C7A36B','#D8E5E1'].map((color) => <span key={color} className="h-8 flex-1 rounded-lg border border-white/10" style={{background:color}} title={color}/>)}</div></div><p className="mt-4 text-xs leading-5 text-[#786F65]">The official home-support emblem, full PWA icon pack, background vectors, and reviewed service images are installed in the website asset library.</p></Panel></div><Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-[#FBF8F3]">{selected && <><DialogHeader><DialogTitle>Edit {title(selected.section_key)}</DialogTitle></DialogHeader><div className="grid gap-5 sm:grid-cols-2"><FieldArea label="English title" value={selected.title_en || ''} onChange={(value) => setSelected({...selected,title_en:value})}/><FieldArea label="Hebrew title" value={selected.title_he || ''} onChange={(value) => setSelected({...selected,title_he:value})} rtl/><FieldArea label="English content" value={selected.content_en || ''} onChange={(value) => setSelected({...selected,content_en:value})} large/><FieldArea label="Hebrew content" value={selected.content_he || ''} onChange={(value) => setSelected({...selected,content_he:value})} large rtl/></div><div className="flex items-center justify-between rounded-xl bg-[#F0EAE1] p-4"><div><p className="text-sm font-medium">Published on website</p><p className="text-xs text-[#786F65]">Hidden blocks fall back to the safe built-in copy.</p></div><Switch checked={selected.is_active !== false} onCheckedChange={(value) => setSelected({...selected,is_active:value})}/></div><Button onClick={save} disabled={saving} className="w-full bg-[#174E57]">{saving ? 'Publishing…' : 'Publish content'}</Button></>}</DialogContent></Dialog></>;
}

function FieldArea({ label, value, onChange, large, rtl }: { label: string; value: string; onChange: (value: string) => void; large?: boolean; rtl?: boolean }) { return <div><Label>{label}</Label>{large ? <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={6} dir={rtl ? 'rtl' : 'ltr'} className="mt-1.5 bg-white"/> : <Input value={value} onChange={(event) => onChange(event.target.value)} dir={rtl ? 'rtl' : 'ltr'} className="mt-1.5 bg-white"/>}</div>; }

function FollowUps({ leads, openWhatsApp }: { leads: DashboardLead[]; openWhatsApp: (l: DashboardLead, m?: string) => void }) { const followups = leads.filter((l) => l.status === 'follow-up' || l.status === 'completed' || l.status === 'quoted'); return <><SectionTitle eyebrow="Customer care" title="Follow-ups & reviews" description="Close the loop calmly and ask for honest reviews only after completed work."/><Panel title="Follow-up queue" subtitle="Prioritized by next useful customer action">{followups.map((lead) => <div key={lead.id} className="flex flex-col gap-3 border-b border-[#E5DDD3] py-4 last:border-0 sm:flex-row sm:items-center"><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-medium">{lead.customerName}</p><Badge className={statusStyle[lead.status]}>{lead.status}</Badge></div><p className="mt-1 text-xs text-[#786F65]">{lead.service} · {lead.notes}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => openWhatsApp(lead, lead.status === 'completed' ? templates[3].body : templates[2].body)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>{lead.status === 'completed' ? 'Request review' : 'Follow up'}</Button><Button variant="ghost" size="sm" onClick={() => toast.success('Follow-up marked complete')}><Check className="h-4 w-4"/></Button></div></div>)}</Panel></> }

function InternalOS() { return <><SectionTitle eyebrow="Company headquarters" title="Internal operating system" description="Decisions, reminders and project instructions kept close to daily operations."/><div className="grid gap-6 lg:grid-cols-3"><Panel title="Today’s priorities" subtitle="Keep the list short and operational"><Checklist items={['Reply to new handyman leads','Confirm Sunday electrical job','Review homepage visual direction','Rotate exposed GitHub token']}/></Panel><Panel title="Operating principles" subtitle="Applied before every change"><div className="space-y-3">{['Simplicity before complexity','Trust before growth hacks','Preserve existing work','Use the cheapest capable tool','One source of truth'].map((item) => <div key={item} className="flex items-center gap-2 text-sm"><BadgeCheck className="h-4 w-4 text-[#174E57]"/>{item}</div>)}</div></Panel><Panel title="Connections" subtitle="Configuration and health"><Connection name="GitHub" state="Connected"/><Connection name="Google Workspace" state="Available"/><Connection name="Cloudflare" state="Needs verification"/><Connection name="Atoms AI" state="Via GitHub"/></Panel></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.62fr_1fr]"><Panel title="Project progress" subtitle="Phase 1: launch and operational readiness"><Progress value={58} className="mt-3"/><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Info label="Current phase" value="Foundation & dashboard"/><Info label="Main objective" value="Launch and receive leads"/><Info label="Primary service" value="Handyman"/><Info label="Official routing" value="050-827-5505"/></div></Panel><Panel title="Add internal note" subtitle="Capture a decision without losing context"><Textarea placeholder="Decision, reminder or operational note…" className="min-h-28 bg-white"/><Button className="mt-3 w-full bg-[#174E57]" onClick={() => toast.success('Internal note saved locally')}>Save note</Button></Panel></div></> }

function Panel({ title: heading, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardHeader className="pb-2"><CardTitle className="font-sans text-base font-semibold text-[#173F46]">{heading}</CardTitle><p className="text-xs text-[#786F65]">{subtitle}</p></CardHeader><CardContent>{children}</CardContent></Card> }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8177]">{label}</p><p className="mt-1 text-sm font-medium text-[#324346]">{value}</p></div> }
function Checklist({ items }: { items: string[] }) { const [done, setDone] = useState<number[]>([]); return <div className="space-y-2">{items.map((item, i) => <button key={item} onClick={() => setDone((current) => current.includes(i) ? current.filter((x) => x !== i) : [...current, i])} className="flex w-full items-center gap-3 rounded-xl border border-[#E0D7CC] bg-white p-3 text-left text-sm"><span className={`flex h-5 w-5 items-center justify-center rounded-md border ${done.includes(i) ? 'border-[#174E57] bg-[#174E57] text-white' : 'border-[#CFC5B9]'}`}>{done.includes(i) && <Check className="h-3 w-3"/>}</span><span className={done.includes(i) ? 'text-[#8A8177] line-through' : ''}>{item}</span></button>)}</div> }
function Connection({ name, state }: { name: string; state: string }) { const ready = ['Connected','Available','Via GitHub'].includes(state); return <div className="flex items-center justify-between border-b border-[#E5DDD3] py-3 last:border-0"><span className="text-sm">{name}</span><Badge className={ready ? 'bg-[#DCEADF] text-[#2E6840]' : 'bg-[#EEE4D4] text-[#765D38]'}>{state}</Badge></div> }
function title(value: string) { return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()); }
function normalizeStatus(value: string): LeadStatus { const map: Record<string, LeadStatus> = { booked: 'scheduled', lost: 'cancelled', follow_up: 'follow-up', in_progress: 'in progress' }; const normalized = map[value] || value; return pipeline.includes(normalized as LeadStatus) ? normalized as LeadStatus : 'new'; }
