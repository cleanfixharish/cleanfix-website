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
  Bot, Cloud, Copy, Database, Github, Image, KeyRound, RotateCcw, Sparkles, Star, Upload, Users, Wrench, X,
} from 'lucide-react';
import { absoluteApiUrl, cleanfixApi } from '@/lib/cleanfixApi';

type Section = 'overview' | 'assistant' | 'leads' | 'whatsapp' | 'jobs' | 'providers' | 'services' | 'content' | 'followups' | 'platforms' | 'internal';
type LeadStatus = 'new' | 'contacted' | 'quoted' | 'scheduled' | 'in progress' | 'completed' | 'follow-up' | 'cancelled';
type DashboardLead = { id: number; customerName: string; phone: string; service: string; location: string; message: string; source: string; date: string; status: LeadStatus; provider: string; notes: string; needsReply: boolean; followUpStatus: string };
type DashboardJob = { id: number; leadId?: number; customerName: string; title: string; phone: string; address: string; status: string; scheduledFor?: string; price?: number; notes: string };
type CmsItem = { id: number; section_key: string; title_en?: string; title_he?: string; content_en?: string; content_he?: string; is_active?: boolean };
type AdminPartner = { id: number; name: string; businessType: string; phone: string; area: string; description: string; isActive: boolean };
type AdminService = { id: number; name: string; nameHe: string; description: string; descriptionHe: string; category: string; active: boolean; priceFrom: string; priceUnit: string; priceNoteEn: string; priceNoteHe: string; imageUrl: string };
type SiteSettings = { primary_color: string; accent_color: string; surface_color: string; hero_image_url?: string; cta_image_url?: string; hero_layout: string; primary_cta_en?: string; primary_cta_he?: string; secondary_cta_en?: string; secondary_cta_he?: string };
type MediaItem = { id: number; filename: string; alt_text?: string; url: string };

const navigation: { id: Section; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
  { id: 'overview', label: 'Today', icon: LayoutDashboard },
  { id: 'assistant', label: 'AI Assistant', icon: Bot },
  { id: 'leads', label: 'Customers', icon: Inbox },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'providers', label: 'Providers', icon: HardHat },
  { id: 'whatsapp', label: 'Messages', icon: MessageCircle },
  { id: 'services', label: 'Business', icon: Wrench },
  { id: 'content', label: 'Website', icon: Globe2 },
  { id: 'followups', label: 'Follow-ups', icon: HeartHandshake },
  { id: 'platforms', label: 'Platforms', icon: Cloud },
  { id: 'internal', label: 'Settings', icon: BookOpen },
];

const pipeline: LeadStatus[] = ['new', 'contacted', 'quoted', 'scheduled', 'in progress', 'completed', 'follow-up', 'cancelled'];
const statusStyle: Record<LeadStatus, string> = {
  new: 'bg-[#DCE9EA] text-[#174E57]', contacted: 'bg-[#EEE4D4] text-[#765D38]', quoted: 'bg-[#E7E2EF] text-[#5A4C70]',
  scheduled: 'bg-[#DBE5D9] text-[#405F43]', 'in progress': 'bg-[#DCE5F0] text-[#35546D]', completed: 'bg-[#DCEADF] text-[#2E6840]',
  'follow-up': 'bg-[#F2E1D7] text-[#854D37]', cancelled: 'bg-[#EAE7E3] text-[#746D65]',
};

const viewerLockedSections: Section[] = ['assistant', 'whatsapp', 'content', 'followups', 'platforms', 'internal'];

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
  const { user, logout, isViewer } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [providers, setProviders] = useState<AdminPartner[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingLead, setSavingLead] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [apiMode, setApiMode] = useState<'loading' | 'live' | 'error'>('loading');

  useEffect(() => {
    const load = async () => {
      try {
        const viewerData = isViewer ? await cleanfixApi.getViewerDashboard() : null;
        const [leadResponse, jobResponse, partnerResponse, serviceResponse] = viewerData
          ? [viewerData.leads, viewerData.jobs, viewerData.partners, viewerData.services]
          : await Promise.all([
              cleanfixApi.listLeads(100), cleanfixApi.listJobs(), cleanfixApi.listPartners(), cleanfixApi.listServices(),
            ]);
        const items = leadResponse?.items || [];
        setLeads(items.map((lead: any) => ({
          id: lead.id, customerName: lead.customer_name, phone: lead.phone, service: lead.service_requested,
          location: lead.area || 'Harish', message: lead.description || '', source: lead.source || 'Website',
          date: lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IL') : '—',
          status: normalizeStatus(lead.status), provider: lead.assignment || 'Unassigned', notes: lead.notes || '',
          needsReply: lead.status === 'new' || lead.follow_up_status === 'pending', followUpStatus: lead.follow_up_status || '',
        })));
        setJobs((jobResponse?.items || []).map((job: any) => ({
          id: job.id, leadId: job.lead_id, customerName: job.customer_name, title: job.title,
          phone: job.phone || '', address: job.address || '', status: job.status || 'scheduled',
          scheduledFor: job.scheduled_for, price: job.price == null ? undefined : Number(job.price), notes: job.notes || '',
        })));
        setProviders((partnerResponse?.items || []).map((partner: any) => ({
          id: partner.id, name: partner.name, businessType: partner.business_type || partner.partner_type || 'Service provider',
          phone: partner.phone || partner.whatsapp || '', area: partner.area || 'Harish',
          description: partner.description_en || '', isActive: partner.is_active !== false,
        })));
        setServices((serviceResponse?.items || []).map((service: any) => ({
          id: service.id, name: service.name_en, nameHe: service.name_he || '', description: service.description_en || '', descriptionHe: service.description_he || '',
          category: service.category || 'Service', active: service.is_active !== false, priceFrom: service.price_from == null ? '' : String(service.price_from),
          priceUnit: service.price_unit || '', priceNoteEn: service.price_note_en || '', priceNoteHe: service.price_note_he || '', imageUrl: service.image_url || '',
        })));
        setApiMode('live');
      } catch {
        setApiMode('error');
        toast.error('The manager could not load live business data. No demonstration data was shown.');
      }
    };
    load();
  }, [isViewer]);

  useEffect(() => {
    setNoteDraft(selectedLead?.notes || '');
  }, [selectedLead?.id]);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const haystack = `${lead.customerName} ${lead.phone} ${lead.service} ${lead.location} ${lead.provider}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (statusFilter === 'all' || lead.status === statusFilter);
  }), [leads, query, statusFilter]);

  const changeStatus = async (lead: DashboardLead, status: LeadStatus) => {
    try { await cleanfixApi.updateLead(lead.id, { status }); }
    catch { toast.error('The status was not saved. Please try again.'); return; }
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status, needsReply: false } : item));
    setSelectedLead((current) => current?.id === lead.id ? { ...current, status, needsReply: false } : current);
    toast.success(`${lead.customerName} moved to ${status}`);
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    setSavingLead(true);
    try {
      await cleanfixApi.updateLead(selectedLead.id, { notes: noteDraft });
      setLeads((current) => current.map((lead) => lead.id === selectedLead.id ? { ...lead, notes: noteDraft } : lead));
      setSelectedLead({ ...selectedLead, notes: noteDraft });
      toast.success('Notes saved to the database.');
    } catch { toast.error('The notes were not saved.'); }
    finally { setSavingLead(false); }
  };

  const createJobForLead = async (lead: DashboardLead) => {
    if (jobs.some((job) => job.leadId === lead.id)) { setSection('jobs'); setSelectedLead(null); return; }
    setSavingLead(true);
    try {
      const job = await cleanfixApi.createJob({
        lead_id: lead.id, customer_name: lead.customerName, title: lead.service || 'Customer job',
        phone: lead.phone, address: lead.location, status: 'scheduled', notes: lead.notes,
      });
      setJobs((current) => [{
        id: job.id, leadId: job.lead_id, customerName: job.customer_name, title: job.title,
        phone: job.phone || '', address: job.address || '', status: job.status,
        scheduledFor: job.scheduled_for, price: job.price == null ? undefined : Number(job.price), notes: job.notes || '',
      }, ...current]);
      if (lead.status !== 'scheduled') await changeStatus(lead, 'scheduled');
      setSelectedLead(null); setSection('jobs'); toast.success('A real job was created.');
    } catch { toast.error('The job was not created.'); }
    finally { setSavingLead(false); }
  };

  const completeFollowUp = async (lead: DashboardLead) => {
    try {
      await cleanfixApi.updateLead(lead.id, { follow_up_status: 'completed' });
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, followUpStatus: 'completed', needsReply: false } : item));
      toast.success('Follow-up saved as complete.');
    } catch { toast.error('The follow-up was not saved.'); }
  };

  const openWhatsApp = (lead: DashboardLead, message?: string) => {
    const number = lead.phone.replace(/\D/g, '').replace(/^0/, '972');
    const body = message?.replace('{{name}}', lead.customerName.split(' ')[0]) || `Hi ${lead.customerName.split(' ')[0]}, thank you for contacting CleanFixHarish.`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
  };

  const counts = { new: leads.filter((l) => l.status === 'new').length, active: leads.filter((l) => ['scheduled', 'in progress'].includes(l.status)).length, completed: leads.filter((l) => l.status === 'completed').length, replies: leads.filter((l) => l.needsReply).length };

  return <div className="min-h-screen overflow-x-hidden bg-[#F2EDE5] text-[#243538]">
    <div className="pointer-events-none fixed inset-0 bg-[url('/assets/brand/v2/golden-ratio-grid.svg')] bg-[length:900px_auto] bg-center opacity-35" />
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#B8842F]/45 bg-[#102E38] bg-[url('/assets/brand/v2/navy-embossed-panel.svg')] bg-cover text-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5"><img src="/assets/brand/cf-gold-monogram-128.png" alt="CleanFixHarish CF gold monogram" className="h-11 w-11 rounded-xl"/><div><p className="font-semibold">CleanFixHarish</p><p className="text-[10px] uppercase tracking-[.18em] text-white/55">Manager OS</p></div></div>
      <nav className="flex-1 space-y-1 p-3">{navigation.map((item) => <button key={item.id} onClick={() => setSection(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${section === item.id ? 'bg-[#F7F2EA] text-[#173F46] shadow-sm' : 'text-white/72 hover:bg-white/8 hover:text-white'}`}><item.icon className="h-4 w-4"/><span className="flex-1 text-left">{item.label}</span>{item.id === 'leads' && counts.new > 0 && <span className="rounded-full bg-[#B8905B] px-2 py-0.5 text-[10px] text-white">{counts.new}</span>}</button>)}</nav>
      <div className="border-t border-white/10 p-4"><div className="rounded-2xl bg-white/7 p-3"><div className="flex items-center gap-2 text-xs"><ShieldCheck className="h-4 w-4 text-[#D8C092]"/><span>{isViewer ? 'Read-only viewer' : 'Owner workspace'}</span></div><p className="mt-2 truncate text-xs text-white/55">{user?.email || 'CleanFixHarish admin'}</p></div></div>
    </aside>

    <header className="sticky top-0 z-30 border-b border-[#D8D0C6] bg-[#F7F2EA]/90 backdrop-blur-xl lg:ml-64"><div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNav(true)}><Menu className="h-5 w-5"/></Button><div className="hidden sm:block"><p className="text-xs text-[#786F65]">CleanFixHarish operations</p><p className="text-sm font-medium text-[#173F46]">Welcome, {user?.name || 'Aviel'}</p></div></div><div className="flex items-center gap-2"><Badge variant="outline" className="hidden border-[#BFCFCB] bg-[#E4ECEA] text-[#31585E] sm:flex"><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${apiMode === 'live' ? 'bg-emerald-600' : apiMode === 'error' ? 'bg-red-600' : 'bg-[#B8905B]'}`}/>{apiMode === 'live' ? 'Live data' : apiMode === 'loading' ? 'Connecting' : 'Connection error'}</Badge><Button variant="ghost" size="icon" aria-label={`${counts.replies} items need attention`} onClick={() => counts.replies ? setSection('followups') : toast.success('Nothing needs your attention right now.')}><Bell className="h-4 w-4"/>{counts.replies > 0 && <span className="absolute ml-4 mb-4 h-2 w-2 rounded-full bg-[#B8905B]"/>}</Button><Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out"><LogOut className="h-4 w-4"/></Button></div></div></header>

    <Sheet open={mobileNav} onOpenChange={setMobileNav}><SheetContent side="left" className="bg-[#153E45] p-0 text-white"><SheetHeader className="border-b border-white/10 p-5 text-left"><SheetTitle className="flex items-center gap-3 text-white"><img src="/assets/brand/cf-gold-monogram-128.png" className="h-10 w-10 rounded-xl" alt=""/>Manager OS</SheetTitle></SheetHeader><nav className="space-y-1 p-3">{navigation.map((item) => <button key={item.id} onClick={() => {setSection(item.id);setMobileNav(false);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${section === item.id ? 'bg-[#F7F2EA] text-[#173F46]' : 'text-white/75'}`}><item.icon className="h-4 w-4 shrink-0"/><span className="min-w-0 truncate">{item.label}</span></button>)}</nav></SheetContent></Sheet>

    <main className="relative z-10 min-w-0 px-3 py-4 sm:p-6 lg:ml-64 lg:p-8">
      {isViewer && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#C8B07C] bg-[#FFF8E8] p-4 text-sm text-[#684F2B]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0"/><div><strong>Live read-only tour</strong><p className="mt-1 text-xs leading-5">You can explore the working dashboard and open its tools. Private customer information is hidden, and no button can save, publish, delete, message, restore, or change business data.</p></div></div>}
      {section === 'overview' && <Overview leads={leads} providers={providers} counts={counts} setSection={setSection} setSelectedLead={setSelectedLead} openWhatsApp={openWhatsApp}/>}
      {isViewer && viewerLockedSections.includes(section) && <ViewerLockedSection/>}
      {!isViewer && section === 'assistant' && <BusinessAssistant leads={leads} jobs={jobs} providers={providers} services={services}/>}
      {section === 'leads' && <Leads leads={filteredLeads} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} setSelectedLead={setSelectedLead}/>}
      {!isViewer && section === 'whatsapp' && <WhatsAppOps leads={leads} openWhatsApp={openWhatsApp}/>}
      {section === 'jobs' && <Jobs jobs={jobs} setJobs={setJobs}/>}
      {section === 'providers' && <Providers providers={providers} setProviders={setProviders}/>}
      {section === 'services' && <><Services items={services} setItems={setServices}/><MarketPriceComparison items={services}/></>}
      {!isViewer && section === 'content' && <ContentControl/>}
      {!isViewer && section === 'followups' && <FollowUps leads={leads} openWhatsApp={openWhatsApp} completeFollowUp={completeFollowUp}/>}
      {!isViewer && section === 'platforms' && <PlatformDirectory/>}
      {!isViewer && section === 'internal' && <InternalOS/>}
    </main>

    <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}><DialogContent className="max-w-xl border-[#D8D0C6] bg-[#FBF8F3]">{selectedLead && <><DialogHeader><DialogTitle className="break-words pr-6 text-xl text-[#173F46] sm:text-2xl">{selectedLead.customerName}</DialogTitle></DialogHeader><div className="space-y-5"><div className="grid grid-cols-1 gap-3 rounded-2xl bg-[#F0EAE1] p-4 text-sm min-[390px]:grid-cols-2"><Info label="Phone" value={selectedLead.phone}/><Info label="Service" value={selectedLead.service}/><Info label="Location" value={selectedLead.location}/><Info label="Provider" value={selectedLead.provider}/></div><div><Label>Customer message</Label><p className="mt-1 break-words rounded-xl border border-[#DDD3C7] bg-white p-3 text-sm">{selectedLead.message}</p></div><div><Label>Status</Label><Select value={selectedLead.status} onValueChange={(value) => changeStatus(selectedLead, value as LeadStatus)}><SelectTrigger className="mt-1 bg-white"><SelectValue/></SelectTrigger><SelectContent>{pipeline.map((status) => <SelectItem key={status} value={status}>{title(status)}</SelectItem>)}</SelectContent></Select></div><div><Label>Internal notes</Label><Textarea className="mt-1 bg-white" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} rows={4}/></div><div className="grid gap-2 sm:grid-cols-3"><Button className="bg-[#174E57] hover:bg-[#0E343B]" onClick={() => openWhatsApp(selectedLead)}><MessageCircle className="mr-2 h-4 w-4"/>WhatsApp</Button><Button variant="outline" onClick={saveNotes} disabled={savingLead}><Check className="mr-2 h-4 w-4"/>{savingLead ? 'Saving…' : 'Save notes'}</Button><Button variant="outline" onClick={() => createJobForLead(selectedLead)} disabled={savingLead}><BriefcaseBusiness className="mr-2 h-4 w-4"/>{jobs.some((job) => job.leadId === selectedLead.id) ? 'View job' : 'Create job'}</Button></div></div></>}</DialogContent></Dialog>
  </div>;
}

function ViewerLockedSection() {
  return <div className="flex min-h-[55vh] items-center justify-center"><Card className="w-full max-w-lg border-[#D8D0C6] bg-[#FBF8F3] text-center"><CardContent className="p-8 sm:p-12"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEE4D4]"><ShieldCheck className="h-8 w-8 text-[#84673F]"/></div><h1 className="mt-5 text-2xl font-semibold text-[#173F46]">Only Aviel can see this</h1><p className="mt-3 text-sm leading-6 text-[#756D64]">This area contains private business information or controls. Your Viewer account is working correctly, but this section is safely locked.</p><Badge className="mt-5 bg-[#DCEADF] text-[#2E6840]">Read-only protection active</Badge></CardContent></Card></div>;
}

function Overview({ leads, providers, counts, setSection, setSelectedLead, openWhatsApp }: { leads: DashboardLead[]; providers: AdminPartner[]; counts: any; setSection: (s: Section) => void; setSelectedLead: (l: DashboardLead) => void; openWhatsApp: (l: DashboardLead) => void }) {
  return <><SectionTitle eyebrow="Owner workspace" title="Business overview" description="What needs your attention today, across leads, jobs and customer follow-up." action={<Button className="bg-[#174E57] hover:bg-[#0E343B]" onClick={() => setSection('leads')}><Inbox className="mr-2 h-4 w-4"/>View leads</Button>}/><div className="grid grid-cols-2 gap-3 xl:grid-cols-6"><Metric label="Total leads" value={leads.length} note="All sources" icon={Users}/><Metric label="New leads" value={counts.new} note="Needs triage" icon={Inbox} tone="brass"/><Metric label="Active jobs" value={counts.active} note="Scheduled + active" icon={BriefcaseBusiness} tone="sage"/><Metric label="Completed" value={counts.completed} note="This workspace" icon={CheckCircle2}/><Metric label="Follow-ups" value={counts.replies} note="Needs reply" icon={Clock3} tone="brass"/><Metric label="Providers" value={providers.length} note="Active directory" icon={HardHat} tone="stone"/></div>
  <div className="mt-6 grid gap-6 xl:grid-cols-[1.62fr_1fr]"><Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-lg text-[#173F46]">Priority inbox</CardTitle><p className="mt-1 text-xs text-[#786F65]">New and unanswered customer requests</p></div><Button variant="ghost" size="sm" onClick={() => setSection('leads')}>View all<ChevronRight className="ml-1 h-4 w-4"/></Button></CardHeader><CardContent className="space-y-2">{leads.filter((l) => l.needsReply || l.status === 'new').slice(0,4).map((lead) => <div key={lead.id} className="flex flex-col gap-3 rounded-2xl border border-[#E0D7CC] bg-white p-3 sm:flex-row sm:items-center"><button className="flex-1 text-left" onClick={() => setSelectedLead(lead)}><div className="flex items-center gap-2"><span className="font-medium text-[#243538]">{lead.customerName}</span><Badge className={statusStyle[lead.status]}>{lead.status}</Badge></div><p className="mt-1 text-xs text-[#786F65]">{lead.service} · {lead.location} · {lead.date}</p></button><Button variant="outline" size="sm" onClick={() => openWhatsApp(lead)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>Reply</Button></div>)}</CardContent></Card><Card className="border-[#D8D0C6] bg-[#173F46] text-white"><CardHeader><CardTitle className="text-lg text-white">Quick actions</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{[{l:'View leads',i:Inbox,s:'leads'},{l:'View providers',i:HardHat,s:'providers'},{l:'Send WhatsApp',i:MessageCircle,s:'whatsapp'},{l:'Review jobs',i:ClipboardCheck,s:'jobs'}].map((a) => <button key={a.l} onClick={() => setSection(a.s as Section)} className="rounded-2xl border border-white/10 bg-white/7 p-4 text-left transition hover:bg-white/12"><a.i className="mb-5 h-5 w-5 text-[#D8C092]"/><span className="block text-sm">{a.l}</span></button>)}</CardContent></Card></div>
  <div className="mt-6 grid gap-6 lg:grid-cols-2"><Panel title="Active work" subtitle="Real leads marked scheduled or in progress">{leads.filter((lead) => ['scheduled', 'in progress'].includes(lead.status)).slice(0,5).map((lead) => <button key={lead.id} onClick={() => setSelectedLead(lead)} className="flex w-full items-start gap-3 border-b border-[#E5DDD3] py-3 text-left last:border-0"><div className="mt-1 rounded-xl bg-[#DFE8DA] p-2 text-[#466049]"><CalendarClock className="h-4 w-4"/></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{lead.customerName} · {lead.service}</p><p className="text-xs text-[#786F65]">{lead.provider} · {lead.date}</p></div><Badge className={statusStyle[lead.status]}>{lead.status}</Badge></button>)}{!leads.some((lead) => ['scheduled', 'in progress'].includes(lead.status)) && <EmptyState text="No active work is recorded yet."/>}</Panel><Panel title="Recent lead activity" subtitle="Newest real records in the database">{leads.slice(0,5).map((lead) => <div key={lead.id} className="flex gap-3 border-b border-[#E5DDD3] py-3 last:border-0"><div className="mt-1 h-2 w-2 rounded-full bg-[#B8905B]"/><div className="flex-1"><p className="text-sm">{lead.customerName} · {lead.service}</p><p className="mt-0.5 text-xs text-[#786F65]">{lead.date} · {lead.source}</p></div></div>)}{!leads.length && <EmptyState text="No lead activity is recorded yet."/>}</Panel></div></>;
}

function Leads({ leads, query, setQuery, statusFilter, setStatusFilter, setSelectedLead }: any) { return <><SectionTitle eyebrow="Customer pipeline" title="Leads CRM" description="Search, triage and move every real inquiry toward a clear next action."/><Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-4"><div className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-[#8A8177]"/><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, service or provider" className="bg-white pl-9"/></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="bg-white md:w-48"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{pipeline.map((status) => <SelectItem key={status} value={status}>{title(status)}</SelectItem>)}</SelectContent></Select></div></CardContent></Card><div className="mt-4 overflow-hidden rounded-2xl border border-[#D8D0C6] bg-[#FBF8F3]"><div className="hidden grid-cols-[1.2fr_1fr_.8fr_.8fr_1fr_38px] gap-4 border-b bg-[#ECE5DB] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[#786F65] md:grid"><span>Customer</span><span>Service</span><span>Source</span><span>Status</span><span>Provider</span><span/></div>{leads.map((lead: DashboardLead) => <button key={lead.id} onClick={() => setSelectedLead(lead)} className="grid w-full gap-2 border-b border-[#E5DDD3] px-4 py-4 text-left transition last:border-0 hover:bg-white md:grid-cols-[1.2fr_1fr_.8fr_.8fr_1fr_38px] md:items-center md:gap-4"><div><div className="flex items-center gap-2"><p className="text-sm font-medium">{lead.customerName}</p>{lead.needsReply && <span className="h-2 w-2 rounded-full bg-[#B8905B]" title="Needs reply"/>}</div><p className="text-xs text-[#786F65]">{lead.phone} · {lead.location}</p></div><div><p className="text-sm">{lead.service}</p><p className="line-clamp-1 text-xs text-[#786F65]">{lead.message}</p></div><p className="text-xs text-[#786F65]">{lead.source}<br/>{lead.date}</p><Badge className={`w-fit ${statusStyle[lead.status]}`}>{lead.status}</Badge><p className="text-xs">{lead.provider}</p><MoreHorizontal className="hidden h-4 w-4 md:block"/></button>)}{!leads.length && <div className="p-12 text-center text-sm text-[#786F65]">No real leads are stored yet.</div>}</div></> }

function WhatsAppOps({ leads, openWhatsApp }: { leads: DashboardLead[]; openWhatsApp: (l: DashboardLead, m?: string) => void }) { const pending = leads.filter((l) => l.needsReply); return <><SectionTitle eyebrow="WhatsApp-first operations" title="Customer messages" description="Use approved, calm templates and keep unanswered customers visible."/><div className="grid gap-6 xl:grid-cols-[1fr_1.62fr]"><Panel title={`${pending.length} replies needed`} subtitle="Oldest unanswered inquiries should be handled first">{pending.map((lead) => <div key={lead.id} className="flex items-center gap-3 border-b border-[#E5DDD3] py-3 last:border-0"><div className="rounded-full bg-[#DCE9EA] p-2"><MessageCircle className="h-4 w-4 text-[#174E57]"/></div><div className="flex-1"><p className="text-sm font-medium">{lead.customerName}</p><p className="text-xs text-[#786F65]">{lead.service} · {lead.date}</p></div><Button size="sm" className="bg-[#174E57]" onClick={() => openWhatsApp(lead)}>Reply</Button></div>)}</Panel><Panel title="Approved response templates" subtitle="Review the text before WhatsApp opens">{templates.map((template) => <div key={template.title} className="mb-3 rounded-2xl border border-[#E0D7CC] bg-white p-4 last:mb-0"><div className="flex items-center justify-between"><p className="text-sm font-medium text-[#173F46]">{template.title}</p><Badge variant="outline">English</Badge></div><p className="mt-2 text-xs leading-5 text-[#786F65]">{template.body}</p><div className="mt-3 flex gap-2"><Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(template.body).then(() => toast.success('Template copied'))}><FileText className="mr-1.5 h-3.5 w-3.5"/>Copy</Button>{pending[0] && <Button size="sm" className="bg-[#174E57]" onClick={() => openWhatsApp(pending[0], template.body)}><Send className="mr-1.5 h-3.5 w-3.5"/>Use for next lead</Button>}</div></div>)}</Panel></div></> }

function Jobs({ jobs, setJobs }: { jobs: DashboardJob[]; setJobs: React.Dispatch<React.SetStateAction<DashboardJob[]>> }) {
  const changeJobStatus = async (job: DashboardJob, status: string) => {
    try {
      await cleanfixApi.updateJob(job.id, { status });
      setJobs((current) => current.map((item) => item.id === job.id ? { ...item, status } : item));
      toast.success(`${job.title} moved to ${status}`);
    } catch { toast.error('The job status was not saved.'); }
  };
  return <><SectionTitle eyebrow="Delivery" title="Jobs" description="Every item here is a real job saved in the CleanFixHarish database."/><div className="grid gap-4">{jobs.map((job) => <Card key={job.id} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="grid gap-4 p-5 md:grid-cols-[1.1fr_1fr_.8fr] md:items-center"><div><p className="text-xs font-semibold text-[#A47D4A]">Job #{job.id}</p><p className="mt-1 font-medium text-[#173F46]">{job.customerName}</p><p className="text-sm text-[#786F65]">{job.title}</p></div><div><p className="text-xs text-[#786F65]">Location and schedule</p><p className="mt-1 text-sm font-medium">{job.address || 'Address not added'}</p><p className="text-xs text-[#786F65]">{job.scheduledFor ? new Date(job.scheduledFor).toLocaleString('en-IL') : 'Schedule not added'}</p></div><Select value={job.status} onValueChange={(status) => changeJobStatus(job, status)}><SelectTrigger className="bg-white"><SelectValue/></SelectTrigger><SelectContent>{['scheduled','in progress','completed','cancelled'].map((status) => <SelectItem key={status} value={status}>{title(status)}</SelectItem>)}</SelectContent></Select></CardContent></Card>)}{!jobs.length && <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent><EmptyState text="No jobs exist yet. Open a customer and choose Create job."/></CardContent></Card>}</div></>;
}

type AssistantMessage = { role: 'user' | 'assistant'; content: string };

const assistantStarters = [
  'What should I focus on today?',
  'Create a simple 30-day growth plan.',
  'Draft a friendly WhatsApp reply for a new customer.',
  'Suggest improvements for my website homepage.',
  'Help me create a professional service quote.',
  'How can I get my first 20 paying customers?',
];

function BusinessAssistant({ leads, jobs, providers, services }: { leads: DashboardLead[]; jobs: DashboardJob[]; providers: AdminPartner[]; services: AdminService[] }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  const businessContext = useMemo(() => JSON.stringify({
    today: new Date().toISOString().slice(0, 10),
    business: 'CleanFixHarish — managed local home services in Harish, Israel',
    currentState: 'Pre-launch / owner-operated. Aviel is the only current account. There is no customer data yet unless records appear below.',
    privacyNote: 'Only totals and non-personal business information are supplied. Customer names, phone numbers, addresses, and notes are excluded.',
    leadSummary: { total: leads.length, byStatus: Object.fromEntries(pipeline.map((status) => [status, leads.filter((lead) => lead.status === status).length])), needsReply: leads.filter((lead) => lead.needsReply).length },
    jobSummary: { total: jobs.length, active: jobs.filter((job) => ['scheduled', 'in progress'].includes(job.status)).length, completed: jobs.filter((job) => job.status === 'completed').length },
    providerSummary: { total: providers.length, active: providers.filter((provider) => provider.isActive).length, businessTypes: [...new Set(providers.map((provider) => provider.businessType).filter(Boolean))] },
    services: services.map(({ name, nameHe, description, category, active, priceFrom, priceUnit }) => ({ name, nameHe, description, category, active, priceFrom, priceUnit })),
  }), [leads, jobs, providers, services]);

  const ask = async (question?: string) => {
    const value = (question || draft).trim();
    if (!value || thinking) return;
    const next = [...messages, { role: 'user' as const, content: value }];
    setMessages(next); setDraft(''); setThinking(true);
    try {
      const result = await cleanfixApi.askAssistant([
        {
          role: 'system',
          content: `You are the CleanFixHarish Owner Assistant. Help Aviel run and grow a trustworthy managed home-services business in Harish. Use plain, non-technical language and lead with the recommended next action. Match the language used by Aviel. Base statements about the live business only on BUSINESS CONTEXT. If there is no data, say so; never invent customers, jobs, providers, prices, reviews, revenue, or completed actions. You may analyze, explain, plan, draft quotes, draft messages, and suggest website content. You cannot send messages, publish website changes, change prices, create or alter database records, promise availability, approve expenses, or act on Aviel's behalf. Clearly label drafts and ask Aviel to review important customer-facing text, prices, dates, and commitments before using them. When suggesting a plan, give a short prioritized checklist.\n\nBUSINESS CONTEXT:\n${businessContext}`,
        },
        ...next,
      ]);
      setMessages((current) => [...current, { role: 'assistant', content: result.content }]);
    } catch {
      toast.error('The AI Assistant could not connect. Check the Railway AI settings and try again.');
    } finally { setThinking(false); }
  };

  return <>
    <SectionTitle eyebrow="Owner intelligence" title="CleanFixHarish AI Assistant" description="Ask for guidance, plans, quotes, messages, and website ideas. You review every suggestion before anything changes."/>
    <div className="grid gap-6 xl:grid-cols-[1.7fr_.8fr]">
      <Card className="overflow-hidden border-[#D8D0C6] bg-[#FBF8F3]">
        <CardHeader className="border-b border-[#E5DDD3] bg-[#173F46] text-white">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-white/10 p-2.5"><Sparkles className="h-5 w-5 text-[#D8C092]"/></div><div><CardTitle className="text-base text-white">Ask your business assistant</CardTitle><p className="mt-1 text-xs text-white/65">Advice and drafts only · You remain in control</p></div></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[430px] max-h-[58vh] space-y-4 overflow-y-auto p-4 sm:p-6">
            {!messages.length && <div className="mx-auto max-w-lg py-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDE9E7]"><Bot className="h-7 w-7 text-[#174E57]"/></div><h2 className="mt-4 text-lg font-semibold text-[#173F46]">How can I help you today?</h2><p className="mt-2 text-sm text-[#786F65]">Choose a starting question or write your own. English and Hebrew are both supported.</p></div>}
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-[#174E57] text-white' : 'border border-[#E0D7CC] bg-white text-[#324346]'}`}><div className="whitespace-pre-wrap">{message.content}</div>{message.role === 'assistant' && <button onClick={() => navigator.clipboard?.writeText(message.content).then(() => toast.success('Answer copied'))} className="mt-3 flex items-center gap-1.5 text-xs text-[#786F65] hover:text-[#174E57]"><Copy className="h-3.5 w-3.5"/>Copy</button>}</div></div>)}
            {thinking && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl border border-[#E0D7CC] bg-white px-4 py-3 text-sm text-[#786F65]"><Sparkles className="h-4 w-4 animate-pulse text-[#A47D4A]"/>Thinking about your business…</div></div>}
          </div>
          <div className="border-t border-[#E5DDD3] bg-white p-4"><div className="flex gap-2"><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); ask(); } }} placeholder="Ask about customers, pricing, marketing, the website, or your next step…" rows={2} className="resize-none bg-[#FBF8F3]"/><Button onClick={() => ask()} disabled={!draft.trim() || thinking} className="h-auto bg-[#174E57] px-5 hover:bg-[#0E343B]"><Send className="h-4 w-4"/><span className="sr-only">Send</span></Button></div><p className="mt-2 text-[11px] text-[#8A8177]">Press Enter to send · Shift + Enter for a new line · Check prices, dates, and promises before using a draft.</p></div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Panel title="Try asking" subtitle="Useful places to begin">{assistantStarters.map((starter) => <button key={starter} onClick={() => ask(starter)} disabled={thinking} className="flex w-full items-center gap-3 border-b border-[#E5DDD3] py-3 text-left text-sm last:border-0 hover:text-[#174E57]"><Sparkles className="h-4 w-4 shrink-0 text-[#A47D4A]"/><span className="flex-1">{starter}</span><ChevronRight className="h-4 w-4 text-[#A49A8F]"/></button>)}</Panel>
        <Panel title="Safety and control" subtitle="What this first version can do"><div className="space-y-3 text-sm"><div className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"/><span>Read the business summary shown in Manager OS</span></div><div className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"/><span>Explain, plan, recommend, and prepare drafts</span></div><div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#A47D4A]"/><span>Cannot publish, message, charge, delete, or change records</span></div></div></Panel>
      </div>
    </div>
  </>;
}

function Providers({ providers, setProviders }: { providers: AdminPartner[]; setProviders: React.Dispatch<React.SetStateAction<AdminPartner[]>> }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', businessType: '', phone: '', area: 'Harish', description: '' });
  const toggle = async (provider: AdminPartner) => {
    try {
      await cleanfixApi.updatePartner(provider.id, { is_active: !provider.isActive });
      setProviders((current) => current.map((item) => item.id === provider.id ? { ...item, isActive: !item.isActive } : item));
      toast.success(`${provider.name} is now ${provider.isActive ? 'inactive' : 'active'}.`);
    } catch { toast.error('The provider change was not saved.'); }
  };
  const add = async () => {
    if (!draft.name.trim()) { toast.error('Please enter the provider name.'); return; }
    try {
      const provider = await cleanfixApi.createPartner({ name: draft.name.trim(), business_type: draft.businessType, partner_type: 'service_provider', phone: draft.phone, area: draft.area, description_en: draft.description, is_active: true });
      setProviders((current) => [{ id: provider.id, name: provider.name, businessType: provider.business_type || provider.partner_type, phone: provider.phone || '', area: provider.area || '', description: provider.description_en || '', isActive: provider.is_active !== false }, ...current]);
      setAdding(false); setDraft({ name: '', businessType: '', phone: '', area: 'Harish', description: '' }); toast.success('Provider saved to the database.');
    } catch { toast.error('The provider was not created.'); }
  };
  return <><SectionTitle eyebrow="Trusted network" title="Providers" description="Add providers and control who is active in your real directory." action={<Button className="bg-[#174E57]" onClick={() => setAdding(true)}><Plus className="mr-2 h-4 w-4"/>Add provider</Button>}/><div className="grid gap-4 md:grid-cols-2">{providers.map((provider) => <Card key={provider.id} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDE9E7] font-semibold text-[#174E57]">{provider.name.split(' ').map((part) => part[0]).slice(0,2).join('')}</div><div><p className="font-medium text-[#173F46]">{provider.name}</p><p className="text-xs text-[#786F65]">{provider.businessType}</p></div></div><div className="flex items-center gap-2"><span className="text-xs text-[#786F65]">Active</span><Switch checked={provider.isActive} onCheckedChange={() => toggle(provider)}/></div></div><div className="mt-5 rounded-xl bg-[#F0EAE1] p-3"><Info label="Area" value={provider.area}/></div>{provider.description && <p className="mt-4 text-xs leading-5 text-[#6F675F]">{provider.description}</p>}{provider.phone && <Button variant="outline" size="sm" className="mt-4" asChild><a href={`tel:${provider.phone}`}><Phone className="mr-1.5 h-3.5 w-3.5"/>{provider.phone}</a></Button>}</CardContent></Card>)}{!providers.length && <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent><EmptyState text="No providers are stored yet."/></CardContent></Card>}</div><Dialog open={adding} onOpenChange={setAdding}><DialogContent className="bg-[#FBF8F3]"><DialogHeader><DialogTitle>Add a provider</DialogTitle></DialogHeader><div className="space-y-4"><FieldInput label="Provider name" value={draft.name} onChange={(name) => setDraft({...draft,name})}/><FieldInput label="Business type" value={draft.businessType} onChange={(businessType) => setDraft({...draft,businessType})}/><div className="grid gap-4 sm:grid-cols-2"><FieldInput label="Phone" value={draft.phone} onChange={(phone) => setDraft({...draft,phone})}/><FieldInput label="Area" value={draft.area} onChange={(area) => setDraft({...draft,area})}/></div><FieldArea label="Description" value={draft.description} onChange={(description) => setDraft({...draft,description})} large/><Button className="w-full bg-[#174E57]" onClick={add}>Save provider</Button></div></DialogContent></Dialog></>;
}

function Services({ items, setItems }: { items: AdminService[]; setItems: React.Dispatch<React.SetStateAction<AdminService[]>> }) {
  const [editing, setEditing] = useState<AdminService | null>(null);
  const toggle = async (service: AdminService, active: boolean) => { setItems((current) => current.map((item) => item.id === service.id ? {...item, active} : item)); try { await cleanfixApi.updateService(service.id, { is_active: active }); toast.success(`${service.name} ${active ? 'published' : 'hidden'}`); } catch { setItems((current) => current.map((item) => item.id === service.id ? {...item, active: service.active} : item)); toast.error('The service change was not saved.'); } };
  const save = async () => { if (!editing) return; try { const result = await cleanfixApi.updateService(editing.id, { name_en: editing.name, name_he: editing.nameHe, description_en: editing.description, description_he: editing.descriptionHe, category: editing.category, price_from: editing.priceFrom ? Number(editing.priceFrom) : null, price_unit: editing.priceUnit, price_note_en: editing.priceNoteEn, price_note_he: editing.priceNoteHe, image_url: editing.imageUrl }); setItems((current) => current.map((item) => item.id === editing.id ? { ...editing, priceFrom: result.price_from == null ? '' : String(result.price_from) } : item)); setEditing(null); toast.success('Service and price published.'); } catch { toast.error('The service was not saved.'); } };
  return <><SectionTitle eyebrow="Offer management" title="Services & pricing" description="Change names, descriptions, starting prices, images, and public visibility."/><div className="space-y-4">{items.map((service) => <Card key={service.id} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center">{service.imageUrl && <img src={absoluteApiUrl(service.imageUrl)} alt="" className="h-20 w-28 rounded-xl object-cover"/>}<div className="flex-1"><div className="flex items-center gap-2"><h3 className="font-sans text-base font-semibold text-[#173F46]">{service.name}</h3><Badge variant="outline">{service.category}</Badge></div><p className="mt-2 text-sm text-[#625B53]">{service.description || 'No public description is stored.'}</p>{service.priceFrom && <p className="mt-2 font-medium text-[#A47D4A]">From ₪{service.priceFrom}{service.priceUnit ? ` ${service.priceUnit}` : ''}</p>}</div><Button variant="outline" size="sm" onClick={() => setEditing({...service})}><PencilLine className="mr-2 h-4 w-4"/>Edit</Button><div className="flex items-center gap-3"><span className="text-xs text-[#786F65]">Public</span><Switch checked={service.active} onCheckedChange={(active) => toggle(service, active)}/></div></div></CardContent></Card>)}{!items.length && <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent><EmptyState text="No services are stored yet."/></CardContent></Card>}</div><Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-[#FBF8F3]">{editing && <><DialogHeader><DialogTitle>Edit service and price</DialogTitle></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><FieldInput label="English name" value={editing.name} onChange={(name) => setEditing({...editing,name})}/><FieldInput label="Hebrew name" value={editing.nameHe} onChange={(nameHe) => setEditing({...editing,nameHe})}/><FieldArea label="English description" value={editing.description} onChange={(description) => setEditing({...editing,description})} large/><FieldArea label="Hebrew description" value={editing.descriptionHe} onChange={(descriptionHe) => setEditing({...editing,descriptionHe})} large rtl/><FieldInput label="Starting price (₪)" value={editing.priceFrom} onChange={(priceFrom) => setEditing({...editing,priceFrom})}/><FieldInput label="Price unit (example: per visit)" value={editing.priceUnit} onChange={(priceUnit) => setEditing({...editing,priceUnit})}/><FieldInput label="English price note" value={editing.priceNoteEn} onChange={(priceNoteEn) => setEditing({...editing,priceNoteEn})}/><FieldInput label="Hebrew price note" value={editing.priceNoteHe} onChange={(priceNoteHe) => setEditing({...editing,priceNoteHe})}/></div><FieldInput label="Image URL (or choose an uploaded image in Website Studio)" value={editing.imageUrl} onChange={(imageUrl) => setEditing({...editing,imageUrl})}/><Button onClick={save} className="w-full bg-[#174E57]">Publish service</Button></>}</DialogContent></Dialog></>;
}

const marketBenchmarks = [
  { id: 'handyman', label: 'Handyman visit', match: ['handyman', 'הנדימן'], low: 250, high: 350, unit: 'per standard weekday visit', source: 'The Professionals', sourceUrl: 'https://www.pro.co.il/handymen/pricing/handyman-service', sourceDate: 'Checked 12 Aug 2026' },
  { id: 'post-renovation', label: 'Post-renovation cleaning — 4 rooms', match: ['post-renovation', 'after renovation', 'אחרי שיפוץ'], low: 1800, high: 2300, unit: 'standard apartment up to 80 m²', source: 'The Professionals', sourceUrl: 'https://www.pro.co.il/house-cleaning-companies/services/apartment-cleaning-after-renovation', sourceDate: 'Checked 12 Aug 2026' },
  { id: 'ac-cleaning', label: 'Air-conditioner cleaning', match: ['ac cleaning', 'air conditioner cleaning', 'ניקוי מזגן', 'ניקוי מזגנים'], low: 250, high: 1100, unit: 'depends on basic filter cleaning vs. full wash', source: 'The Professionals', sourceUrl: 'https://www.pro.co.il/hvac-cleaning/pricing', sourceDate: 'Checked 12 Aug 2026' },
];

function MarketPriceComparison({ items }: { items: AdminService[] }) {
  const comparisons = marketBenchmarks.map((benchmark) => {
    const service = items.find((item) => benchmark.match.some((term) => `${item.name} ${item.nameHe}`.toLowerCase().includes(term.toLowerCase())));
    const price = service?.priceFrom ? Number(service.priceFrom) : undefined;
    const position = price == null || Number.isNaN(price) ? 'No CleanFix price yet' : price < benchmark.low ? 'Below market range' : price > benchmark.high ? 'Above market range' : 'Inside market range';
    const tone = position === 'Inside market range' ? 'bg-[#DCEADF] text-[#2E6840]' : position === 'No CleanFix price yet' ? 'bg-[#EAE7E3] text-[#746D65]' : 'bg-[#EEE4D4] text-[#765D38]';
    return { benchmark, service, price, position, tone };
  });

  return <div className="mt-8"><SectionTitle eyebrow="Israeli market reference" title="Price comparison" description="Compare CleanFixHarish starting prices with published Israeli reference ranges. These ranges guide decisions; they do not automatically change your prices."/><div className="grid gap-4 lg:grid-cols-3">{comparisons.map(({ benchmark, service, price, position, tone }) => <Card key={benchmark.id} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-4 sm:p-5"><div className="flex flex-col gap-3 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between"><div className="min-w-0"><p className="text-sm font-semibold text-[#173F46]">{benchmark.label}</p><p className="mt-1 text-xs leading-5 text-[#786F65]">{benchmark.unit}</p></div><Badge className={`w-fit shrink-0 ${tone}`}>{position}</Badge></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8177]">CleanFix from</p><p className="mt-1 text-xl font-semibold text-[#173F46]">{price == null || Number.isNaN(price) ? '—' : `₪${price.toLocaleString()}`}</p><p className="mt-1 truncate text-[10px] text-[#8A8177]">{service?.name || 'Not matched'}</p></div><div className="rounded-xl bg-[#F0EAE1] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8177]">Israel range</p><p className="mt-1 text-xl font-semibold text-[#A47D4A]">₪{benchmark.low.toLocaleString()}–{benchmark.high.toLocaleString()}</p><p className="mt-1 text-[10px] text-[#8A8177]">VAT included by source</p></div></div><a href={benchmark.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#DDD3C7] bg-white px-3 py-2 text-xs text-[#174E57] hover:border-[#A47D4A]"><span className="min-w-0"><strong>{benchmark.source}</strong><span className="block text-[10px] text-[#8A8177]">{benchmark.sourceDate}</span></span><ExternalLink className="h-3.5 w-3.5 shrink-0"/></a></CardContent></Card>)}</div><p className="mt-3 text-xs leading-5 text-[#786F65]">Market ranges are external references, not official government tariffs. Confirm scope, VAT, materials, travel, urgency, apartment size, and service quality before setting a customer price. Update the checked date whenever the source is reviewed.</p></div>;
}

function ContentControl() {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [selected, setSelected] = useState<CmsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [restorePoint, setRestorePoint] = useState<{ name: string; created_at: string; content_sections: number; services: number } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    Promise.all([cleanfixApi.listSiteContent(), cleanfixApi.getSiteSettings(), cleanfixApi.listSiteMedia()]).then(([result, siteSettings, images]) => { setItems(result?.items || []); setSettings(siteSettings); setMedia(images || []); })
      .catch(() => toast.error('Website content could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cleanfixApi.getDefaultRestorePoint().then(setRestorePoint).catch(() => toast.error('The protected default could not be prepared.'));
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

  const saveSettings = async () => { if (!settings) return; setSaving(true); try { setSettings(await cleanfixApi.updateSiteSettings(settings as unknown as Record<string, unknown>)); toast.success('Website design published.'); } catch { toast.error('The website design was not saved.'); } finally { setSaving(false); } };
  const upload = async (file?: File) => { if (!file) return; setUploading(true); try { const image = await cleanfixApi.uploadSiteMedia(file, file.name.replace(/\.[^.]+$/, '')); setMedia((current) => [image, ...current]); toast.success('Image uploaded. Choose where to use it.'); } catch { toast.error('Image upload failed. Use JPG, PNG, WEBP, or GIF under 5 MB.'); } finally { setUploading(false); } };

  const restoreDefault = async () => {
    setRestoring(true);
    try {
      await cleanfixApi.restoreDefaultWebsite();
      toast.success('The original working website has been restored.');
      setConfirmRestore(false);
      window.setTimeout(() => window.location.reload(), 700);
    } catch { toast.error('The website was not restored. Nothing was changed.'); }
    finally { setRestoring(false); }
  };

  return <><SectionTitle eyebrow="Website Studio" title="Edit your website" description="Change words, colors, buttons, layout, and pictures without touching code." action={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setConfirmRestore(true)} disabled={!restorePoint}><RotateCcw className="mr-2 h-4 w-4"/>Return to default</Button><Button variant="outline" asChild><a href="/" target="_blank">Open live preview<ExternalLink className="ml-2 h-4 w-4"/></a></Button></div>}/><div className="grid gap-6 xl:grid-cols-2"><Panel title="Protected default" subtitle="Your original working website is kept as a safety copy"><div className="flex items-start gap-3"><div className="rounded-2xl bg-[#DFE8DA] p-2.5"><ShieldCheck className="h-5 w-5 text-[#466049]"/></div><div><p className="text-sm font-medium text-[#173F46]">{restorePoint?.name || 'Preparing safety copy…'}</p><p className="mt-1 text-xs leading-5 text-[#786F65]">Restores website words, colors, buttons, selected pictures, services, prices, and visibility. It never changes accounts, leads, jobs, providers, payments, or uploaded files.</p></div></div></Panel><Panel title="1. Words" subtitle={loading ? 'Loading…' : 'Click a section to edit English and Hebrew'}>{items.map((item) => <button key={item.id} onClick={() => setSelected({...item})} className="flex w-full items-center gap-3 border-b border-[#E5DDD3] py-4 text-left last:border-0"><div className="rounded-xl bg-[#DDE9E7] p-2"><FileText className="h-4 w-4 text-[#174E57]"/></div><div className="flex-1"><p className="text-sm font-medium">{title(item.section_key)}</p><p className="line-clamp-1 text-xs text-[#786F65]">{item.title_en || 'Untitled'} · EN/HE</p></div><Badge variant="outline">{item.is_active === false ? 'Hidden' : 'Published'}</Badge><ChevronRight className="h-4 w-4"/></button>)}</Panel>{settings && <Panel title="2. Look and buttons" subtitle="Choose safe brand colors and the homepage layout"><div className="grid gap-4 sm:grid-cols-3">{([['Main color','primary_color'],['Gold accent','accent_color'],['Page background','surface_color']] as const).map(([label,key]) => <label key={key} className="text-xs text-[#625B53]">{label}<div className="mt-2 flex items-center gap-2 rounded-xl border bg-white p-2"><input type="color" value={settings[key]} onChange={(event) => setSettings({...settings,[key]:event.target.value.toUpperCase()})} className="h-9 w-12"/><span>{settings[key]}</span></div></label>)}</div><div className="mt-4"><Label>Hero layout</Label><Select value={settings.hero_layout} onValueChange={(hero_layout) => setSettings({...settings,hero_layout})}><SelectTrigger className="mt-2 bg-white"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="text-left">Words left, picture right</SelectItem><SelectItem value="image-left">Picture left, words right</SelectItem></SelectContent></Select></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><FieldInput label="Main button — English" value={settings.primary_cta_en || ''} onChange={(primary_cta_en) => setSettings({...settings,primary_cta_en})}/><FieldInput label="Main button — Hebrew" value={settings.primary_cta_he || ''} onChange={(primary_cta_he) => setSettings({...settings,primary_cta_he})}/><FieldInput label="WhatsApp button — English" value={settings.secondary_cta_en || ''} onChange={(secondary_cta_en) => setSettings({...settings,secondary_cta_en})}/><FieldInput label="WhatsApp button — Hebrew" value={settings.secondary_cta_he || ''} onChange={(secondary_cta_he) => setSettings({...settings,secondary_cta_he})}/></div><Button onClick={saveSettings} disabled={saving} className="mt-5 w-full bg-[#174E57]">Publish design and buttons</Button></Panel>}<Panel title="3. Pictures" subtitle="Upload once, then choose Hero or Bottom banner"><label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#CFC5B9] bg-white p-6 text-sm text-[#174E57]"><Upload className="mr-2 h-5 w-5"/>{uploading ? 'Uploading…' : 'Upload a picture (maximum 5 MB)'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])}/></label><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{media.map((item) => <div key={item.id} className="overflow-hidden rounded-xl border bg-white"><img src={absoluteApiUrl(item.url)} alt={item.alt_text || item.filename} className="h-28 w-full object-cover"/><div className="grid grid-cols-2 gap-1 p-2"><Button size="sm" variant={settings?.hero_image_url === item.url ? 'default' : 'outline'} onClick={() => settings && setSettings({...settings,hero_image_url:item.url})}>Hero</Button><Button size="sm" variant={settings?.cta_image_url === item.url ? 'default' : 'outline'} onClick={() => settings && setSettings({...settings,cta_image_url:item.url})}>Bottom</Button></div></div>)}{!media.length && <div className="col-span-full py-6 text-center text-sm text-[#786F65]"><Image className="mx-auto mb-2 h-6 w-6"/>No uploaded pictures yet.</div>}</div>{settings && <Button onClick={saveSettings} disabled={saving} className="mt-4 w-full bg-[#174E57]">Publish selected pictures</Button>}</Panel><Panel title="How this works" subtitle="Three simple steps"><ol className="space-y-3 text-sm text-[#625B53]"><li><strong>1.</strong> Make one change.</li><li><strong>2.</strong> Press the green Publish button in that box.</li><li><strong>3.</strong> Open live preview and refresh the page.</li></ol><div className="mt-5 rounded-2xl bg-[#173F46] p-4 text-white"><p className="font-medium">Safe by design</p><p className="mt-1 text-xs text-white/70">Your logo and essential structure stay protected. You can change the parts customers see most.</p></div></Panel></div><Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-[#FBF8F3]">{selected && <><DialogHeader><DialogTitle>Edit {title(selected.section_key)}</DialogTitle></DialogHeader><div className="grid gap-5 sm:grid-cols-2"><FieldArea label="English title" value={selected.title_en || ''} onChange={(value) => setSelected({...selected,title_en:value})}/><FieldArea label="Hebrew title" value={selected.title_he || ''} onChange={(value) => setSelected({...selected,title_he:value})} rtl/><FieldArea label="English content" value={selected.content_en || ''} onChange={(value) => setSelected({...selected,content_en:value})} large/><FieldArea label="Hebrew content" value={selected.content_he || ''} onChange={(value) => setSelected({...selected,content_he:value})} large rtl/></div><div className="flex items-center justify-between rounded-xl bg-[#F0EAE1] p-4"><div><p className="text-sm font-medium">Published on website</p><p className="text-xs text-[#786F65]">Turn this off to hide this saved text.</p></div><Switch checked={selected.is_active !== false} onCheckedChange={(value) => setSelected({...selected,is_active:value})}/></div><Button onClick={save} disabled={saving} className="w-full bg-[#174E57]">{saving ? 'Publishing…' : 'Publish words'}</Button></>}</DialogContent></Dialog><Dialog open={confirmRestore} onOpenChange={setConfirmRestore}><DialogContent className="max-w-md bg-[#FBF8F3]"><DialogHeader><DialogTitle>Return to the original working website?</DialogTitle></DialogHeader><div className="space-y-4 text-sm text-[#625B53]"><p>This will replace your current website words, design choices, selected pictures, and service presentation with the protected default.</p><div className="rounded-xl bg-[#EEE4D4] p-4 text-[#765D38]"><strong>Your business records stay safe.</strong><br/>Accounts, leads, jobs, providers, payments, and uploaded files are not changed.</div><div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setConfirmRestore(false)} disabled={restoring}>Cancel</Button><Button onClick={restoreDefault} disabled={restoring} className="bg-[#8A4639] hover:bg-[#71372E]"><RotateCcw className="mr-2 h-4 w-4"/>{restoring ? 'Restoring…' : 'Yes, restore default'}</Button></div></div></DialogContent></Dialog></>;
}

function FieldArea({ label, value, onChange, large, rtl }: { label: string; value: string; onChange: (value: string) => void; large?: boolean; rtl?: boolean }) { return <div><Label>{label}</Label>{large ? <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={6} dir={rtl ? 'rtl' : 'ltr'} className="mt-1.5 bg-white"/> : <Input value={value} onChange={(event) => onChange(event.target.value)} dir={rtl ? 'rtl' : 'ltr'} className="mt-1.5 bg-white"/>}</div>; }
function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <div><Label>{label}</Label><Input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 bg-white"/></div>; }

function FollowUps({ leads, openWhatsApp, completeFollowUp }: { leads: DashboardLead[]; openWhatsApp: (l: DashboardLead, m?: string) => void; completeFollowUp: (l: DashboardLead) => void }) { const followups = leads.filter((l) => l.followUpStatus !== 'completed' && (l.status === 'follow-up' || l.status === 'completed' || l.status === 'quoted')); return <><SectionTitle eyebrow="Customer care" title="Follow-ups & reviews" description="Close the loop calmly and save every completed follow-up."/><Panel title="Follow-up queue" subtitle="Prioritized by next useful customer action">{followups.map((lead) => <div key={lead.id} className="flex flex-col gap-3 border-b border-[#E5DDD3] py-4 last:border-0 sm:flex-row sm:items-center"><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-medium">{lead.customerName}</p><Badge className={statusStyle[lead.status]}>{lead.status}</Badge></div><p className="mt-1 text-xs text-[#786F65]">{lead.service} · {lead.notes || 'No notes added'}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => openWhatsApp(lead, lead.status === 'completed' ? templates[3].body : templates[2].body)}><MessageCircle className="mr-1.5 h-3.5 w-3.5"/>{lead.status === 'completed' ? 'Request review' : 'Follow up'}</Button><Button variant="ghost" size="sm" aria-label="Mark follow-up complete" onClick={() => completeFollowUp(lead)}><Check className="h-4 w-4"/></Button></div></div>)}{!followups.length && <EmptyState text="No follow-ups need attention."/>}</Panel></> }

type PlatformEntry = {
  name: string;
  role: string;
  location: string;
  status: 'Production' | 'Business tool' | 'Required check' | 'Retired';
  icon: typeof Cloud;
  url?: string;
  protect: string;
  check: string;
};

const platformEntries: PlatformEntry[] = [
  { name: 'Railway', role: 'Runs the website and backend application.', location: 'CleanFixHarish production project', status: 'Production', icon: Cloud, url: 'https://railway.com/dashboard', protect: 'Environment variables and deployment access', check: 'Deployment health, logs, and monthly usage' },
  { name: 'Railway PostgreSQL', role: 'Stores the live business records.', location: 'Database service inside the Railway project', status: 'Production', icon: Database, url: 'https://railway.com/dashboard', protect: 'DATABASE_URL and database backups', check: 'Backup status before any risky release' },
  { name: 'Cloudflare', role: 'Controls the domain, DNS, and public connection security.', location: 'Zone: cleanfixharish.co.il', status: 'Production', icon: Globe2, url: 'https://dash.cloudflare.com/', protect: 'DNS access; never expose API tokens', check: 'www and root domain, SSL, and email DNS records' },
  { name: 'GitHub', role: 'The single source of truth for all website code.', location: 'cleanfixharish/cleanfix-website', status: 'Production', icon: Github, url: 'https://github.com/cleanfixharish/cleanfix-website', protect: 'Account 2-step verification and repository access', check: 'Changes reviewed before they reach Railway' },
  { name: 'Google Cloud Auth', role: 'Provides Google sign-in for the owner account.', location: 'CleanFixHarish Production · cleanfixharish-prod', status: 'Production', icon: KeyRound, url: 'https://console.cloud.google.com/auth/clients', protect: 'OAuth client secret and approved callback addresses', check: 'Login after domain or authentication changes' },
  { name: 'Google Workspace', role: 'Runs the company email and administrator identity.', location: 'info@cleanfixharish.co.il', status: 'Production', icon: Building2, url: 'https://admin.google.com/', protect: 'Administrator recovery methods and 2-step verification', check: 'Email delivery; preserve all Google MX records' },
  { name: 'AI Gateway', role: 'Connects Manager OS to the AI model used by the assistant.', location: 'Configured privately through Railway variables', status: 'Required check', icon: Bot, protect: 'APP_AI_BASE_URL and APP_AI_KEY', check: 'Confirm both variables before enabling the assistant live' },
  { name: 'WhatsApp Business', role: 'Customer conversations and approved message drafts.', location: 'Owner-managed business account', status: 'Business tool', icon: MessageCircle, url: 'https://business.whatsapp.com/', protect: 'Phone access, backups, and two-step verification', check: 'Messages are still sent by you, not automatically' },
  { name: 'Google NotebookLM', role: 'Creates internal explanations, podcasts, and training material.', location: 'CleanFixHarish business notebook', status: 'Business tool', icon: BookOpen, url: 'https://notebooklm.google.com/', protect: 'Only upload material appropriate for the notebook audience', check: 'Not part of the live website' },
  { name: 'Canva', role: 'Creates optional branded pictures and marketing designs.', location: 'CleanFixHarish design workspace', status: 'Business tool', icon: Image, url: 'https://www.canva.com/', protect: 'Brand assets and account access', check: 'Export approved assets before adding them to the website' },
  { name: 'Render', role: 'Previous website host; no longer the production platform.', location: 'Historical only', status: 'Retired', icon: X, protect: 'Keep only if an old backup is still needed', check: 'Do not deploy new work here' },
];

function PlatformDirectory() {
  const statusTone: Record<PlatformEntry['status'], string> = {
    Production: 'bg-[#DCEADF] text-[#2E6840]',
    'Business tool': 'bg-[#DCE5F0] text-[#35546D]',
    'Required check': 'bg-[#EEE4D4] text-[#765D38]',
    Retired: 'bg-[#EAE7E3] text-[#746D65]',
  };
  return <>
    <SectionTitle eyebrow="Owner map" title="Platforms & access" description="One simple list of the systems behind CleanFixHarish, what each one does, and what must be protected."/>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {platformEntries.map((platform) => <Card key={platform.name} className="border-[#D8D0C6] bg-[#FBF8F3]"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div className="rounded-2xl bg-[#DDE9E7] p-2.5"><platform.icon className="h-5 w-5 text-[#174E57]"/></div><Badge className={statusTone[platform.status]}>{platform.status}</Badge></div><h2 className="mt-4 font-semibold text-[#173F46]">{platform.name}</h2><p className="mt-1 text-sm leading-5 text-[#625B53]">{platform.role}</p><p className="mt-3 rounded-xl bg-[#F0EAE1] px-3 py-2 text-xs text-[#625B53]">{platform.location}</p><div className="mt-4 space-y-2 text-xs leading-5 text-[#786F65]"><p><strong className="text-[#4A4540]">Protect:</strong> {platform.protect}</p><p><strong className="text-[#4A4540]">Check:</strong> {platform.check}</p></div>{platform.url && <Button variant="outline" size="sm" className="mt-4 w-full" asChild><a href={platform.url} target="_blank" rel="noreferrer">Open {platform.name}<ExternalLink className="ml-2 h-3.5 w-3.5"/></a></Button>}</CardContent></Card>)}
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Panel title="Never store secrets here" subtitle="This page names secret settings but never shows their values"><div className="space-y-3 text-sm text-[#625B53]"><div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#174E57]"/><span>Passwords, API keys, OAuth secrets, and database addresses stay inside their secure platform.</span></div><div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#174E57]"/><span>Turn on two-step verification for GitHub, Google, Cloudflare, Railway, and WhatsApp.</span></div><div className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#174E57]"/><span>Do not change DNS, OAuth callbacks, or database settings unless a tested release requires it.</span></div></div></Panel>
      <Panel title="Future connections" subtitle="Useful later, but not required for the current working version"><div className="space-y-3 text-sm"><Connection name="Online payment provider" state="Not activated"/><Connection name="Automatic database backup copy" state="Plan next"/><Connection name="Error monitoring and alerts" state="Plan next"/><Connection name="Website conversion analytics" state="Plan next"/></div></Panel>
    </div>
  </>;
}

function InternalOS() {
  const [viewers, setViewers] = useState<{id:number;email:string}[]>([]);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const load = () => cleanfixApi.listViewers().then(setViewers).catch(() => toast.error('Viewer access list could not be loaded.'));
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error('Please enter a complete email address.'); return; }
    setSaving(true);
    try { await cleanfixApi.addViewer(email.trim()); setEmail(''); await load(); toast.success('Viewer access added. They can sign in with Google.'); }
    catch { toast.error('Viewer access was not added.'); }
    finally { setSaving(false); }
  };
  const remove = async (viewer: {id:number;email:string}) => {
    try { await cleanfixApi.removeViewer(viewer.id); setViewers((current) => current.filter((item) => item.id !== viewer.id)); toast.success(`${viewer.email} can no longer sign in as a Viewer.`); }
    catch { toast.error('Viewer access was not removed.'); }
  };
  return <><SectionTitle eyebrow="Company headquarters" title="Settings & system" description="Verified platform status and the rules that protect your business."/><div className="grid gap-6 lg:grid-cols-2"><Panel title="Viewer access" subtitle="Let trusted people explore the dashboard without changing anything"><div className="flex flex-col gap-2 sm:flex-row"><Input type="email" value={email} onChange={(event)=>setEmail(event.target.value)} onKeyDown={(event)=>event.key==='Enter'&&add()} placeholder="friend@example.com" className="bg-white"/><Button onClick={add} disabled={saving} className="shrink-0 bg-[#174E57]"><Plus className="mr-2 h-4 w-4"/>{saving?'Adding…':'Add viewer'}</Button></div><p className="mt-3 text-xs leading-5 text-[#786F65]">Viewers see a working read-only dashboard. Private areas show “Only Aviel can see this.”</p><div className="mt-4 divide-y divide-[#E5DDD3]">{viewers.map((viewer)=><div key={viewer.id} className="flex items-center gap-3 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DDE9E7]"><Users className="h-4 w-4 text-[#174E57]"/></div><span className="min-w-0 flex-1 truncate text-sm">{viewer.email}</span><Button variant="ghost" size="sm" onClick={()=>remove(viewer)} className="text-[#8A4639]">Remove</Button></div>)}{!viewers.length&&<EmptyState text="No dashboard viewers have been added here yet."/>}</div></Panel><Panel title="System status" subtitle="Current verified state"><Connection name="Railway application" state="Connected"/><Connection name="Google sign-in" state="Connected"/><Connection name="PostgreSQL database" state="Connected"/><Connection name="Production DNS" state="Connected"/></Panel><Panel title="Operating principles" subtitle="Applied before every change"><div className="space-y-3">{['Simplicity before complexity','Trust before growth hacks','Preserve existing work','One source of truth','No infrastructure change without approval'].map((item) => <div key={item} className="flex items-center gap-2 text-sm"><BadgeCheck className="h-4 w-4 text-[#174E57]"/>{item}</div>)}</div></Panel></div></>;
}

function Panel({ title: heading, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <Card className="border-[#D8D0C6] bg-[#FBF8F3]"><CardHeader className="pb-2"><CardTitle className="font-sans text-base font-semibold text-[#173F46]">{heading}</CardTitle><p className="text-xs text-[#786F65]">{subtitle}</p></CardHeader><CardContent>{children}</CardContent></Card> }
function EmptyState({ text }: { text: string }) { return <div className="py-8 text-center text-sm text-[#786F65]">{text}</div> }
function Info({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8177]">{label}</p><p className="mt-1 break-words text-sm font-medium text-[#324346]">{value}</p></div> }
function Checklist({ items }: { items: string[] }) { const [done, setDone] = useState<number[]>([]); return <div className="space-y-2">{items.map((item, i) => <button key={item} onClick={() => setDone((current) => current.includes(i) ? current.filter((x) => x !== i) : [...current, i])} className="flex w-full items-center gap-3 rounded-xl border border-[#E0D7CC] bg-white p-3 text-left text-sm"><span className={`flex h-5 w-5 items-center justify-center rounded-md border ${done.includes(i) ? 'border-[#174E57] bg-[#174E57] text-white' : 'border-[#CFC5B9]'}`}>{done.includes(i) && <Check className="h-3 w-3"/>}</span><span className={done.includes(i) ? 'text-[#8A8177] line-through' : ''}>{item}</span></button>)}</div> }
function Connection({ name, state }: { name: string; state: string }) { const ready = ['Connected','Available','Via GitHub'].includes(state); return <div className="flex items-center justify-between border-b border-[#E5DDD3] py-3 last:border-0"><span className="text-sm">{name}</span><Badge className={ready ? 'bg-[#DCEADF] text-[#2E6840]' : 'bg-[#EEE4D4] text-[#765D38]'}>{state}</Badge></div> }
function title(value: string) { return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()); }
function normalizeStatus(value: string): LeadStatus { const map: Record<string, LeadStatus> = { booked: 'scheduled', lost: 'cancelled', follow_up: 'follow-up', in_progress: 'in progress' }; const normalized = map[value] || value; return pipeline.includes(normalized as LeadStatus) ? normalized as LeadStatus : 'new'; }
