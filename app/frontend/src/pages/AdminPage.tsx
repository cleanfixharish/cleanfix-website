import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Activity,
  BadgeCheck,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileText,
  Gauge,
  Globe2,
  HardHat,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PencilLine,
  Phone,
  Plus,
  Search,
  Send,
  Share2,
  Settings2,
  ShieldCheck,
  Bot,
  Cloud,
  Copy,
  Database,
  Github,
  Image,
  Clapperboard,
  KeyRound,
  RotateCcw,
  Sparkles,
  Star,
  Upload,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { absoluteApiUrl, cleanfixApi } from "@/lib/cleanfixApi";
import { useAdminTranslation } from "@/lib/adminI18n";
import AiVideoStudio from "@/components/admin/AiVideoStudio";
import ShareOnboarding from "@/components/admin/ShareOnboarding";
import BusinessRulesCenter from "@/components/admin/BusinessRulesCenter";
import GrowthCenter from "@/components/admin/GrowthCenter";

type Section =
  | "overview"
  | "assistant"
  | "leads"
  | "whatsapp"
  | "jobs"
  | "providers"
  | "services"
  | "rules"
  | "growth"
  | "pricing"
  | "content"
  | "sharing"
  | "video"
  | "followups"
  | "platforms"
  | "internal";
type LeadStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "scheduled"
  | "in progress"
  | "completed"
  | "follow-up"
  | "cancelled";
type DashboardLead = {
  id: number;
  customerName: string;
  phone: string;
  service: string;
  location: string;
  message: string;
  source: string;
  date: string;
  status: LeadStatus;
  provider: string;
  notes: string;
  needsReply: boolean;
  followUpStatus: string;
};
type DashboardJob = {
  id: number;
  leadId?: number;
  customerName: string;
  title: string;
  phone: string;
  address: string;
  status: string;
  scheduledFor?: string;
  price?: number;
  notes: string;
};
type RegisteredAccount = {
  id: number;
  userId: string;
  accountType: "customer" | "business";
  displayName: string;
  email: string;
  phone: string;
  area: string;
  vipNumber: string;
  businessName: string;
  businessCategory: string;
  applicationStatus: string;
  createdAt: string;
};
type CmsItem = {
  id: number;
  section_key: string;
  title_en?: string;
  title_he?: string;
  content_en?: string;
  content_he?: string;
  is_active?: boolean;
};
type AdminPartner = {
  id: number;
  name: string;
  businessType: string;
  phone: string;
  area: string;
  description: string;
  isActive: boolean;
};
type AdminService = {
  id: number;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  category: string;
  active: boolean;
  priceFrom: string;
  priceUnit: string;
  priceNoteEn: string;
  priceNoteHe: string;
  imageUrl: string;
};
type SiteSettings = {
  primary_color: string;
  accent_color: string;
  surface_color: string;
  hero_image_url?: string;
  cta_image_url?: string;
  hero_layout: string;
  effects_mode: "full" | "reduced" | "off";
  primary_cta_en?: string;
  primary_cta_he?: string;
  secondary_cta_en?: string;
  secondary_cta_he?: string;
};
type MediaItem = {
  id: number;
  filename: string;
  alt_text?: string;
  url: string;
};

type NavigationItem = {
  id: Section;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
};

const navigationGroups: { label: string; items: NavigationItem[] }[] = [
  {
    label: "Today",
    items: [{ id: "overview", label: "Today", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { id: "leads", label: "Customers", icon: Inbox },
      { id: "whatsapp", label: "Messages", icon: MessageCircle },
      { id: "pricing", label: "Price estimator", icon: CircleDollarSign },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "jobs", label: "Jobs", icon: BriefcaseBusiness },
      { id: "followups", label: "Follow-ups", icon: HeartHandshake },
    ],
  },
  {
    label: "Providers",
    items: [{ id: "providers", label: "Providers", icon: HardHat }],
  },
  {
    label: "Business",
    items: [
      { id: "services", label: "Services & pricing", icon: Wrench },
      { id: "rules", label: "Business rules", icon: ShieldCheck },
      { id: "assistant", label: "AI Assistant", icon: Bot },
    ],
  },
  {
    label: "Website",
    items: [
      { id: "sharing", label: "Share & onboarding", icon: Share2 },
      { id: "video", label: "AI Video Studio", icon: Clapperboard },
      { id: "content", label: "Website editor", icon: Globe2 },
      { id: "growth", label: "Growth Center", icon: Sparkles },
    ],
  },
  {
    label: "System",
    items: [
      { id: "platforms", label: "Platforms and Costs", icon: Cloud },
      { id: "internal", label: "Settings", icon: BookOpen },
    ],
  },
];

const navigation = navigationGroups.flatMap((group) => group.items);

const mobilePrimaryNavigation: NavigationItem[] = [
  { id: "overview", label: "Today", icon: LayoutDashboard },
  { id: "leads", label: "Customers", icon: Inbox },
  { id: "jobs", label: "Jobs", icon: BriefcaseBusiness },
  { id: "whatsapp", label: "Messages", icon: MessageCircle },
];

const pipeline: LeadStatus[] = [
  "new",
  "contacted",
  "quoted",
  "scheduled",
  "in progress",
  "completed",
  "follow-up",
  "cancelled",
];
const statusStyle: Record<LeadStatus, string> = {
  new: "bg-[#DCE9EA] text-[#174E57]",
  contacted: "bg-[#EEE4D4] text-[#765D38]",
  quoted: "bg-[#E7E2EF] text-[#5A4C70]",
  scheduled: "bg-[#DBE5D9] text-[#405F43]",
  "in progress": "bg-[#DCE5F0] text-[#35546D]",
  completed: "bg-[#DCEADF] text-[#2E6840]",
  "follow-up": "bg-[#F2E1D7] text-[#854D37]",
  cancelled: "bg-[#EAE7E3] text-[#746D65]",
};

const viewerLockedSections: Section[] = [
  "assistant",
  "whatsapp",
  "pricing",
  "content",
  "sharing",
  "video",
  "followups",
  "platforms",
  "internal",
];

const templates = [
  {
    title: "New inquiry",
    body: "Hi {{name}}, thank you for contacting CleanFixHarish. Please send a few photos and your Harish neighborhood so we can understand the job clearly.",
  },
  {
    title: "Scheduling",
    body: "Hi {{name}}, we can offer {{date/time}}. Please confirm the address and that this time works for you.",
  },
  {
    title: "Quote follow-up",
    body: "Hi {{name}}, just checking whether you had a chance to review the quote. I am happy to clarify anything.",
  },
  {
    title: "Review request",
    body: "Hi {{name}}, thank you for choosing CleanFixHarish. If everything was handled well, we would appreciate your honest review.",
  },
];

function Metric({
  label,
  value,
  note,
  icon: Icon,
  tone = "teal",
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Users;
  tone?: string;
}) {
  const tr = useAdminTranslation();
  const tones: Record<string, string> = {
    teal: "bg-[#DDE9E7] text-[#174E57]",
    brass: "bg-[#EEE4D4] text-[#84673F]",
    sage: "bg-[#DFE8DA] text-[#466049]",
    stone: "bg-[#E9E4DE] text-[#615950]",
  };
  return (
    <Card className="border-[#D8D0C6] bg-[#FBF8F3] shadow-[0_8px_30px_rgba(32,45,44,.04)]">
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#786F65]">
              {tr(label)}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#173F46]">
              {value}
            </p>
            <p className="mt-1 text-xs text-[#786F65]">{tr(note)}</p>
          </div>
          <div className={`rounded-2xl p-2.5 ${tones[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const tr = useAdminTranslation();
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#A47D4A]">
          {tr(eyebrow)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#173F46] sm:text-3xl">
          {tr(title)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#756D64]">{tr(description)}</p>
      </div>
      {action}
    </div>
  );
}

function mapRegisteredAccounts(accountResponse: any[], tr: (text: string) => string): RegisteredAccount[] {
  return (accountResponse || []).map((account: any) => ({
    id: account.id || 0,
    userId: account.user_id || String(account.id || account.email || ""),
    accountType: account.account_type === "business" ? "business" : "customer",
    displayName: account.display_name || account.email || tr("Customer"),
    email: account.email || "",
    phone: account.phone || "",
    area: account.area || "Harish",
    vipNumber: account.vip_number || "",
    businessName: account.business_name || "",
    businessCategory: account.business_category || "",
    applicationStatus: account.application_status || "setup_incomplete",
    createdAt: account.created_at
      ? new Date(account.created_at).toLocaleDateString("en-IL")
      : tr("Just registered"),
  }));
}

export default function AdminPage() {
  const { user, logout, isViewer } = useAuth();
  const { lang, setLang, dir } = useLanguage();
  const tr = useAdminTranslation();
  const [section, setSection] = useState<Section>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [leads, setLeads] = useState<DashboardLead[]>([]);
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>([]);
  const [providers, setProviders] = useState<AdminPartner[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [selectedLead, setSelectedLead] = useState<DashboardLead | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingLead, setSavingLead] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [apiMode, setApiMode] = useState<"loading" | "live" | "error">(
    "loading",
  );

  useEffect(() => {
    const load = async () => {
      try {
        const viewerData = isViewer
          ? await cleanfixApi.getViewerDashboard()
          : null;
        const [leadResponse, jobResponse, partnerResponse, serviceResponse] =
          viewerData
            ? [
                viewerData.leads,
                viewerData.jobs,
                viewerData.partners,
                viewerData.services,
              ]
            : await Promise.all([
                cleanfixApi.listLeads(100),
                cleanfixApi.listJobs(),
                cleanfixApi.listPartners(),
                cleanfixApi.listServices(),
              ]);
        const items = leadResponse?.items || [];
        let accountResponse: any[] = [];
        if (!isViewer) {
          try {
            accountResponse = await cleanfixApi.listAccountProfiles();
          } catch {
            toast.error(tr("Registered accounts could not be loaded."));
          }
        }
        setLeads(
          items.map((lead: any) => ({
            id: lead.id,
            customerName: lead.customer_name,
            phone: lead.phone,
            service: lead.service_requested,
            location: lead.area || "Harish",
            message: lead.description || "",
            source: lead.source || "Website",
            date: lead.created_at
              ? new Date(lead.created_at).toLocaleDateString("en-IL")
              : "—",
            status: normalizeStatus(lead.status),
            provider: lead.assignment || "Unassigned",
            notes: lead.notes || "",
            needsReply:
              lead.status === "new" || lead.follow_up_status === "pending",
            followUpStatus: lead.follow_up_status || "",
          })),
        );
        setJobs(
          (jobResponse?.items || []).map((job: any) => ({
            id: job.id,
            leadId: job.lead_id,
            customerName: job.customer_name,
            title: job.title,
            phone: job.phone || "",
            address: job.address || "",
            status: job.status || "scheduled",
            scheduledFor: job.scheduled_for,
            price: job.price == null ? undefined : Number(job.price),
            notes: job.notes || "",
          })),
        );
        setRegisteredAccounts(mapRegisteredAccounts(accountResponse, tr));
        setProviders(
          (partnerResponse?.items || []).map((partner: any) => ({
            id: partner.id,
            name: partner.name,
            businessType:
              partner.business_type ||
              partner.partner_type ||
              "Service provider",
            phone: partner.phone || partner.whatsapp || "",
            area: partner.area || "Harish",
            description: partner.description_en || "",
            isActive: partner.is_active !== false,
          })),
        );
        setServices(
          (serviceResponse?.items || []).map((service: any) => ({
            id: service.id,
            name: service.name_en,
            nameHe: service.name_he || "",
            description: service.description_en || "",
            descriptionHe: service.description_he || "",
            category: service.category || "Service",
            active: service.is_active !== false,
            priceFrom:
              service.price_from == null ? "" : String(service.price_from),
            priceUnit: service.price_unit || "",
            priceNoteEn: service.price_note_en || "",
            priceNoteHe: service.price_note_he || "",
            imageUrl: service.image_url || "",
          })),
        );
        setApiMode("live");
      } catch {
        setApiMode("error");
        toast.error(
          tr(
            "The manager could not load live business data. No demonstration data was shown.",
          ),
        );
      }
    };
    load();
  }, [isViewer]);

  useEffect(() => {
    if (isViewer || section !== "leads") return;
    let cancelled = false;
    cleanfixApi
      .listAccountProfiles()
      .then((accountResponse) => {
        if (!cancelled) setRegisteredAccounts(mapRegisteredAccounts(accountResponse, tr));
      })
      .catch(() => {
        if (!cancelled) toast.error(tr("Registered accounts could not be loaded."));
      });
    return () => {
      cancelled = true;
    };
  }, [isViewer, section, tr]);

  useEffect(() => {
    setNoteDraft(selectedLead?.notes || "");
  }, [selectedLead?.id]);

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const haystack =
          `${lead.customerName} ${lead.phone} ${lead.service} ${lead.location} ${lead.provider}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (statusFilter === "all" || lead.status === statusFilter)
        );
      }),
    [leads, query, statusFilter],
  );

  const changeStatus = async (lead: DashboardLead, status: LeadStatus) => {
    try {
      await cleanfixApi.updateLead(lead.id, { status });
    } catch {
      toast.error(tr("The status was not saved. Please try again."));
      return;
    }
    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id ? { ...item, status, needsReply: false } : item,
      ),
    );
    setSelectedLead((current) =>
      current?.id === lead.id
        ? { ...current, status, needsReply: false }
        : current,
    );
    toast.success(`${lead.customerName} ${tr("moved to")} ${tr(status)}`);
  };

  const saveNotes = async () => {
    if (!selectedLead) return;
    setSavingLead(true);
    try {
      await cleanfixApi.updateLead(selectedLead.id, { notes: noteDraft });
      setLeads((current) =>
        current.map((lead) =>
          lead.id === selectedLead.id ? { ...lead, notes: noteDraft } : lead,
        ),
      );
      setSelectedLead({ ...selectedLead, notes: noteDraft });
      toast.success(tr("Notes saved to the database."));
    } catch {
      toast.error(tr("The notes were not saved."));
    } finally {
      setSavingLead(false);
    }
  };

  const createJobForLead = async (lead: DashboardLead) => {
    if (jobs.some((job) => job.leadId === lead.id)) {
      setSection("jobs");
      setSelectedLead(null);
      return;
    }
    setSavingLead(true);
    try {
      const job = await cleanfixApi.createJob({
        lead_id: lead.id,
        customer_name: lead.customerName,
        title: lead.service || tr("Customer job"),
        phone: lead.phone,
        address: lead.location,
        status: "scheduled",
        notes: lead.notes,
      });
      setJobs((current) => [
        {
          id: job.id,
          leadId: job.lead_id,
          customerName: job.customer_name,
          title: job.title,
          phone: job.phone || "",
          address: job.address || "",
          status: job.status,
          scheduledFor: job.scheduled_for,
          price: job.price == null ? undefined : Number(job.price),
          notes: job.notes || "",
        },
        ...current,
      ]);
      if (lead.status !== "scheduled") await changeStatus(lead, "scheduled");
      setSelectedLead(null);
      setSection("jobs");
      toast.success(tr("A real job was created."));
    } catch {
      toast.error(tr("The job was not created."));
    } finally {
      setSavingLead(false);
    }
  };

  const completeFollowUp = async (lead: DashboardLead) => {
    try {
      await cleanfixApi.updateLead(lead.id, { follow_up_status: "completed" });
      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id
            ? { ...item, followUpStatus: "completed", needsReply: false }
            : item,
        ),
      );
      toast.success(tr("Follow-up saved as complete."));
    } catch {
      toast.error(tr("The follow-up was not saved."));
    }
  };

  const openWhatsApp = (lead: DashboardLead, message?: string) => {
    const number = lead.phone.replace(/\D/g, "").replace(/^0/, "972");
    const body =
      message?.replace("{{name}}", lead.customerName.split(" ")[0]) ||
      `Hi ${lead.customerName.split(" ")[0]}, thank you for contacting CleanFixHarish.`;
    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(body)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const counts = {
    new: leads.filter((l) => l.status === "new").length,
    active: leads.filter((l) => ["scheduled", "in progress"].includes(l.status))
      .length,
    completed: leads.filter((l) => l.status === "completed").length,
    replies: leads.filter((l) => l.needsReply).length,
  };

  return (
    <div dir={dir} className="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-[#F2EDE5] text-[#243538]">
      <div className="pointer-events-none fixed inset-0 bg-[url('/assets/brand/v2/golden-ratio-grid.svg')] bg-[length:900px_auto] bg-center opacity-35" />
      <aside className={`fixed inset-y-0 z-40 hidden w-64 bg-[#102E38] bg-[url('/assets/brand/v2/navy-embossed-panel.svg')] bg-cover text-white min-[1400px]:flex min-[1400px]:flex-col ${dir === "rtl" ? "right-0 border-l border-[#B8842F]/45" : "left-0 border-r border-[#B8842F]/45"}`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <img
            src="/assets/brand/cf-gold-monogram-128.png"
            alt="CleanFixHarish CF gold monogram"
            className="h-11 w-11 rounded-xl"
          />
          <div>
            <p className="font-semibold">CleanFixHarish</p>
            <p className="text-[10px] uppercase tracking-[.18em] text-white/55">
              Manager OS

            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-3 overflow-y-auto p-3">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-[.18em] text-white/38">
                {tr(group.label)}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${section === item.id ? "bg-[#F7F2EA] text-[#173F46] shadow-sm" : "text-white/72 hover:bg-white/8 hover:text-white"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className={`flex-1 ${dir === "rtl" ? "text-right" : "text-left"}`}>{tr(item.label)}</span>
                    {item.id === "leads" && counts.new > 0 && (
                      <span className="rounded-full bg-[#B8905B] px-2 py-0.5 text-[10px] text-white">
                        {counts.new}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/7 p-3">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-[#D8C092]" />
              <span>{tr(isViewer ? "Read-only viewer" : "Owner workspace")}</span>
            </div>
            <p className="mt-2 truncate text-xs text-white/55" dir="ltr">
              {user?.email || "CleanFixHarish admin"}
            </p>
          </div>
        </div>
      </aside>

      <header className={`sticky top-0 z-30 min-w-0 border-b border-[#D8D0C6] bg-[#F7F2EA]/90 backdrop-blur-xl ${dir === "rtl" ? "min-[1400px]:mr-64" : "min-[1400px]:ml-64"}`}>
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="min-[1400px]:hidden"
              onClick={() => setMobileNav(true)}
              aria-label={tr("Open dashboard navigation")}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-xs text-[#786F65]">
                {tr("CleanFixHarish operations")}
              </p>
              <p className="text-sm font-medium text-[#173F46]">
                {tr("Welcome")}, {user?.name || "Aviel"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden border-[#BFCFCB] bg-[#E4ECEA] text-[#31585E] sm:flex"
            >
              <span
                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${apiMode === "live" ? "bg-emerald-600" : apiMode === "error" ? "bg-red-600" : "bg-[#B8905B]"}`}
              />
              {apiMode === "live"
                ? tr("Live data")
                : apiMode === "loading"
                  ? tr("Connecting")
                  : tr("Connection error")}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "en" ? "he" : "en")}
              aria-label={lang === "en" ? "Switch dashboard to Hebrew" : "החלפת לוח הבקרה לאנגלית"}
              className="min-w-12 border-[#B8842F]/45 bg-[#FBF8F3] font-semibold"
            >
              <Globe2 className="h-4 w-4" />
              <span className="ms-1">{lang === "en" ? "עב" : "EN"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${counts.replies} ${tr("items need attention")}`}
              onClick={() =>
                counts.replies
                  ? setSection("followups")
                  : toast.success(tr("Nothing needs your attention right now."))
              }
            >
              <Bell className="h-4 w-4" />
              {counts.replies > 0 && (
                <span className="absolute ml-4 mb-4 h-2 w-2 rounded-full bg-[#B8905B]" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label={tr("Sign out")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side={dir === "rtl" ? "right" : "left"} className="bg-[#153E45] p-0 text-white">
          <SheetHeader className={`border-b border-white/10 p-5 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            <SheetTitle className="flex items-center gap-3 text-white">
              <img
                src="/assets/brand/cf-gold-monogram-128.png"
                className="h-10 w-10 rounded-xl"
                alt=""
              />
              {tr("Manager OS")}
            </SheetTitle>
          </SheetHeader>
          <nav className="max-h-[calc(100vh-84px)] space-y-4 overflow-y-auto p-3">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-[.18em] text-white/40">
                  {tr(group.label)}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id);
                      setMobileNav(false);
                    }}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${section === item.id ? "bg-[#F7F2EA] text-[#173F46]" : "text-white/75"}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 truncate">{tr(item.label)}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <main className={`relative z-10 w-full min-w-0 max-w-full px-3 py-4 pb-24 sm:p-6 sm:pb-24 min-[1400px]:w-auto min-[1400px]:p-8 ${dir === "rtl" ? "min-[1400px]:mr-64" : "min-[1400px]:ml-64"}`}>
        {isViewer && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#C8B07C] bg-[#FFF8E8] p-4 text-sm text-[#684F2B]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <strong>{tr("Live read-only tour")}</strong>
              <p className="mt-1 text-xs leading-5">
                {tr(
                  "You can explore the working dashboard and open its tools. Private customer information is hidden, and no button can save, publish, delete, message, restore, or change business data.",
                )}
              </p>
            </div>
          </div>
        )}
        {section === "overview" && (
          <Overview
            leads={leads}
            providers={providers}
            counts={counts}
            setSection={setSection}
            setSelectedLead={setSelectedLead}
            openWhatsApp={openWhatsApp}
          />
        )}
        {isViewer && viewerLockedSections.includes(section) && (
          <ViewerLockedSection />
        )}
        {!isViewer && section === "assistant" && (
          <BusinessAssistant
            leads={leads}
            jobs={jobs}
            providers={providers}
            services={services}
          />
        )}
        {section === "leads" && (
          <Leads
            leads={filteredLeads}
            accounts={registeredAccounts}
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setSelectedLead={setSelectedLead}
          />
        )}
        {!isViewer && section === "whatsapp" && (
          <WhatsAppOps leads={leads} openWhatsApp={openWhatsApp} />
        )}
        {section === "jobs" && <Jobs jobs={jobs} setJobs={setJobs} />}
        {section === "providers" && (
          <Providers providers={providers} setProviders={setProviders} />
        )}
        {section === "services" && (
          <>
            <Services items={services} setItems={setServices} />
            <MarketPriceComparison items={services} />
          </>
        )}
        {!isViewer && section === "rules" && <BusinessRulesCenter />}
        {!isViewer && section === "growth" && <GrowthCenter />}
        {!isViewer && section === "pricing" && (
          <PricingWorkspace leads={leads} />
        )}
        {!isViewer && section === "content" && <ContentControl />}
        {!isViewer && section === "sharing" && <ShareOnboarding />}
        {!isViewer && section === "video" && <AiVideoStudio />}
        {!isViewer && section === "followups" && (
          <FollowUps
            leads={leads}
            openWhatsApp={openWhatsApp}
            completeFollowUp={completeFollowUp}
          />
        )}
        {!isViewer && section === "platforms" && <PlatformDirectory />}
        {!isViewer && section === "internal" && <InternalOS />}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#D8D0C6] bg-[#FBF8F3]/95 px-1 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(16,46,56,.08)] backdrop-blur-xl min-[1400px]:hidden"
        aria-label={tr("Primary mobile navigation")}
      >
        {mobilePrimaryNavigation.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium ${section === item.id ? "bg-[#E4ECEA] text-[#174E57]" : "text-[#6F6A63]"}`}
          >
            <item.icon className="h-5 w-5" />
            <span>{tr(item.label)}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMobileNav(true)}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium text-[#6F6A63]"
        >
          <Menu className="h-5 w-5" />
          <span>{tr("More")}</span>
        </button>
      </nav>

      <Dialog
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      >
        <DialogContent className="max-w-xl border-[#D8D0C6] bg-[#FBF8F3]">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="break-words pr-6 text-xl text-[#173F46] sm:text-2xl">
                  {selectedLead.customerName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-[#F0EAE1] p-4 text-sm min-[390px]:grid-cols-2">
                  <Info label="Phone" value={selectedLead.phone} ltr />
                  <Info label={tr("Service")} value={selectedLead.service} />
                  <Info label={tr("Location")} value={selectedLead.location} />
                  <Info label={tr("Provider")} value={selectedLead.provider} />
                </div>
                <div>
                  <Label>{tr("Customer message")}</Label>
                  <p className="mt-1 break-words rounded-xl border border-[#DDD3C7] bg-white p-3 text-sm">
                    {selectedLead.message}
                  </p>
                </div>
                <div>
                  <Label>{tr("Status")}</Label>
                  <Select
                    value={selectedLead.status}
                    onValueChange={(value) =>
                      changeStatus(selectedLead, value as LeadStatus)
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pipeline.map((status) => (
                        <SelectItem key={status} value={status}>
                          {tr(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{tr("Internal notes")}</Label>
                  <Textarea
                    className="mt-1 bg-white"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button
                    className="bg-[#174E57] hover:bg-[#0E343B]"
                    onClick={() => openWhatsApp(selectedLead)}
                  >
                    <MessageCircle className="me-2 h-4 w-4" />
                    {tr("WhatsApp")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={saveNotes}
                    disabled={savingLead}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {savingLead ? `${tr("Saving")}…` : tr("Save notes")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => createJobForLead(selectedLead)}
                    disabled={savingLead}
                  >
                    <BriefcaseBusiness className="mr-2 h-4 w-4" />
                    {jobs.some((job) => job.leadId === selectedLead.id)
                      ? tr("View job")
                      : tr("Create job")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ViewerLockedSection() {
  const tr = useAdminTranslation();
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <Card className="w-full max-w-lg border-[#D8D0C6] bg-[#FBF8F3] text-center">
        <CardContent className="p-8 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEE4D4]">
            <ShieldCheck className="h-8 w-8 text-[#84673F]" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-[#173F46]">
            {tr("Only Aviel can see this")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#756D64]">
            {tr(
              "This area contains private business information or controls. Your Viewer account is working correctly, but this section is safely locked.",
            )}
          </p>
          <Badge className="mt-5 bg-[#DCEADF] text-[#2E6840]">
            {tr("Read-only protection active")}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

function Overview({
  leads,
  providers,
  counts,
  setSection,
  setSelectedLead,
  openWhatsApp,
}: {
  leads: DashboardLead[];
  providers: AdminPartner[];
  counts: any;
  setSection: (s: Section) => void;
  setSelectedLead: (l: DashboardLead) => void;
  openWhatsApp: (l: DashboardLead) => void;
}) {
  const tr = useAdminTranslation();
  return (
    <>
      <SectionTitle
        eyebrow="Owner workspace"
        title="Business overview"
        description="What needs your attention today, across leads, jobs and customer follow-up."
        action={
          <Button
            className="bg-[#174E57] hover:bg-[#0E343B]"
            onClick={() => setSection("leads")}
          >
            <Inbox className="me-2 h-4 w-4" />
            {tr("View leads")}
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <Metric
          label="Total leads"
          value={leads.length}
          note="All sources"
          icon={Users}
        />
        <Metric
          label="New leads"
          value={counts.new}
          note="Needs triage"
          icon={Inbox}
          tone="brass"
        />
        <Metric
          label="Active jobs"
          value={counts.active}
          note="Scheduled + active"
          icon={BriefcaseBusiness}
          tone="sage"
        />
        <Metric
          label="Completed"
          value={counts.completed}
          note="This workspace"
          icon={CheckCircle2}
        />
        <Metric
          label="Follow-ups"
          value={counts.replies}
          note="Needs reply"
          icon={Clock3}
          tone="brass"
        />
        <Metric
          label="Providers"
          value={providers.length}
          note="Active directory"
          icon={HardHat}
          tone="stone"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.62fr_1fr]">
        <Card className="border-[#D8D0C6] bg-[#FBF8F3]">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[#173F46]">
                {tr("Priority inbox")}
              </CardTitle>
              <p className="mt-1 text-xs text-[#786F65]">
                {tr("New and unanswered customer requests")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSection("leads")}
            >
              {tr("View all")}
              <ChevronRight className="ms-1 h-4 w-4 rtl-flip" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {leads
              .filter((l) => l.needsReply || l.status === "new")
              .slice(0, 4)
              .map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#E0D7CC] bg-white p-3 sm:flex-row sm:items-center"
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#243538]">
                        {lead.customerName}
                      </span>
                      <Badge className={statusStyle[lead.status]}>
                        {tr(lead.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#786F65]">
                      {lead.service} · {lead.location} · {lead.date}
                    </p>
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWhatsApp(lead)}
                  >
                    <MessageCircle className="me-1.5 h-3.5 w-3.5" />
                    {tr("Reply")}
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card className="border-[#D8D0C6] bg-[#173F46] text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">{tr("Quick actions")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { l: "View leads", i: Inbox, s: "leads" },
              { l: "View providers", i: HardHat, s: "providers" },
              { l: "Send WhatsApp", i: MessageCircle, s: "whatsapp" },
              { l: "Review jobs", i: ClipboardCheck, s: "jobs" },
            ].map((a) => (
              <button
                key={a.l}
                onClick={() => setSection(a.s as Section)}
                className="rounded-2xl border border-white/10 bg-white/7 p-4 text-start transition hover:bg-white/12"
              >
                <a.i className="mb-5 h-5 w-5 text-[#D8C092]" />
                <span className="block text-sm">{tr(a.l)}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Active work"
          subtitle="Real leads marked scheduled or in progress"
        >
          {leads
            .filter((lead) =>
              ["scheduled", "in progress"].includes(lead.status),
            )
            .slice(0, 5)
            .map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="flex w-full items-start gap-3 border-b border-[#E5DDD3] py-3 text-start last:border-0"
              >
                <div className="mt-1 rounded-xl bg-[#DFE8DA] p-2 text-[#466049]">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {lead.customerName} · {lead.service}
                  </p>
                  <p className="text-xs text-[#786F65]">
                    {lead.provider} · {lead.date}
                  </p>
                </div>
                <Badge className={statusStyle[lead.status]}>
                  {tr(lead.status)}
                </Badge>
              </button>
            ))}
          {!leads.some((lead) =>
            ["scheduled", "in progress"].includes(lead.status),
          ) && <EmptyState text="No active work is recorded yet." />}
        </Panel>
        <Panel
          title="Recent lead activity"
          subtitle="Newest real records in the database"
        >
          {leads.slice(0, 5).map((lead) => (
            <div
              key={lead.id}
              className="flex gap-3 border-b border-[#E5DDD3] py-3 last:border-0"
            >
              <div className="mt-1 h-2 w-2 rounded-full bg-[#B8905B]" />
              <div className="flex-1">
                <p className="text-sm">
                  {lead.customerName} · {lead.service}
                </p>
                <p className="mt-0.5 text-xs text-[#786F65]">
                  {lead.date} · {lead.source}
                </p>
              </div>
            </div>
          ))}
          {!leads.length && (
            <EmptyState text="No lead activity is recorded yet." />
          )}
        </Panel>
      </div>
    </>
  );
}

function Leads({
  leads,
  accounts,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  setSelectedLead,
}: any) {
  const tr = useAdminTranslation();
  return (
    <>
      <SectionTitle
        eyebrow="Customer pipeline"
        title="Leads CRM"
        description="Search, triage and move every real inquiry toward a clear next action."
      />
      <Card className="mb-5 border-[#BFCFCB] bg-[#E8F0ED]">
        <CardHeader>
          <CardTitle className="text-xl text-[#173F46]">{tr("Registered accounts")}</CardTitle>
          <p className="text-sm text-[#66736E]">
            {tr("Account registrations appear here immediately. A service message appears in the lead pipeline only after the customer sends a request.")}
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {(accounts as RegisteredAccount[]).map((account) => (
            <div key={account.userId || account.email || String(account.id)} className="min-w-0 rounded-2xl border border-[#D2DDD9] bg-white p-4">
              <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#173F46]">{account.displayName}</p>
                    <Badge variant="outline" className="bg-[#F7F2EA]">
                      {tr(account.accountType === "business" ? "Service provider account" : "Customer account")}
                    </Badge>
                  </div>
                  <p className="mt-1 break-all text-xs text-[#786F65]" dir="ltr">{account.email || account.vipNumber}</p>
                  {account.phone ? (
                    <p className="mt-1 text-xs text-[#786F65]" dir="ltr">{account.phone}</p>
                  ) : (
                    <p className="mt-1 text-xs text-[#8A8177]">{tr("Phone will appear after account setup.")}</p>
                  )}
                  {account.vipNumber && (
                    <p className="mt-1 text-xs text-[#786F65]" dir="ltr">{account.vipNumber}</p>
                  )}
                  {account.accountType === "business" && (
                    <p className="mt-2 text-sm text-[#405155]">{account.businessName} · {account.businessCategory || tr("Category pending")}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-row items-center gap-2 min-[420px]:flex-col min-[420px]:items-end">
                  <Badge className={account.applicationStatus === "pending" || account.applicationStatus === "setup_incomplete" ? "bg-[#EEE4D4] text-[#765D38]" : "bg-[#DCEADF] text-[#2E6840]"}>
                    {tr(account.applicationStatus)}
                  </Badge>
                  <span className="text-[11px] text-[#8A8177]">{account.createdAt}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {account.phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`https://wa.me/${account.phone.replace(/\D/g, "").replace(/^0/, "972")}`} target="_blank" rel="noreferrer">
                      <MessageCircle className="me-1.5 h-3.5 w-3.5" />{tr("Open WhatsApp")}
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setQuery(account.displayName)}>
                  <Search className="me-1.5 h-3.5 w-3.5" />{tr("Find service requests")}
                </Button>
              </div>
            </div>
          ))}
          {!accounts.length && (
            <div className="py-6 text-center text-sm text-[#786F65] lg:col-span-2">{tr("No registered customer or provider accounts yet.")}</div>
          )}
        </CardContent>
      </Card>
      <Card className="border-[#D8D0C6] bg-[#FBF8F3]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-3 h-4 w-4 text-[#8A8177]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("Search name, phone, service or provider")}
                className="bg-white ps-9"
                dir="auto"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr("All statuses")}</SelectItem>
                {pipeline.map((status) => (
                  <SelectItem key={status} value={status}>
                    {tr(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#D8D0C6] bg-[#FBF8F3]">
        <div className="hidden grid-cols-[1.2fr_1fr_.8fr_.8fr_1fr_38px] gap-4 border-b bg-[#ECE5DB] px-4 py-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[#786F65] md:grid">
          <span>{tr("Customer")}</span>
          <span>{tr("Service")}</span>
          <span>{tr("Source")}</span>
          <span>{tr("Status")}</span>
          <span>{tr("Provider")}</span>
          <span />
        </div>
        {leads.map((lead: DashboardLead) => (
          <button
            key={lead.id}
            onClick={() => setSelectedLead(lead)}
            className="grid w-full gap-2 border-b border-[#E5DDD3] px-4 py-4 text-left transition last:border-0 hover:bg-white md:grid-cols-[1.2fr_1fr_.8fr_.8fr_1fr_38px] md:items-center md:gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{lead.customerName}</p>
                {lead.needsReply && (
                  <span
                    className="h-2 w-2 rounded-full bg-[#B8905B]"
                    title={tr("Needs reply")}
                  />
                )}
              </div>
              <p className="text-xs text-[#786F65]">
                {lead.phone} · {lead.location}
              </p>
            </div>
            <div>
              <p className="text-sm">{lead.service}</p>
              <p className="line-clamp-1 text-xs text-[#786F65]">
                {lead.message}
              </p>
            </div>
            <p className="text-xs text-[#786F65]">
              {lead.source}
              <br />
              {lead.date}
            </p>
            <Badge className={`w-fit ${statusStyle[lead.status]}`}>
              {tr(lead.status)}
            </Badge>
            <p className="text-xs">{lead.provider}</p>
            <MoreHorizontal className="hidden h-4 w-4 md:block" />
          </button>
        ))}
        {!leads.length && (
          <div className="p-12 text-center text-sm text-[#786F65]">
            {tr("No real leads are stored yet.")}
          </div>
        )}
      </div>
    </>
  );
}

function WhatsAppOps({
  leads,
  openWhatsApp,
}: {
  leads: DashboardLead[];
  openWhatsApp: (l: DashboardLead, m?: string) => void;
}) {
  const tr = useAdminTranslation();
  const pending = leads.filter((l) => l.needsReply);
  return (
    <>
      <SectionTitle
        eyebrow="WhatsApp-first operations"
        title="Customer messages"
        description="Use approved, calm templates and keep unanswered customers visible."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.62fr]">
        <Panel
          title={`${pending.length} ${tr("replies needed")}`}
          subtitle={tr("Oldest unanswered inquiries should be handled first")}
        >
          {pending.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center gap-3 border-b border-[#E5DDD3] py-3 last:border-0"
            >
              <div className="rounded-full bg-[#DCE9EA] p-2">
                <MessageCircle className="h-4 w-4 text-[#174E57]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{lead.customerName}</p>
                <p className="text-xs text-[#786F65]">
                  {lead.service} · {lead.date}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#174E57]"
                onClick={() => openWhatsApp(lead)}
              >
                {tr("Reply")}
              </Button>
            </div>
          ))}
        </Panel>
        <Panel
          title="Approved response templates"
          subtitle="Review the text before WhatsApp opens"
        >
          {templates.map((template) => (
            <div
              key={template.title}
              className="mb-3 rounded-2xl border border-[#E0D7CC] bg-white p-4 last:mb-0"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#173F46]">
                  {tr(template.title)}
                </p>
                <Badge variant="outline">{tr("English")}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#786F65]">
                {template.body}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard
                      ?.writeText(template.body)
                      .then(() => toast.success(tr("Template copied")))
                  }
                >
                  <FileText className="me-1.5 h-3.5 w-3.5" />
                  {tr("Copy")}
                </Button>
                {pending[0] && (
                  <Button
                    size="sm"
                    className="bg-[#174E57]"
                    onClick={() => openWhatsApp(pending[0], template.body)}
                  >
                    <Send className="me-1.5 h-3.5 w-3.5" />
                    {tr("Use for next lead")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function Jobs({
  jobs,
  setJobs,
}: {
  jobs: DashboardJob[];
  setJobs: React.Dispatch<React.SetStateAction<DashboardJob[]>>;
}) {
  const tr = useAdminTranslation();
  const changeJobStatus = async (job: DashboardJob, status: string) => {
    try {
      await cleanfixApi.updateJob(job.id, { status });
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id ? { ...item, status } : item,
        ),
      );
      toast.success(`${job.title} ${tr("moved to")} ${tr(status)}`);
    } catch {
      toast.error(tr("The job status was not saved."));
    }
  };
  return (
    <>
      <SectionTitle
        eyebrow="Delivery"
        title="Jobs"
        description="Every item here is a real job saved in the CleanFixHarish database."
      />
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[1.1fr_1fr_.8fr] md:items-center">
              <div>
                <p className="text-xs font-semibold text-[#A47D4A]">
                  {tr("Job #")}
                  {job.id}
                </p>
                <p className="mt-1 font-medium text-[#173F46]">
                  {job.customerName}
                </p>
                <p className="text-sm text-[#786F65]">{job.title}</p>
              </div>
              <div>
                <p className="text-xs text-[#786F65]">
                  {tr("Location and schedule")}
                </p>
                <p className="mt-1 text-sm font-medium">
                  {job.address || tr("Address not added")}
                </p>
                <p className="text-xs text-[#786F65]">
                  {job.scheduledFor
                    ? new Date(job.scheduledFor).toLocaleString("en-IL")
                    : tr("Schedule not added")}
                </p>
              </div>
              <Select
                value={job.status}
                onValueChange={(status) => changeJobStatus(job, status)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["scheduled", "in progress", "completed", "cancelled"].map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {tr(status)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
        {!jobs.length && (
          <Card className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardContent>
              <EmptyState text="No jobs exist yet. Open a customer and choose Create job." />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

type AssistantMessage = { role: "user" | "assistant"; content: string };

const assistantStarters = [
  "What should I focus on today?",
  "Create a simple 30-day growth plan.",
  "Draft a friendly WhatsApp reply for a new customer.",
  "Suggest improvements for my website homepage.",
  "Help me create a professional service quote.",
  "How can I get my first 20 paying customers?",
];

function BusinessAssistant({
  leads,
  jobs,
  providers,
  services,
}: {
  leads: DashboardLead[];
  jobs: DashboardJob[];
  providers: AdminPartner[];
  services: AdminService[];
}) {
  const tr = useAdminTranslation();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  const businessContext = useMemo(
    () =>
      JSON.stringify({
        today: new Date().toISOString().slice(0, 10),
        business:
          "CleanFixHarish — managed local home services in Harish, Israel",
        currentState:
          "Pre-launch / owner-operated. Aviel is the only current account. There is no customer data yet unless records appear below.",
        privacyNote:
          "Only totals and non-personal business information are supplied. Customer names, phone numbers, addresses, and notes are excluded.",
        leadSummary: {
          total: leads.length,
          byStatus: Object.fromEntries(
            pipeline.map((status) => [
              status,
              leads.filter((lead) => lead.status === status).length,
            ]),
          ),
          needsReply: leads.filter((lead) => lead.needsReply).length,
        },
        jobSummary: {
          total: jobs.length,
          active: jobs.filter((job) =>
            ["scheduled", "in progress"].includes(job.status),
          ).length,
          completed: jobs.filter((job) => job.status === "completed").length,
        },
        providerSummary: {
          total: providers.length,
          active: providers.filter((provider) => provider.isActive).length,
          businessTypes: [
            ...new Set(
              providers
                .map((provider) => provider.businessType)
                .filter(Boolean),
            ),
          ],
        },
        services: services.map(
          ({
            name,
            nameHe,
            description,
            category,
            active,
            priceFrom,
            priceUnit,
          }) => ({
            name,
            nameHe,
            description,
            category,
            active,
            priceFrom,
            priceUnit,
          }),
        ),
      }),
    [leads, jobs, providers, services],
  );

  const ask = async (question?: string) => {
    const value = (question || draft).trim();
    if (!value || thinking) return;
    const next = [...messages, { role: "user" as const, content: value }];
    setMessages(next);
    setDraft("");
    setThinking(true);
    try {
      const result = await cleanfixApi.askAssistant([
        {
          role: "system",
          content: `You are the CleanFixHarish Owner Assistant. Help Aviel run and grow a trustworthy managed home-services business in Harish. Use plain, non-technical language and lead with the recommended next action. Match the language used by Aviel. Base statements about the live business only on BUSINESS CONTEXT. If there is no data, say so; never invent customers, jobs, providers, prices, reviews, revenue, or completed actions. You may analyze, explain, plan, draft quotes, draft messages, and suggest website content. You cannot send messages, publish website changes, change prices, create or alter database records, promise availability, approve expenses, or act on Aviel's behalf. Clearly label drafts and ask Aviel to review important customer-facing text, prices, dates, and commitments before using them. When suggesting a plan, give a short prioritized checklist.\n\nBUSINESS CONTEXT:\n${businessContext}`,
        },
        ...next,
      ]);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.content },
      ]);
    } catch {
      toast.error(
        tr(
          "The AI Assistant could not connect. Check the Railway AI settings and try again.",
        ),
      );
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      <SectionTitle
        eyebrow="Owner intelligence"
        title="CleanFixHarish AI Assistant"
        description="Ask for guidance, plans, quotes, messages, and website ideas. You review every suggestion before anything changes."
      />
      <div className="grid gap-6 xl:grid-cols-[1.7fr_.8fr]">
        <Card className="overflow-hidden border-[#D8D0C6] bg-[#FBF8F3]">
          <CardHeader className="border-b border-[#E5DDD3] bg-[#173F46] text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2.5">
                <Sparkles className="h-5 w-5 text-[#D8C092]" />
              </div>
              <div>
                <CardTitle className="text-base text-white">
                  {tr("Ask your business assistant")}
                </CardTitle>
                <p className="mt-1 text-xs text-white/65">
                  {tr("Advice and drafts only · You remain in control")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-h-[430px] max-h-[58vh] space-y-4 overflow-y-auto p-4 sm:p-6">
              {!messages.length && (
                <div className="mx-auto max-w-lg py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDE9E7]">
                    <Bot className="h-7 w-7 text-[#174E57]" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-[#173F46]">
                    {tr("How can I help you today?")}
                  </h2>
                  <p className="mt-2 text-sm text-[#786F65]">
                    {tr(
                      "Choose a starting question or write your own. English and Hebrew are both supported.",
                    )}
                  </p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#174E57] text-white" : "border border-[#E0D7CC] bg-white text-[#324346]"}`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.role === "assistant" && (
                      <button
                        onClick={() =>
                          navigator.clipboard
                            ?.writeText(message.content)
                            .then(() => toast.success(tr("Answer copied")))
                        }
                        className="mt-3 flex items-center gap-1.5 text-xs text-[#786F65] hover:text-[#174E57]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-[#E0D7CC] bg-white px-4 py-3 text-sm text-[#786F65]">
                    <Sparkles className="h-4 w-4 animate-pulse text-[#A47D4A]" />
                    {tr("Thinking about your business…")}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-[#E5DDD3] bg-white p-4">
              <div className="flex gap-2">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      ask();
                    }
                  }}
                  placeholder={tr(
                    "Ask about customers, pricing, marketing, the website, or your next step…",
                  )}
                  rows={2}
                  className="resize-none bg-[#FBF8F3]"
                />
                <Button
                  onClick={() => ask()}
                  disabled={!draft.trim() || thinking}
                  className="h-auto bg-[#174E57] px-5 hover:bg-[#0E343B]"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">{tr("Send")}</span>
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-[#8A8177]">
                {tr(
                  "Press Enter to send · Shift + Enter for a new line · Check prices, dates, and promises before using a draft.",
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Panel title="Try asking" subtitle="Useful places to begin">
            {assistantStarters.map((starter) => (
              <button
                key={starter}
                onClick={() => ask(starter)}
                disabled={thinking}
                className="flex w-full items-center gap-3 border-b border-[#E5DDD3] py-3 text-start text-sm last:border-0 hover:text-[#174E57]"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-[#A47D4A]" />
                <span className="flex-1">{tr(starter)}</span>
                <ChevronRight className="h-4 w-4 text-[#A49A8F]" />
              </button>
            ))}
          </Panel>
          <Panel
            title="Safety and control"
            subtitle="What this first version can do"
          >
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <span>{tr("Read the business summary shown in Manager OS")}</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <span>{tr("Explain, plan, recommend, and prepare drafts")}</span>
              </div>
              <div className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#A47D4A]" />
                <span>
                  {tr(
                    "Cannot publish, message, charge, delete, or change records",
                  )}
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Providers({
  providers,
  setProviders,
}: {
  providers: AdminPartner[];
  setProviders: React.Dispatch<React.SetStateAction<AdminPartner[]>>;
}) {
  const tr = useAdminTranslation();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    businessType: "",
    phone: "",
    area: "Harish",
    description: "",
  });
  const toggle = async (provider: AdminPartner) => {
    try {
      await cleanfixApi.updatePartner(provider.id, {
        is_active: !provider.isActive,
      });
      setProviders((current) =>
        current.map((item) =>
          item.id === provider.id
            ? { ...item, isActive: !item.isActive }
            : item,
        ),
      );
      toast.success(
        `${provider.name} ${tr("is now")} ${tr(provider.isActive ? "inactive" : "active")}.`,
      );
    } catch {
      toast.error(tr("The provider change was not saved."));
    }
  };
  const add = async () => {
    if (!draft.name.trim()) {
      toast.error(tr("Please enter the provider name."));
      return;
    }
    try {
      const provider = await cleanfixApi.createPartner({
        name: draft.name.trim(),
        business_type: draft.businessType,
        partner_type: "service_provider",
        phone: draft.phone,
        area: draft.area,
        description_en: draft.description,
        is_active: true,
      });
      setProviders((current) => [
        {
          id: provider.id,
          name: provider.name,
          businessType: provider.business_type || provider.partner_type,
          phone: provider.phone || "",
          area: provider.area || "",
          description: provider.description_en || "",
          isActive: provider.is_active !== false,
        },
        ...current,
      ]);
      setAdding(false);
      setDraft({
        name: "",
        businessType: "",
        phone: "",
        area: "Harish",
        description: "",
      });
      toast.success(tr("Provider saved to the database."));
    } catch {
      toast.error(tr("The provider was not created."));
    }
  };
  return (
    <>
      <SectionTitle
        eyebrow="Trusted network"
        title="Providers"
        description="Add providers and control who is active in your real directory."
        action={
          <Button className="bg-[#174E57]" onClick={() => setAdding(true)}>
            <Plus className="me-2 h-4 w-4" />
            {tr("Add provider")}
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDE9E7] font-semibold text-[#174E57]">
                    {provider.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-[#173F46]">
                      {provider.name}
                    </p>
                    <p className="text-xs text-[#786F65]">
                      {provider.businessType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#786F65]">{tr("Active")}</span>
                  <Switch
                    checked={provider.isActive}
                    onCheckedChange={() => toggle(provider)}
                  />
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-[#F0EAE1] p-3">
                <Info label="Area" value={provider.area} />
              </div>
              {provider.description && (
                <p className="mt-4 text-xs leading-5 text-[#6F675F]">
                  {provider.description}
                </p>
              )}
              {provider.phone && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a href={`tel:${provider.phone}`}>
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    {provider.phone}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {!providers.length && (
          <Card className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardContent>
              <EmptyState text="No providers are stored yet." />
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="bg-[#FBF8F3]">
          <DialogHeader>
            <DialogTitle>{tr("Add a provider")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FieldInput
              label="Provider name"
              value={draft.name}
              onChange={(name) => setDraft({ ...draft, name })}
            />
            <FieldInput
              label="Business type"
              value={draft.businessType}
              onChange={(businessType) => setDraft({ ...draft, businessType })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Phone"
                value={draft.phone}
                onChange={(phone) => setDraft({ ...draft, phone })}
                dir="ltr"
              />
              <FieldInput
                label="Area"
                value={draft.area}
                onChange={(area) => setDraft({ ...draft, area })}
              />
            </div>
            <FieldArea
              label="Description"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              large
            />
            <Button className="w-full bg-[#174E57]" onClick={add}>
              {tr("Save provider")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Services({
  items,
  setItems,
}: {
  items: AdminService[];
  setItems: React.Dispatch<React.SetStateAction<AdminService[]>>;
}) {
  const tr = useAdminTranslation();
  const [editing, setEditing] = useState<AdminService | null>(null);
  const toggle = async (service: AdminService, active: boolean) => {
    setItems((current) =>
      current.map((item) =>
        item.id === service.id ? { ...item, active } : item,
      ),
    );
    try {
      await cleanfixApi.updateService(service.id, { is_active: active });
      toast.success(`${service.name} ${tr(active ? "published" : "hidden")}`);
    } catch {
      setItems((current) =>
        current.map((item) =>
          item.id === service.id ? { ...item, active: service.active } : item,
        ),
      );
      toast.error(tr("The service change was not saved."));
    }
  };
  const save = async () => {
    if (!editing) return;
    try {
      const result = await cleanfixApi.updateService(editing.id, {
        name_en: editing.name,
        name_he: editing.nameHe,
        description_en: editing.description,
        description_he: editing.descriptionHe,
        category: editing.category,
        price_from: editing.priceFrom ? Number(editing.priceFrom) : null,
        price_unit: editing.priceUnit,
        price_note_en: editing.priceNoteEn,
        price_note_he: editing.priceNoteHe,
        image_url: editing.imageUrl,
      });
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id
            ? {
                ...editing,
                priceFrom:
                  result.price_from == null ? "" : String(result.price_from),
              }
            : item,
        ),
      );
      setEditing(null);
      toast.success(tr("Service and price published."));
    } catch {
      toast.error(tr("The service was not saved."));
    }
  };
  return (
    <>
      <SectionTitle
        eyebrow="Offer management"
        title="Services & pricing"
        description="Change names, descriptions, starting prices, images, and public visibility."
      />
      <div className="space-y-4">
        {items.map((service) => (
          <Card key={service.id} className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {service.imageUrl && (
                  <img
                    src={absoluteApiUrl(service.imageUrl)}
                    alt=""
                    className="h-20 w-28 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans text-base font-semibold text-[#173F46]">
                      {service.name}
                    </h3>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[#625B53]">
                    {service.description || tr("No public description is stored.")}
                  </p>
                  {service.priceFrom && (
                    <p className="mt-2 font-medium text-[#A47D4A]">
                      {tr("From ₪")}
                      {service.priceFrom}
                      {service.priceUnit ? ` ${service.priceUnit}` : ""}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing({ ...service })}
                >
                  <PencilLine className="me-2 h-4 w-4" />
                  {tr("Edit")}
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#786F65]">{tr("Public")}</span>
                  <Switch
                    checked={service.active}
                    onCheckedChange={(active) => toggle(service, active)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <Card className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardContent>
              <EmptyState text="No services are stored yet." />
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-[#FBF8F3]">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>{tr("Edit service and price")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldInput
                  label="English name"
                  value={editing.name}
                  onChange={(name) => setEditing({ ...editing, name })}
                  dir="ltr"
                />
                <FieldInput
                  label="Hebrew name"
                  value={editing.nameHe}
                  onChange={(nameHe) => setEditing({ ...editing, nameHe })}
                  dir="rtl"
                />
                <FieldArea
                  label="English description"
                  value={editing.description}
                  onChange={(description) =>
                    setEditing({ ...editing, description })
                  }
                  large
                />
                <FieldArea
                  label="Hebrew description"
                  value={editing.descriptionHe}
                  onChange={(descriptionHe) =>
                    setEditing({ ...editing, descriptionHe })
                  }
                  large
                  rtl
                />
                <FieldInput
                  label="Starting price (₪)"
                  value={editing.priceFrom}
                  onChange={(priceFrom) =>
                    setEditing({ ...editing, priceFrom })
                  }
                  dir="ltr"
                />
                <FieldInput
                  label="Price unit (example: per visit)"
                  value={editing.priceUnit}
                  onChange={(priceUnit) =>
                    setEditing({ ...editing, priceUnit })
                  }
                />
                <FieldInput
                  label="English price note"
                  value={editing.priceNoteEn}
                  onChange={(priceNoteEn) =>
                    setEditing({ ...editing, priceNoteEn })
                  }
                />
                <FieldInput
                  label="Hebrew price note"
                  value={editing.priceNoteHe}
                  onChange={(priceNoteHe) =>
                    setEditing({ ...editing, priceNoteHe })
                  }
                  dir="rtl"
                />
              </div>
              <FieldInput
                label="Image URL (or choose an uploaded image in Website Studio)"
                value={editing.imageUrl}
                onChange={(imageUrl) => setEditing({ ...editing, imageUrl })}
                dir="ltr"
              />
              <Button onClick={save} className="w-full bg-[#174E57]">
                {tr("Publish service")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const marketBenchmarks = [
  {
    id: "handyman",
    label: "Handyman visit",
    match: ["handyman", "הנדימן"],
    low: 250,
    high: 350,
    unit: "per standard weekday visit",
    source: "The Professionals",
    sourceUrl: "https://www.pro.co.il/handymen/pricing/handyman-service",
    sourceDate: "Checked 12 Aug 2026",
  },
  {
    id: "post-renovation",
    label: "Post-renovation cleaning — 4 rooms",
    match: ["post-renovation", "after renovation", "אחרי שיפוץ"],
    low: 1800,
    high: 2300,
    unit: "standard apartment up to 80 m²",
    source: "The Professionals",
    sourceUrl:
      "https://www.pro.co.il/house-cleaning-companies/services/apartment-cleaning-after-renovation",
    sourceDate: "Checked 12 Aug 2026",
  },
  {
    id: "ac-cleaning",
    label: "Air-conditioner cleaning",
    match: [
      "ac cleaning",
      "air conditioner cleaning",
      "ניקוי מזגן",
      "ניקוי מזגנים",
    ],
    low: 250,
    high: 1100,
    unit: "depends on basic filter cleaning vs. full wash",
    source: "The Professionals",
    sourceUrl: "https://www.pro.co.il/hvac-cleaning/pricing",
    sourceDate: "Checked 12 Aug 2026",
  },
];

function MarketPriceComparison({ items }: { items: AdminService[] }) {
  const tr = useAdminTranslation();
  const comparisons = marketBenchmarks.map((benchmark) => {
    const service = items.find((item) =>
      benchmark.match.some((term) =>
        `${item.name} ${item.nameHe}`
          .toLowerCase()
          .includes(term.toLowerCase()),
      ),
    );
    const price = service?.priceFrom ? Number(service.priceFrom) : undefined;
    const position =
      price == null || Number.isNaN(price)
        ? "No CleanFix price yet"
        : price < benchmark.low
          ? "Below market range"
          : price > benchmark.high
            ? "Above market range"
            : "Inside market range";
    const tone =
      position === "Inside market range"
        ? "bg-[#DCEADF] text-[#2E6840]"
        : position === "No CleanFix price yet"
          ? "bg-[#EAE7E3] text-[#746D65]"
          : "bg-[#EEE4D4] text-[#765D38]";
    return { benchmark, service, price, position, tone };
  });

  return (
    <div className="mt-8">
      <SectionTitle
        eyebrow="Israeli market reference"
        title="Price comparison"
        description="Compare CleanFixHarish starting prices with published Israeli reference ranges. These ranges guide decisions; they do not automatically change your prices."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {comparisons.map(({ benchmark, service, price, position, tone }) => (
          <Card key={benchmark.id} className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 min-[390px]:flex-row min-[390px]:items-start min-[390px]:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#173F46]">
                    {tr(benchmark.label)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#786F65]">
                    {tr(benchmark.unit)}
                  </p>
                </div>
                <Badge className={`w-fit shrink-0 ${tone}`}>{tr(position)}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8177]">
                    {tr("CleanFix from")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[#173F46]">
                    {price == null || Number.isNaN(price)
                      ? "—"
                      : `₪${price.toLocaleString()}`}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-[#8A8177]">
                    {service?.name || tr("Not matched")}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F0EAE1] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8177]">
                    {tr("Israel range")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[#A47D4A]">
                    ₪{benchmark.low.toLocaleString()}–
                    {benchmark.high.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[10px] text-[#8A8177]">
                    {tr("VAT included by source")}
                  </p>
                </div>
              </div>
              <a
                href={benchmark.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#DDD3C7] bg-white px-3 py-2 text-xs text-[#174E57] hover:border-[#A47D4A]"
              >
                <span className="min-w-0">
                  <strong>{benchmark.source}</strong>
                  <span className="block text-[10px] text-[#8A8177]">
                    {benchmark.sourceDate}
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-[#786F65]">
        {tr(
          "Market ranges are external references, not official government tariffs. Confirm scope, VAT, materials, travel, urgency, apartment size, and service quality before setting a customer price. Update the checked date whenever the source is reviewed.",
        )}
      </p>
    </div>
  );
}

type PricingReference = {
  id: number;
  observation_key: string;
  category: string;
  sub_service: string;
  geography: string;
  min_price?: number;
  max_price?: number;
  vat_status: string;
  validation_status: string;
  eligible_for_estimate: boolean;
  source: { publisher: string; url: string };
};
type PricingEstimate = {
  id: number;
  service_description: string;
  geography: string;
  suggested_min?: number;
  suggested_max?: number;
  customer_min?: number;
  customer_max?: number;
  provider_budget?: number;
  status: string;
  disclaimer: string;
};
type ServiceQuote = {
  id: number;
  estimate_id: number;
  quoted_total: number;
  deposit_required?: number;
  scope: string;
  exclusions?: string;
  terms?: string;
  status: string;
  expires_at: string;
  created_at: string;
};
type LocalPricingEvidence = {
  id: number;
  evidence_kind: string;
  category: string;
  sub_service: string;
  geography: string;
  customer_price?: number;
  provider_amount?: number;
  scope_notes: string;
  status: string;
};
type LocalPricingBenchmark = {
  category: string;
  sub_service: string;
  geography: string;
  sample_count: number;
  customer_average?: number;
  provider_average?: number;
  margin_average?: number;
  ready_for_guidance: boolean;
  minimum_samples: number;
};

function PricingWorkspace({ leads }: { leads: DashboardLead[] }) {
  const tr = useAdminTranslation();
  const [references, setReferences] = useState<PricingReference[]>([]);
  const [estimates, setEstimates] = useState<PricingEstimate[]>([]);
  const [quotes, setQuotes] = useState<ServiceQuote[]>([]);
  const [localEvidence, setLocalEvidence] = useState<LocalPricingEvidence[]>(
    [],
  );
  const [benchmarks, setBenchmarks] = useState<LocalPricingBenchmark[]>([]);
  const [selected, setSelected] = useState("");
  const [leadId, setLeadId] = useState("none");
  const [description, setDescription] = useState("");
  const [geography, setGeography] = useState("Harish");
  const [customerMin, setCustomerMin] = useState("");
  const [customerMax, setCustomerMax] = useState("");
  const [providerBudget, setProviderBudget] = useState("");
  const [local, setLocal] = useState({
    evidence_kind: "provider_quote",
    category: "Handyman",
    sub_service: "",
    geography: "Harish",
    customer_price: "",
    provider_amount: "",
    scope_notes: "",
  });
  const [quoteDraft, setQuoteDraft] = useState({
    estimate_id: "",
    quoted_total: "",
    deposit_required: "",
    scope: "",
    exclusions: "",
    terms:
      "Price includes only the written scope. Materials and additional work require written approval.",
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  });
  const [publishedLinks, setPublishedLinks] = useState<Record<number, string>>(
    {},
  );
  const load = async () => {
    try {
      const [r, e, q, l, b] = await Promise.all([
        cleanfixApi.listPricingReferences(),
        cleanfixApi.listPriceEstimates(),
        cleanfixApi.listServiceQuotes(),
        cleanfixApi.listLocalPriceEvidence(),
        cleanfixApi.getLocalPriceBenchmarks(),
      ]);
      setReferences(r.items || []);
      setEstimates(e.items || []);
      setQuotes(q.items || []);
      setLocalEvidence(l.items || []);
      setBenchmarks(b.items || []);
    } catch {
      toast.error(tr("Pricing workspace could not load."));
    }
  };
  useEffect(() => {
    load();
  }, []);
  const reference = references.find((item) => String(item.id) === selected);
  const create = async () => {
    if (!reference || description.trim().length < 10) {
      toast.error(tr("Choose verified evidence and describe the job clearly."));
      return;
    }
    try {
      await cleanfixApi.createPriceEstimate({
        lead_id: leadId === "none" ? null : Number(leadId),
        observation_id: reference.id,
        service_description: description,
        geography,
        customer_min: customerMin ? Number(customerMin) : null,
        customer_max: customerMax ? Number(customerMax) : null,
        provider_budget: providerBudget ? Number(providerBudget) : null,
      });
      toast.success(tr("Draft saved. It has not been sent to the customer."));
      setDescription("");
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || tr("Draft was not saved."));
    }
  };
  const approve = async (id: number) => {
    try {
      await cleanfixApi.approvePriceEstimate(id);
      toast.success(tr("Owner approval recorded. Nothing was sent automatically."));
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || tr("Approval failed."));
    }
  };
  const chooseEstimate = (id: string) => {
    const estimate = estimates.find((item) => String(item.id) === id);
    setQuoteDraft((current) => ({
      ...current,
      estimate_id: id,
      quoted_total: estimate?.customer_max
        ? String(estimate.customer_max)
        : estimate?.customer_min
          ? String(estimate.customer_min)
          : "",
      scope: estimate?.service_description || "",
    }));
  };
  const createQuote = async () => {
    if (
      !quoteDraft.estimate_id ||
      !quoteDraft.quoted_total ||
      quoteDraft.scope.trim().length < 10
    ) {
      toast.error(
        "Choose an approved estimate, enter the total, and confirm the exact scope.",
      );
      return;
    }
    try {
      await cleanfixApi.createServiceQuote({
        ...quoteDraft,
        estimate_id: Number(quoteDraft.estimate_id),
        quoted_total: Number(quoteDraft.quoted_total),
        deposit_required: quoteDraft.deposit_required
          ? Number(quoteDraft.deposit_required)
          : null,
        expires_at: new Date(quoteDraft.expires_at).toISOString(),
      });
      toast.success(tr("Private quote saved as a draft. Nothing was sent."));
      setQuoteDraft((current) => ({
        ...current,
        estimate_id: "",
        quoted_total: "",
        deposit_required: "",
        scope: "",
        exclusions: "",
      }));
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || tr("Quote was not saved."));
    }
  };
  const publishQuote = async (id: number) => {
    try {
      const result = await cleanfixApi.publishServiceQuote(id);
      const link = `${window.location.origin}${result.public_path}`;
      setPublishedLinks((current) => ({ ...current, [id]: link }));
      try {
        await navigator.clipboard?.writeText(link);
        toast.success(
          "Private customer link created and copied. It has not been sent automatically.",
        );
      } catch {
        toast.success(
          "Private customer link created. Copy it from the box below. It has not been sent automatically.",
        );
      }
      await load();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || tr("Quote could not be published."),
      );
    }
  };
  const addEvidence = async () => {
    if (
      local.sub_service.trim().length < 2 ||
      local.scope_notes.trim().length < 10
    ) {
      toast.error(tr("Add the service and exact scope."));
      return;
    }
    try {
      await cleanfixApi.createLocalPriceEvidence({
        ...local,
        customer_price: local.customer_price
          ? Number(local.customer_price)
          : null,
        provider_amount: local.provider_amount
          ? Number(local.provider_amount)
          : null,
      });
      toast.success(tr("Local evidence saved for owner review."));
      setLocal({
        ...local,
        sub_service: "",
        customer_price: "",
        provider_amount: "",
        scope_notes: "",
      });
      await load();
    } catch {
      toast.error(tr("Local evidence was not saved."));
    }
  };
  const approveEvidence = async (id: number) => {
    try {
      await cleanfixApi.approveLocalPriceEvidence(id);
      toast.success(tr("Local evidence approved and counted."));
      await load();
    } catch {
      toast.error(tr("Local evidence approval failed."));
    }
  };
  return (
    <>
      <SectionTitle
        eyebrow="Evidence-backed pricing"
        title="Price estimator"
        description="Use verified national references, add the real job scope, then approve the price yourself. The system never sends or finalizes a price automatically."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="1. Create a draft estimate"
          subtitle="Only green Verified rows can be used"
        >
          <Label>{tr("Market reference")}</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="mt-2 bg-white">
              <SelectValue placeholder={tr("Choose a verified service")} />
            </SelectTrigger>
            <SelectContent>
              {references
                .filter((r) => r.eligible_for_estimate)
                .map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.sub_service} · ₪{r.min_price}–₪{r.max_price}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {reference && (
            <div className="mt-3 rounded-xl bg-[#E4ECEA] p-3 text-xs text-[#31585E]">
              <strong>{reference.source.publisher}</strong> · {tr("National reference")}
              · {reference.vat_status}
              <br />
              <a
                className="underline"
                href={reference.source.url}
                target="_blank"
                rel="noreferrer"
              >
                {tr("Open source")}
              </a>
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>{tr("Customer")}</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{tr("No customer selected")}</SelectItem>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldInput
              label="Area"
              value={geography}
              onChange={setGeography}
            />
          </div>
          <div className="mt-3">
            <FieldArea
              label="Exact work requested, measurements, access and photo findings"
              value={description}
              onChange={setDescription}
              large
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FieldInput
              label="Customer minimum ₪"
              value={customerMin}
              onChange={setCustomerMin}
              dir="ltr"
            />
            <FieldInput
              label="Customer maximum ₪"
              value={customerMax}
              onChange={setCustomerMax}
              dir="ltr"
            />
            <FieldInput
              label="Provider budget ₪"
              value={providerBudget}
              onChange={setProviderBudget}
              dir="ltr"
            />
          </div>
          <Button onClick={create} className="mt-4 w-full bg-[#174E57]">
            {tr("Save draft for my review")}
          </Button>
          <p className="mt-2 text-xs text-[#786F65]">
            {tr("Non-binding. Final scope and price require Aviel’s approval.")}
          </p>
        </Panel>
        <Panel
          title="2. Owner approval queue"
          subtitle="No customer message is sent from this screen"
        >
          {estimates.map((e) => (
            <div key={e.id} className="mb-3 rounded-2xl border bg-white p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{e.service_description}</p>
                  <p className="mt-1 text-xs text-[#786F65]">
                    {e.geography} · Market ₪{e.suggested_min}–₪{e.suggested_max}
                  </p>
                  <p className="text-xs text-[#786F65]">
                    Customer ₪{e.customer_min || "—"}–₪{e.customer_max || "—"} ·
                    Provider budget ₪{e.provider_budget || "—"}
                  </p>
                </div>
                <Badge
                  className={
                    e.status === "approved"
                      ? "bg-[#DCEADF] text-[#2E6840]"
                      : "bg-[#EEE4D4] text-[#765D38]"
                  }
                >
                  {tr(e.status)}
                </Badge>
              </div>
              {e.status === "draft" && (
                <Button
                  size="sm"
                  className="mt-3 bg-[#174E57]"
                  onClick={() => approve(e.id)}
                >
                  <Check className="mr-1 h-4 w-4" />
                  {tr("Approve")}
                </Button>
              )}
            </div>
          ))}
          {!estimates.length && <EmptyState text="No estimates yet." />}
        </Panel>
        <Panel
          title="3. Prepare the customer quote"
          subtitle="A private link is created only after you publish"
        >
          <Label>{tr("Approved estimate")}</Label>
          <Select value={quoteDraft.estimate_id} onValueChange={chooseEstimate}>
            <SelectTrigger className="mt-2 bg-white">
              <SelectValue placeholder={tr("Choose an approved estimate")} />
            </SelectTrigger>
            <SelectContent>
              {estimates
                .filter(
                  (e) =>
                    e.status === "approved" &&
                    !quotes.some((q) => q.estimate_id === e.id),
                )
                .map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    #{e.id} · {e.service_description}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FieldInput
              label="Final quoted total ₪"
              value={quoteDraft.quoted_total}
              onChange={(v) =>
                setQuoteDraft({ ...quoteDraft, quoted_total: v })
              }
              dir="ltr"
            />
            <FieldInput
              label="Deposit required ₪"
              value={quoteDraft.deposit_required}
              onChange={(v) =>
                setQuoteDraft({ ...quoteDraft, deposit_required: v })
              }
              dir="ltr"
            />
          </div>
          <div className="mt-3">
            <FieldArea
              label="Exact included scope"
              value={quoteDraft.scope}
              onChange={(v) => setQuoteDraft({ ...quoteDraft, scope: v })}
              large
            />
            <FieldArea
              label="Exclusions"
              value={quoteDraft.exclusions}
              onChange={(v) => setQuoteDraft({ ...quoteDraft, exclusions: v })}
            />
            <FieldArea
              label="Terms"
              value={quoteDraft.terms}
              onChange={(v) => setQuoteDraft({ ...quoteDraft, terms: v })}
            />
            <FieldInput
              label="Valid until"
              value={quoteDraft.expires_at}
              onChange={(v) => setQuoteDraft({ ...quoteDraft, expires_at: v })}
            />
          </div>
          <Button onClick={createQuote} className="mt-4 w-full bg-[#174E57]">
            {tr("Save private quote draft")}
          </Button>
          <div className="mt-5 space-y-3">
            {quotes.map((q) => (
              <div key={q.id} className="rounded-2xl border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      Quote #{q.id} · ₪{Number(q.quoted_total).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-[#786F65]">
                      Estimate #{q.estimate_id} · expires{" "}
                      {new Date(q.expires_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-[#E4ECEA] text-[#31585E]">
                    {tr(q.status)}
                  </Badge>
                </div>
                {q.status === "draft" && (
                  <Button
                    size="sm"
                    className="mt-3 bg-[#174E57]"
                    onClick={() => publishQuote(q.id)}
                  >
                    {tr("Create private customer link")}
                  </Button>
                )}
                {publishedLinks[q.id] && (
                  <div className="mt-3 rounded-xl bg-[#F0EAE1] p-3">
                    <p className="break-all text-xs" dir="ltr">{publishedLinks[q.id]}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() =>
                        navigator.clipboard?.writeText(publishedLinks[q.id])
                      }
                    >
                      {tr("Copy link again")}
                    </Button>
                    <p className="mt-2 text-[10px] text-[#786F65]">
                      {tr("For security, this link is available only in this browser session.")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="4. Record real local evidence"
          subtitle="Provider quote or completed CleanFixHarish job"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>{tr("Evidence type")}</Label>
              <Select
                value={local.evidence_kind}
                onValueChange={(v) => setLocal({ ...local, evidence_kind: v })}
              >
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="provider_quote">{tr("Provider quote")}</SelectItem>
                  <SelectItem value="completed_job">{tr("Completed job")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FieldInput
              label="Area"
              value={local.geography}
              onChange={(v) => setLocal({ ...local, geography: v })}
            />
            <FieldInput
              label="Category"
              value={local.category}
              onChange={(v) => setLocal({ ...local, category: v })}
            />
            <FieldInput
              label="Specific service"
              value={local.sub_service}
              onChange={(v) => setLocal({ ...local, sub_service: v })}
            />
            <FieldInput
              label="Customer price ₪"
              value={local.customer_price}
              onChange={(v) => setLocal({ ...local, customer_price: v })}
              dir="ltr"
            />
            <FieldInput
              label="Provider amount ₪"
              value={local.provider_amount}
              onChange={(v) => setLocal({ ...local, provider_amount: v })}
              dir="ltr"
            />
          </div>
          <div className="mt-3">
            <FieldArea
              label="Exact comparable scope"
              value={local.scope_notes}
              onChange={(v) => setLocal({ ...local, scope_notes: v })}
              large
            />
          </div>
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={addEvidence}
          >
            {tr("Save as pending evidence")}
          </Button>
        </Panel>
        <Panel
          title="5. Review local evidence"
          subtitle="Only Aviel-approved records count"
        >
          {localEvidence.map((item) => (
            <div key={item.id} className="mb-3 rounded-2xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {item.sub_service} · {item.geography}
                  </p>
                  <p className="mt-1 text-xs text-[#786F65]">
                    {item.evidence_kind.replace("_", " ")} · Customer ₪
                    {item.customer_price || "—"} · Provider ₪
                    {item.provider_amount || "—"}
                  </p>
                  <p className="mt-1 text-xs text-[#786F65]">
                    {item.scope_notes}
                  </p>
                </div>
                <Badge
                  className={
                    item.status === "approved"
                      ? "bg-[#DCEADF] text-[#2E6840]"
                      : "bg-[#EEE4D4] text-[#765D38]"
                  }
                >
                  {tr(item.status)}
                </Badge>
              </div>
              {item.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => approveEvidence(item.id)}
                >
                  <Check className="mr-1 h-4 w-4" />
                  {tr("Approve evidence")}
                </Button>
              )}
            </div>
          ))}
          {!localEvidence.length && (
            <EmptyState text="No local evidence yet." />
          )}
        </Panel>
        <Panel
          title="Evidence status"
          subtitle="What the estimator is allowed to use"
        >
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="Verified"
              value={references.filter((r) => r.eligible_for_estimate).length}
              note="Usable national rows"
              icon={BadgeCheck}
            />
            <Metric
              label="Pending"
              value={references.filter((r) => !r.eligible_for_estimate).length}
              note="Blocked from estimates"
              icon={Clock3}
              tone="brass"
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#625B53]">
            {tr(
              "Harish and Pardes Hanna adjustments appear only after at least five owner-approved comparable local records with both customer and provider amounts.",
            )}
          </p>
          <div className="mt-4 space-y-2">
            {benchmarks.map((item) => (
              <div
                key={`${item.category}-${item.sub_service}-${item.geography}`}
                className="rounded-xl border bg-white p-3 text-xs"
              >
                <div className="flex justify-between gap-2">
                  <strong>
                    {item.sub_service} · {item.geography}
                  </strong>
                  <span>
                    {item.sample_count}/{item.minimum_samples} {tr("samples")}
                  </span>
                </div>
                <p className="mt-1 text-[#786F65]">
                  {item.ready_for_guidance
                    ? `Customer average ₪${Number(item.customer_average).toFixed(0)} · Provider average ₪${Number(item.provider_average).toFixed(0)} · Retained ₪${Number(item.margin_average).toFixed(0)}`
                    : tr("Local guidance remains hidden until enough comparable evidence exists.")}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function ContentControl() {
  const tr = useAdminTranslation();
  const [items, setItems] = useState<CmsItem[]>([]);
  const [selected, setSelected] = useState<CmsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [restorePoint, setRestorePoint] = useState<{
    name: string;
    created_at: string;
    content_sections: number;
    services: number;
  } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    Promise.all([
      cleanfixApi.listSiteContent(),
      cleanfixApi.getSiteSettings(),
      cleanfixApi.listSiteMedia(),
    ])
      .then(([result, siteSettings, images]) => {
        setItems(result?.items || []);
        setSettings(siteSettings);
        setMedia(images || []);
      })
      .catch(() => toast.error(tr("Website content could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cleanfixApi
      .getDefaultRestorePoint()
      .then(setRestorePoint)
      .catch(() => toast.error(tr("The protected default could not be prepared.")));
  }, []);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await cleanfixApi.updateSiteContent(selected.id, {
        title_en: selected.title_en,
        title_he: selected.title_he,
        content_en: selected.content_en,
        content_he: selected.content_he,
        is_active: selected.is_active,
      });
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelected(null);
      toast.success(
        "Website content published. The public page will use it on refresh.",
      );
    } catch {
      toast.error(tr("The content was not saved."));
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      setSettings(
        await cleanfixApi.updateSiteSettings(
          settings as unknown as Record<string, unknown>,
        ),
      );
      toast.success(tr("Website design published."));
    } catch {
      toast.error(tr("The website design was not saved."));
    } finally {
      setSaving(false);
    }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const image = await cleanfixApi.uploadSiteMedia(
        file,
        file.name.replace(/\.[^.]+$/, ""),
      );
      setMedia((current) => [image, ...current]);
      toast.success(tr("Image uploaded. Choose where to use it."));
    } catch {
      toast.error(
        "Image upload failed. Use JPG, PNG, WEBP, or GIF under 5 MB.",
      );
    } finally {
      setUploading(false);
    }
  };

  const restoreDefault = async () => {
    setRestoring(true);
    try {
      await cleanfixApi.restoreDefaultWebsite();
      toast.success(tr("The original working website has been restored."));
      setConfirmRestore(false);
      window.setTimeout(() => window.location.reload(), 700);
    } catch {
      toast.error(tr("The website was not restored. Nothing was changed."));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <SectionTitle
        eyebrow="Website Studio"
        title="Edit your website"
        description="Change words, colors, buttons, layout, and pictures without touching code."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmRestore(true)}
              disabled={!restorePoint}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {tr("Return to default")}
            </Button>
            <Button variant="outline" asChild>
              <a href="/" target="_blank">
                {tr("Open live preview")}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Protected default"
          subtitle="Your original working website is kept as a safety copy"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#DFE8DA] p-2.5">
              <ShieldCheck className="h-5 w-5 text-[#466049]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#173F46]">
                {restorePoint?.name || tr("Preparing safety copy…")}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#786F65]">
                {tr("Restores website words, colors, buttons, selected pictures, services, prices, and visibility. It never changes accounts, leads, jobs, providers, payments, or uploaded files.")}
              </p>
            </div>
          </div>
        </Panel>
        <Panel
          title="1. Words"
          subtitle={
            loading ? tr("Loading…") : tr("Click a section to edit English and Hebrew")
          }
        >
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected({ ...item })}
              className="flex w-full items-center gap-3 border-b border-[#E5DDD3] py-4 text-left last:border-0"
            >
              <div className="rounded-xl bg-[#DDE9E7] p-2">
                <FileText className="h-4 w-4 text-[#174E57]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{title(item.section_key)}</p>
                <p className="line-clamp-1 text-xs text-[#786F65]">
                  {item.title_en || tr("Untitled")} · EN/HE
                </p>
              </div>
              <Badge variant="outline">
                {item.is_active === false ? tr("Hidden") : tr("Published")}
              </Badge>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </Panel>
        {settings && (
          <Panel
            title="2. Look and buttons"
            subtitle="Choose safe brand colors and the homepage layout"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Main color", "primary_color"],
                  ["Gold accent", "accent_color"],
                  ["Page background", "surface_color"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="text-xs text-[#625B53]">
                  {label}
                  <div className="mt-2 flex items-center gap-2 rounded-xl border bg-white p-2">
                    <input
                      type="color"
                      value={settings[key]}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          [key]: event.target.value.toUpperCase(),
                        })
                      }
                      className="h-9 w-12"
                    />
                    <span>{settings[key]}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <Label>{tr("Hero layout")}</Label>
              <Select
                value={settings.hero_layout}
                onValueChange={(hero_layout) =>
                  setSettings({ ...settings, hero_layout })
                }
              >
                <SelectTrigger className="mt-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-left">
                    {tr("Words left, picture right")}
                  </SelectItem>
                  <SelectItem value="image-left">
                    {tr("Picture left, words right")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label>{tr("Motion and visual effects")}</Label>
              <Select
                value={settings.effects_mode}
                onValueChange={(effects_mode: "full" | "reduced" | "off") =>
                  setSettings({ ...settings, effects_mode })
                }
              >
                <SelectTrigger className="mt-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reduced">{tr("Reduced — recommended")}</SelectItem>
                  <SelectItem value="full">{tr("Full — gentle motion")}</SelectItem>
                  <SelectItem value="off">{tr("Off — no motion")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs leading-5 text-[#786F65]">
                {tr("Reduced is the safest default. A visitor's device accessibility preference always overrides this setting and disables motion.")}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FieldInput
                label="Main button — English"
                value={settings.primary_cta_en || ""}
                onChange={(primary_cta_en) =>
                  setSettings({ ...settings, primary_cta_en })
                }
              />
              <FieldInput
                label="Main button — Hebrew"
                value={settings.primary_cta_he || ""}
                onChange={(primary_cta_he) =>
                  setSettings({ ...settings, primary_cta_he })
                }
              />
              <FieldInput
                label="WhatsApp button — English"
                value={settings.secondary_cta_en || ""}
                onChange={(secondary_cta_en) =>
                  setSettings({ ...settings, secondary_cta_en })
                }
              />
              <FieldInput
                label="WhatsApp button — Hebrew"
                value={settings.secondary_cta_he || ""}
                onChange={(secondary_cta_he) =>
                  setSettings({ ...settings, secondary_cta_he })
                }
              />
            </div>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="mt-5 w-full bg-[#174E57]"
            >
              {tr("Publish design and buttons")}
            </Button>
          </Panel>
        )}
        <Panel
          title="3. Pictures"
          subtitle="Upload once, then choose Hero or Bottom banner"
        >
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#CFC5B9] bg-white p-6 text-sm text-[#174E57]">
            <Upload className="mr-2 h-5 w-5" />
            {uploading ? tr("Uploading…") : tr("Upload a picture (maximum 5 MB)")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(event) => upload(event.target.files?.[0])}
            />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border bg-white"
              >
                <img
                  src={absoluteApiUrl(item.url)}
                  alt={item.alt_text || item.filename}
                  className="h-28 w-full object-cover"
                />
                <div className="grid grid-cols-2 gap-1 p-2">
                  <Button
                    size="sm"
                    variant={
                      settings?.hero_image_url === item.url
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      settings &&
                      setSettings({ ...settings, hero_image_url: item.url })
                    }
                  >
                    {tr("Hero")}
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      settings?.cta_image_url === item.url
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      settings &&
                      setSettings({ ...settings, cta_image_url: item.url })
                    }
                  >
                    {tr("Bottom")}
                  </Button>
                </div>
              </div>
            ))}
            {!media.length && (
              <div className="col-span-full py-6 text-center text-sm text-[#786F65]">
                <Image className="mx-auto mb-2 h-6 w-6" />
                {tr("No uploaded pictures yet.")}
              </div>
            )}
          </div>
          {settings && (
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="mt-4 w-full bg-[#174E57]"
            >
              {tr("Publish selected pictures")}
            </Button>
          )}
        </Panel>
        <Panel title="How this works" subtitle="Three simple steps">
          <ol className="space-y-3 text-sm text-[#625B53]">
            <li>
              <strong>1.</strong> {tr("Make one change.")}
            </li>
            <li>
              <strong>2.</strong> {tr("Press the green Publish button in that box.")}
            </li>
            <li>
              <strong>3.</strong> {tr("Open live preview and refresh the page.")}
            </li>
          </ol>
          <div className="mt-5 rounded-2xl bg-[#173F46] p-4 text-white">
            <p className="font-medium">{tr("Safe by design")}</p>
            <p className="mt-1 text-xs text-white/70">
              {tr("Your logo and essential structure stay protected. You can change the parts customers see most.")}
            </p>
          </div>
        </Panel>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-[#FBF8F3]">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{tr("Edit ")}{title(selected.section_key)}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldArea
                  label="English title"
                  value={selected.title_en || ""}
                  onChange={(value) =>
                    setSelected({ ...selected, title_en: value })
                  }
                />
                <FieldArea
                  label="Hebrew title"
                  value={selected.title_he || ""}
                  onChange={(value) =>
                    setSelected({ ...selected, title_he: value })
                  }
                  rtl
                />
                <FieldArea
                  label="English content"
                  value={selected.content_en || ""}
                  onChange={(value) =>
                    setSelected({ ...selected, content_en: value })
                  }
                  large
                />
                <FieldArea
                  label="Hebrew content"
                  value={selected.content_he || ""}
                  onChange={(value) =>
                    setSelected({ ...selected, content_he: value })
                  }
                  large
                  rtl
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#F0EAE1] p-4">
                <div>
                  <p className="text-sm font-medium">{tr("Published on website")}</p>
                  <p className="text-xs text-[#786F65]">
                    {tr("Turn this off to hide this saved text.")}
                  </p>
                </div>
                <Switch
                  checked={selected.is_active !== false}
                  onCheckedChange={(value) =>
                    setSelected({ ...selected, is_active: value })
                  }
                />
              </div>
              <Button
                onClick={save}
                disabled={saving}
                className="w-full bg-[#174E57]"
              >
                {saving ? tr("Publishing…") : tr("Publish words")}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={confirmRestore} onOpenChange={setConfirmRestore}>
        <DialogContent className="max-w-md bg-[#FBF8F3]">
          <DialogHeader>
            <DialogTitle>{tr("Return to the original working website?")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-[#625B53]">
            <p>
              {tr("This will replace your current website words, design choices, selected pictures, and service presentation with the protected default.")}
            </p>
            <div className="rounded-xl bg-[#EEE4D4] p-4 text-[#765D38]">
              <strong>{tr("Your business records stay safe.")}</strong>
              <br />
              {tr("Accounts, leads, jobs, providers, payments, and uploaded files are not changed.")}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmRestore(false)}
                disabled={restoring}
              >
                {tr("Cancel")}
              </Button>
              <Button
                onClick={restoreDefault}
                disabled={restoring}
                className="bg-[#8A4639] hover:bg-[#71372E]"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {restoring ? tr("Restoring…") : tr("Yes, restore default")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FieldArea({
  label,
  value,
  onChange,
  large,
  rtl,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
  rtl?: boolean;
}) {
  const tr = useAdminTranslation();
  return (
    <div>
      <Label>{tr(label)}</Label>
      {large ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          dir={rtl ? "rtl" : "ltr"}
          className="mt-1.5 bg-white"
        />
      ) : (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          dir={rtl ? "rtl" : "ltr"}
          className="mt-1.5 bg-white"
        />
      )}
    </div>
  );
}
function FieldInput({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl" | "auto";
}) {
  const tr = useAdminTranslation();
  return (
    <div>
      <Label>{tr(label)}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        dir={dir}
        className="mt-1.5 bg-white"
      />
    </div>
  );
}

function FollowUps({
  leads,
  openWhatsApp,
  completeFollowUp,
}: {
  leads: DashboardLead[];
  openWhatsApp: (l: DashboardLead, m?: string) => void;
  completeFollowUp: (l: DashboardLead) => void;
}) {
  const tr = useAdminTranslation();
  const followups = leads.filter(
    (l) =>
      l.followUpStatus !== "completed" &&
      (l.status === "follow-up" ||
        l.status === "completed" ||
        l.status === "quoted"),
  );
  return (
    <>
      <SectionTitle
        eyebrow="Customer care"
        title="Follow-ups & reviews"
        description="Close the loop calmly and save every completed follow-up."
      />
      <Panel
        title="Follow-up queue"
        subtitle="Prioritized by next useful customer action"
      >
        {followups.map((lead) => (
          <div
            key={lead.id}
            className="flex flex-col gap-3 border-b border-[#E5DDD3] py-4 last:border-0 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{lead.customerName}</p>
                <Badge className={statusStyle[lead.status]}>
                  {tr(lead.status)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-[#786F65]">
                {lead.service} · {lead.notes || tr("No notes added")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  openWhatsApp(
                    lead,
                    lead.status === "completed"
                      ? templates[3].body
                      : templates[2].body,
                  )
                }
              >
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                {lead.status === "completed" ? tr("Request review") : tr("Follow up")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={tr("Mark follow-up complete")}
                onClick={() => completeFollowUp(lead)}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!followups.length && (
          <EmptyState text="No follow-ups need attention." />
        )}
      </Panel>
    </>
  );
}

type PlatformStatus = "Production" | "Business tool" | "Required check" | "Retired";
type PlatformActionName = "Usage" | "Billing" | "Dashboard" | "Documentation";
type PlatformEntry = {
  name: string;
  category: string;
  purpose: string;
  planType: string;
  cadence: string;
  confirmedCost: number | null;
  currency: "USD" | "ILS" | null;
  renewalDate: string | null;
  accountOwner: string;
  status: PlatformStatus;
  notes: string;
  lastVerified: string | null;
  icon: typeof Cloud;
  actions: Record<PlatformActionName, string | undefined>;
};

// This inventory is deliberately limited to services named in PLATFORM_DIRECTORY.md
// and the application source. Unknown costs and account details stay unknown.
const platformEntries: PlatformEntry[] = [
  {
    name: "Railway",
    category: "Hosting",
    purpose: "Runs the production website and backend application.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Production",
    notes: "Environment variables and deployment access must stay in Railway.",
    lastVerified: null,
    icon: Cloud,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://railway.com/dashboard",
      Documentation: "https://docs.railway.com/",
    },
  },
  {
    name: "Railway PostgreSQL",
    category: "Database",
    purpose: "Stores live business records for the application.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Production",
    notes: "Confirm a usable backup before migrations or other risky releases.",
    lastVerified: null,
    icon: Database,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://railway.com/dashboard",
      Documentation: "https://docs.railway.com/",
    },
  },
  {
    name: "Cloudflare",
    category: "DNS & security",
    purpose: "Controls the domain, DNS, and public connection security.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Production",
    notes: "The cleanfixharish.co.il zone, SSL, and email DNS records are sensitive.",
    lastVerified: null,
    icon: Globe2,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://dash.cloudflare.com/",
      Documentation: "https://developers.cloudflare.com/",
    },
  },
  {
    name: "GitHub",
    category: "Source control",
    purpose: "Single source of truth for the website code.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Production",
    notes: "Review changes before they reach Railway and keep two-step verification on.",
    lastVerified: null,
    icon: Github,
    actions: {
      Usage: undefined,
      Billing: "https://github.com/settings/billing",
      Dashboard: "https://github.com/cleanfixharish/cleanfix-website",
      Documentation: "https://docs.github.com/",
    },
  },
  {
    name: "Google Cloud Auth",
    category: "Identity",
    purpose: "Provides Google sign-in for the owner account.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Production",
    notes: "OAuth secrets and approved callback addresses are never displayed here.",
    lastVerified: null,
    icon: KeyRound,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://console.cloud.google.com/auth/clients",
      Documentation: "https://cloud.google.com/iam/docs",
    },
  },
  {
    name: "Google Workspace",
    category: "Email & admin",
    purpose: "Runs company email and the administrator identity.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Production",
    notes: "Preserve Google MX records and administrator recovery methods.",
    lastVerified: null,
    icon: Building2,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://admin.google.com/",
      Documentation: "https://support.google.com/a/",
    },
  },
  {
    name: "AI Gateway",
    category: "AI service",
    purpose: "Connects Manager OS to the configured AI model.",
    planType: "Usage-based — provider not recorded",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Required check",
    notes: "The provider and consumption URL are intentionally not inferred from private variables.",
    lastVerified: null,
    icon: Bot,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: undefined,
      Documentation: undefined,
    },
  },
  {
    name: "WhatsApp Business",
    category: "Customer communications",
    purpose: "Customer conversations and owner-approved message drafts.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Business tool",
    notes: "Messages are still reviewed and sent by the owner, not automatically.",
    lastVerified: null,
    icon: MessageCircle,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: undefined,
      Documentation: "https://business.whatsapp.com/",
    },
  },
  {
    name: "Google NotebookLM",
    category: "Knowledge & training",
    purpose: "Creates internal explanations, podcasts, and training material.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Business tool",
    notes: "Not part of the live website; upload only material suitable for the notebook audience.",
    lastVerified: null,
    icon: BookOpen,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://notebooklm.google.com/",
      Documentation: "https://support.google.com/notebooklm/",
    },
  },
  {
    name: "Canva",
    category: "Design & marketing",
    purpose: "Creates optional branded pictures and marketing designs.",
    planType: "Unknown — confirm in account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Business tool",
    notes: "Export and approve an asset before publishing it on the website.",
    lastVerified: null,
    icon: Image,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://www.canva.com/",
      Documentation: "https://www.canva.com/help/",
    },
  },
  {
    name: "Cursor Pro",
    category: "Developer tools",
    purpose: "AI-assisted coding tool used in the project workflow.",
    planType: "Pro — cost unconfirmed",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Business tool",
    notes: "The project workflow names Cursor; account, renewal, and usage details are not recorded here.",
    lastVerified: null,
    icon: Sparkles,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://www.cursor.com/dashboard",
      Documentation: "https://docs.cursor.com/",
    },
  },
  {
    name: "ChatGPT/Codex",
    category: "AI service",
    purpose: "AI assistant and coding-agent workspace used for project work.",
    planType: "Unknown — cost unconfirmed",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Business tool",
    notes: "The project is maintained through a ChatGPT/Codex workflow; subscription and usage details are not inferred.",
    lastVerified: null,
    icon: Bot,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://chatgpt.com/",
      Documentation: "https://help.openai.com/",
    },
  },
  {
    name: "Perplexity Pro",
    category: "Research tools",
    purpose: "Research tool used for the project’s pricing and validation briefs.",
    planType: "Pro — cost unconfirmed",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Business tool",
    notes: "Perplexity research briefs are present in the project; account and billing details are not recorded.",
    lastVerified: null,
    icon: Search,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: "https://www.perplexity.ai/",
      Documentation: "https://docs.perplexity.ai/",
    },
  },
  {
    name: "Domain registration",
    category: "Domain & registrar",
    purpose: "Registration and renewal of the cleanfixharish.co.il domain.",
    planType: "Unknown — registrar not recorded",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Production",
    notes: "The domain is evidenced in the project, but its registrar and direct account URLs require confirmation.",
    lastVerified: null,
    icon: Globe2,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: undefined,
      Documentation: undefined,
    },
  },
  {
    name: "Render",
    category: "Hosting",
    purpose: "Previous website host; no longer the production platform.",
    planType: "Retired — confirm any remaining account",
    cadence: "Unknown",
    confirmedCost: null,
    currency: null,
    renewalDate: null,
    accountOwner: "CleanFixHarish owner",
    status: "Retired",
    notes: "Do not deploy new work here; retain access only if an old backup is still needed.",
    lastVerified: null,
    icon: X,
    actions: {
      Usage: undefined,
      Billing: undefined,
      Dashboard: undefined,
      Documentation: "https://render.com/docs",
    },
  },
];

function PlatformDirectory() {
  const tr = useAdminTranslation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [costFilter, setCostFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const statusTone: Record<PlatformStatus, string> = {
    Production: "bg-[#DCEADF] text-[#2E6840]",
    "Business tool": "bg-[#DCE5F0] text-[#35546D]",
    "Required check": "bg-[#EEE4D4] text-[#765D38]",
    Retired: "bg-[#EAE7E3] text-[#746D65]",
  };
  const categories = useMemo(
    () => Array.from(new Set(platformEntries.map((entry) => entry.category))).sort(),
    [],
  );
  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return platformEntries.filter((entry) => {
      const haystack = [
        entry.name,
        entry.category,
        entry.purpose,
        entry.planType,
        entry.accountOwner,
        entry.notes,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
      const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const matchesCost =
        costFilter === "all" ||
        (costFilter === "confirmed" && entry.confirmedCost !== null) ||
        (costFilter === "unknown" && entry.confirmedCost === null);
      return matchesSearch && matchesCategory && matchesStatus && matchesCost;
    });
  }, [categoryFilter, costFilter, search, statusFilter]);
  const confirmedMonthlyTotals: Record<"USD" | "ILS", number> = { USD: 0, ILS: 0 };
  platformEntries.forEach((entry) => {
    if (entry.confirmedCost !== null && entry.cadence === "Monthly" && entry.currency) {
      confirmedMonthlyTotals[entry.currency] += entry.confirmedCost;
    }
  });
  const monthlyRecurringSummary = Object.entries(confirmedMonthlyTotals)
    .filter(([, total]) => total > 0)
    .map(([currency, total]) => `${total.toLocaleString()} ${currency}`)
    .join(" · ") || tr("No confirmed recurring costs");
  const usageBasedCount = platformEntries.filter((entry) =>
    /usage[- ]based|metered|consumption/.test(entry.planType.toLowerCase()),
  ).length;
  const renewalsIn30Days = platformEntries.filter((entry) => {
    if (!entry.renewalDate) return false;
    const days = (new Date(entry.renewalDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 30;
  }).length;
  const needsConfirmation = platformEntries.filter(
    (entry) => entry.confirmedCost === null || entry.lastVerified === null,
  ).length;
  const formatCost = (entry: PlatformEntry) =>
    entry.confirmedCost === null
      ? tr("Needs confirmation")
      : `${entry.confirmedCost.toLocaleString()} ${entry.currency || ""}`.trim();

  return (
    <>
      <SectionTitle
        eyebrow="Owner-only inventory"
        title="Platforms and Costs"
        description="A read-only inventory of the external services evidenced in this repository. Unknown costs stay unknown until confirmed in the provider account."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Confirmed monthly recurring" value={monthlyRecurringSummary} note="Unknown costs and currencies excluded" icon={CircleDollarSign} tone="teal" />
        <Metric label="Usage-based services" value={usageBasedCount} note="Plan type marked usage-based" icon={Gauge} tone="brass" />
        <Metric label="Renewals in 30 days" value={renewalsIn30Days} note="Based on recorded renewal dates" icon={CalendarClock} tone="sage" />
        <Metric label="Needs confirmation" value={needsConfirmation} note="Cost or verification date missing" icon={ClipboardCheck} tone="stone" />
      </div>
      <Card className="mt-6 border-[#D8D0C6] bg-[#FBF8F3]">
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#786F65]" />
              <Input
                aria-label={tr("Search platforms")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={tr("Search name, purpose, owner, or notes")}
                className="bg-white ps-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger aria-label={tr("Filter by category")} className="bg-white"><SelectValue placeholder={tr("Category")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr("All categories")}</SelectItem>
                {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={costFilter} onValueChange={setCostFilter}>
              <SelectTrigger aria-label={tr("Filter by cost")} className="bg-white"><SelectValue placeholder={tr("Cost")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr("All costs")}</SelectItem>
                <SelectItem value="confirmed">{tr("Confirmed cost")}</SelectItem>
                <SelectItem value="unknown">{tr("Needs confirmation")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label={tr("Filter by status")} className="bg-white"><SelectValue placeholder={tr("Status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr("All statuses")}</SelectItem>
                <SelectItem value="Production">{tr("Production")}</SelectItem>
                <SelectItem value="Business tool">{tr("Business tool")}</SelectItem>
                <SelectItem value="Required check">{tr("Required check")}</SelectItem>
                <SelectItem value="Retired">{tr("Retired")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEntries.map((platform) => (
          <Card key={platform.name} className="border-[#D8D0C6] bg-[#FBF8F3]">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl bg-[#DDE9E7] p-2.5"><platform.icon className="h-5 w-5 text-[#174E57]" /></div>
                <Badge className={statusTone[platform.status]}>{tr(platform.status)}</Badge>
              </div>
              <CardTitle className="mt-3 text-lg text-[#173F46]">{platform.name}</CardTitle>
              <p className="text-xs font-medium uppercase tracking-[.12em] text-[#A47D4A]">{tr(platform.category)}</p>
            </CardHeader>
            <CardContent className="space-y-3 p-5 pt-0">
              <p className="text-sm leading-5 text-[#625B53]">{tr(platform.purpose)}</p>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                <div><dt className="text-[#786F65]">{tr("Plan type")}</dt><dd className="mt-0.5 font-medium text-[#4A4540]">{tr(platform.planType)}</dd></div>
                <div><dt className="text-[#786F65]">{tr("Cadence")}</dt><dd className="mt-0.5 font-medium text-[#4A4540]">{tr(platform.cadence)}</dd></div>
                <div><dt className="text-[#786F65]">{tr("Confirmed cost")}</dt><dd className="mt-0.5 font-medium text-[#4A4540]">{formatCost(platform)}</dd></div>
                <div><dt className="text-[#786F65]">{tr("Currency")}</dt><dd className="mt-0.5 font-medium text-[#4A4540]">{platform.currency || tr("Needs confirmation")}</dd></div>
                <div><dt className="text-[#786F65]">{tr("Renewal")}</dt><dd className="mt-0.5 font-medium text-[#4A4540]">{platform.renewalDate || tr("Needs confirmation")}</dd></div>
                <div><dt className="text-[#786F65]">{tr("Account owner")}</dt><dd className="mt-0.5 font-medium text-[#4A4540]">{tr(platform.accountOwner)}</dd></div>
                <div><dt className="text-[#786F65]">{tr("Last verified")}</dt><dd className="mt-0.5 font-medium text-[#4A4540]">{platform.lastVerified || tr("Not recorded")}</dd></div>
              </dl>
              <p className="rounded-xl bg-[#F0EAE1] px-3 py-2 text-xs leading-5 text-[#625B53]"><strong className="text-[#4A4540]">{tr("Notes")}:</strong> {tr(platform.notes)}</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(["Usage", "Billing", "Dashboard", "Documentation"] as PlatformActionName[]).map((action) => {
                  const href = platform.actions[action];
                  const ActionIcon = action === "Usage" ? Gauge : action === "Billing" ? CircleDollarSign : action === "Dashboard" ? LayoutDashboard : BookOpen;
                  return href ? (
                    <Button key={action} variant="outline" size="sm" className="justify-start" asChild>
                      <a href={href} target="_blank" rel="noreferrer" aria-label={`${action} for ${platform.name}`}>
                        <ActionIcon className="me-1.5 h-3.5 w-3.5" />{tr(action)}<ExternalLink className="ms-auto h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <span key={action} className="flex min-h-9 items-center rounded-md border border-dashed border-[#D8D0C6] px-2 text-xs text-[#786F65]" aria-label={`${action} for ${platform.name}: needs confirmation`}>
                      <ActionIcon className="me-1.5 h-3.5 w-3.5" />{tr("Needs confirmation")}
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!filteredEntries.length && <EmptyState text="No platforms match these filters." />}
      <Panel title="Security boundary" subtitle="This static directory never reads or displays secrets">
        <div className="flex gap-2 text-sm leading-5 text-[#625B53]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#174E57]" /><span>{tr("Passwords, API keys, OAuth secrets, database addresses, and environment values stay inside their secure provider platform.")}</span></div>
      </Panel>
    </>
  );
}

function InternalOS() {
  const tr = useAdminTranslation();
  const [viewers, setViewers] = useState<{ id: number; email: string; access_role: 'viewer' | 'admin' }[]>([]);
  const [email, setEmail] = useState("");
  const [accessRole, setAccessRole] = useState<'viewer' | 'admin'>('viewer');
  const [saving, setSaving] = useState(false);
  const load = () =>
    cleanfixApi
      .listViewers()
      .then(setViewers)
      .catch(() => toast.error(tr("Viewer access list could not be loaded.")));
  useEffect(() => {
    load();
  }, []);
  const add = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error(tr("Please enter a complete email address."));
      return;
    }
    setSaving(true);
    try {
      await cleanfixApi.addViewer(email.trim(), accessRole);
      setEmail("");
      await load();
      toast.success(accessRole === 'admin' ? tr("Administrator access added. They can sign in with Google.") : tr("Viewer access added. They can sign in with Google."));
    } catch {
      toast.error(tr("Viewer access was not added."));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (viewer: { id: number; email: string; access_role: 'viewer' | 'admin' }) => {
    try {
      await cleanfixApi.removeViewer(viewer.id);
      setViewers((current) => current.filter((item) => item.id !== viewer.id));
      toast.success(`${viewer.email} no longer has ${viewer.access_role} dashboard access.`);
    } catch {
      toast.error(tr("Viewer access was not removed."));
    }
  };
  return (
    <>
      <SectionTitle
        eyebrow="Company headquarters"
        title="Settings & system"
        description="Verified platform status and the rules that protect your business."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Dashboard access"
          subtitle="Approve verified email addresses as administrators or read-only viewers"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && add()}
              placeholder="friend@example.com"
              dir="ltr"
              className="bg-white"
            />
            <Select value={accessRole} onValueChange={(value: 'viewer' | 'admin') => setAccessRole(value)}>
              <SelectTrigger className="bg-white sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="viewer">{tr("Viewer")}</SelectItem><SelectItem value="admin">{tr("Administrator")}</SelectItem></SelectContent>
            </Select>
            <Button
              onClick={add}
              disabled={saving}
              className="shrink-0 bg-[#174E57]"
            >
              <Plus className="mr-2 h-4 w-4" />
              {saving ? tr("Adding…") : tr("Approve access")}
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#786F65]">
            {tr("Google verifies the email. The server assigns the approved role and automatically opens the correct dashboard after sign-in.")}
          </p>
          <div className="mt-4 divide-y divide-[#E5DDD3]">
            {viewers.map((viewer) => (
              <div key={viewer.id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DDE9E7]">
                  <Users className="h-4 w-4 text-[#174E57]" />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm" dir="ltr">
                  {viewer.email}
                </span>
                <Badge variant="outline">{viewer.access_role === 'admin' ? tr("Administrator") : tr("Viewer")}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(viewer)}
                  className="text-[#8A4639]"
                >
                  {tr("Remove")}
                </Button>
              </div>
            ))}
            {!viewers.length && (
              <EmptyState text="No dashboard viewers have been added here yet." />
            )}
          </div>
        </Panel>
        <Panel title="System status" subtitle="Current verified state">
          <Connection name="Railway application" state="Connected" />
          <Connection name="Google sign-in" state="Connected" />
          <Connection name="PostgreSQL database" state="Connected" />
          <Connection name="Production DNS" state="Connected" />
        </Panel>
        <Panel
          title="Operating principles"
          subtitle="Applied before every change"
        >
          <div className="space-y-3">
            {[
              "Simplicity before complexity",
              "Trust before growth hacks",
              "Preserve existing work",
              "One source of truth",
              "No infrastructure change without approval",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-4 w-4 text-[#174E57]" />
                {tr(item)}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Panel({
  title: heading,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const tr = useAdminTranslation();
  return (
    <Card className="border-[#D8D0C6] bg-[#FBF8F3]">
      <CardHeader className="pb-2">
        <CardTitle className="font-sans text-base font-semibold text-[#173F46]">
          {tr(heading)}
        </CardTitle>
        <p className="text-xs text-[#786F65]">{tr(subtitle)}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
function EmptyState({ text }: { text: string }) {
  const tr = useAdminTranslation();
  return <div className="py-8 text-center text-sm text-[#786F65]">{tr(text)}</div>;
}
function Info({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  const tr = useAdminTranslation();
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8177]">
        {tr(label)}
      </p>
      <p
        className="mt-1 break-words text-sm font-medium text-[#324346]"
        dir={ltr ? "ltr" : "auto"}
      >
        {value}
      </p>
    </div>
  );
}
function Checklist({ items }: { items: string[] }) {
  const tr = useAdminTranslation();
  const [done, setDone] = useState<number[]>([]);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <button
          key={item}
          onClick={() =>
            setDone((current) =>
              current.includes(i)
                ? current.filter((x) => x !== i)
                : [...current, i],
            )
          }
          className="flex w-full items-center gap-3 rounded-xl border border-[#E0D7CC] bg-white p-3 text-start text-sm"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border ${done.includes(i) ? "border-[#174E57] bg-[#174E57] text-white" : "border-[#CFC5B9]"}`}
          >
            {done.includes(i) && <Check className="h-3 w-3" />}
          </span>
          <span
            className={done.includes(i) ? "text-[#8A8177] line-through" : ""}
          >
            {tr(item)}
          </span>
        </button>
      ))}
    </div>
  );
}
function Connection({ name, state }: { name: string; state: string }) {
  const tr = useAdminTranslation();
  const ready = ["Connected", "Available", "Via GitHub"].includes(state);
  return (
    <div className="flex items-center justify-between border-b border-[#E5DDD3] py-3 last:border-0">
      <span className="text-sm">{tr(name)}</span>
      <Badge
        className={
          ready ? "bg-[#DCEADF] text-[#2E6840]" : "bg-[#EEE4D4] text-[#765D38]"
        }
      >
        {tr(state)}
      </Badge>
    </div>
  );
}
function title(value: string) {
  return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
function normalizeStatus(value: string): LeadStatus {
  const map: Record<string, LeadStatus> = {
    booked: "scheduled",
    lost: "cancelled",
    follow_up: "follow-up",
    in_progress: "in progress",
  };
  const normalized = map[value] || value;
  return pipeline.includes(normalized as LeadStatus)
    ? (normalized as LeadStatus)
    : "new";
}
