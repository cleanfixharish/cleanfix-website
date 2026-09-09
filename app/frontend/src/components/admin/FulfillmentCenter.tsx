import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CalendarClock, CheckCircle2, HardHat, MapPin, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cleanfixApi } from '@/lib/cleanfixApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PilotReadinessCenter from '@/components/admin/PilotReadinessCenter';

type Booking = { id: number; quote_id: number; lead_id?: number; status: string; scope_snapshot: string; version: number };
type Lead = { id: number; customer_name: string; service_requested?: string; area?: string };
type Job = { id: number; booking_id?: number; title: string; status: string; service_key?: string; service_area?: string; scheduled_for?: string; confirmed_window_end?: string; managed_provider_profile_id?: number; version: number };
type Relationship = { id: number; user_id: string; relationship_type: string; status: string };
type CapabilityDecision = { id: number; service_key: string; status: string; evidence_reference: string; evidence_hash: string; effective_at: string; expires_at: string; supersedes_id?: number; task_definition_hash: string };
type Profile = { id: number; relationship_id: number; display_name: string; operational_status: string; availability_status: string; version: number; capability_decisions?: CapabilityDecision[] };
type Offer = { id: number; job_id: number; provider_profile_id: number; status: string; version: number };
type ServiceLocation = { booking_id: number; exact_address: string; access_instructions?: string; version: number };

const CAPABILITY_TASK_TEXT: Record<string, string> = {
  mounting_under_5kg: 'Mount one customer-supplied interior item ≤5 kg using an existing verified fixing only.',
  flat_pack_under_25kg: 'Assemble one customer-supplied flat-pack component ≤25 kg from manufacturer instructions.',
  cabinet_hardware: 'Replace or adjust one specified customer-supplied cabinet or drawer hardware item.',
};
const CAPABILITY_CHECK_TEXT: Record<string, string> = {
  supervised_trial_passed: 'I observed a supervised trial and it passed for this exact task.',
  canonical_scope_followed: 'The provider followed the allowed scope and all prohibited-work boundaries.',
  offer_pin_evidence_drill_passed: 'Offer, PIN, private-evidence and identity workflow drill passed.',
  unsafe_stop_drill_passed: 'Unsafe-work stop and escalation drill passed.',
  completion_scope_change_drill_passed: 'Completion and scope-change handling drill passed.',
  no_unresolved_conditions: 'No unresolved condition, incident or hold remains.',
};

function stableKey(scope: string) {
  const storageKey = `cleanfix.fulfillment.command.${scope}`;
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(storageKey, created);
  return created;
}

function issue(error: unknown, he: boolean) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (error.response?.status === 503) return he ? 'מערכת השיבוץ עדיין כבויה בשרת.' : 'Fulfillment is still disabled on the server.';
  }
  return he ? 'הפעולה לא הושלמה.' : 'The action could not be completed.';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0 space-y-1.5"><Label>{label}</Label>{children}</div>;
}

export default function FulfillmentCenter() {
  const { lang } = useLanguage();
  const he = lang === 'he';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [knownProfiles, setKnownProfiles] = useState<Profile[]>([]);
  const [knownOffers, setKnownOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [bookingId, setBookingId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [serviceKey, setServiceKey] = useState('');
  const [capabilityServiceKey, setCapabilityServiceKey] = useState('');
  const serviceArea = 'harish';
  const [classificationLeadId, setClassificationLeadId] = useState('');
  const [classificationWeight, setClassificationWeight] = useState('');
  const [classificationReason, setClassificationReason] = useState('');
  const [classificationChecks, setClassificationChecks] = useState<string[]>([]);
  const [capabilityEvidenceReference, setCapabilityEvidenceReference] = useState('');
  const [capabilityEvidenceHash, setCapabilityEvidenceHash] = useState('');
  const [capabilityAssessor, setCapabilityAssessor] = useState('');
  const [capabilityAssessorRole, setCapabilityAssessorRole] = useState('owner_supervisor');
  const [capabilityAssessedAt, setCapabilityAssessedAt] = useState('');
  const [capabilityEffectiveAt, setCapabilityEffectiveAt] = useState('');
  const [capabilityExpiresAt, setCapabilityExpiresAt] = useState('');
  const [capabilityReviewTrigger, setCapabilityReviewTrigger] = useState('');
  const [capabilityReason, setCapabilityReason] = useState('');
  const [capabilityStopReason, setCapabilityStopReason] = useState('');
  const [capabilityChecks, setCapabilityChecks] = useState<string[]>([]);
  const [capabilityCommandKey, setCapabilityCommandKey] = useState(() => crypto.randomUUID());
  const [capabilityStopStatus, setCapabilityStopStatus] = useState('suspended');

  const [relationshipId, setRelationshipId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profileId, setProfileId] = useState('');
  const [profileVersion, setProfileVersion] = useState('1');
  const [requirement, setRequirement] = useState('identity_check');
  const [vettingExpiry, setVettingExpiry] = useState('');
  const [vettingEffective, setVettingEffective] = useState('');
  const [vettingEvidenceReference, setVettingEvidenceReference] = useState('');
  const [vettingEvidenceHash, setVettingEvidenceHash] = useState('');
  const [vettingReviewTrigger, setVettingReviewTrigger] = useState('');

  const [jobId, setJobId] = useState('');
  const [payout, setPayout] = useState('');
  const [deadline, setDeadline] = useState('');
  const [offerId, setOfferId] = useState('');
  const [locationBookingId, setLocationBookingId] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [locationVersion, setLocationVersion] = useState(0);
  const [locationCommandKey, setLocationCommandKey] = useState(() => crypto.randomUUID());

  const load = async () => {
    setLoading(true);
    try {
      const [bookingRows, jobRows, relationshipRows, leadRows] = await Promise.all([
        cleanfixApi.listBookings(), cleanfixApi.listJobs(), cleanfixApi.listBusinessRelationships(), cleanfixApi.listLeads(),
      ]);
      setBookings(bookingRows as Booking[]);
      setLeads(((leadRows as { items?: Lead[] }).items || []) as Lead[]);
      setJobs(((jobRows as { items?: Job[] }).items || []) as Job[]);
      setRelationships((relationshipRows as Relationship[]).filter((item) => item.relationship_type === 'managed_provider'));
      const [profileResult, offerResult] = await Promise.allSettled([
        cleanfixApi.listManagedProviders(), cleanfixApi.listAssignmentOffers(),
      ]);
      if (profileResult.status === 'fulfilled') setKnownProfiles(profileResult.value as Profile[]);
      if (offerResult.status === 'fulfilled') setKnownOffers(offerResult.value as Offer[]);
      if ([profileResult, offerResult].some((item) => item.status === 'rejected' && axios.isAxiosError(item.reason) && item.reason.response?.status === 503)) setDisabled(true);
    } catch (error) {
      toast.error(issue(error, he));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBooking = bookings.find((item) => String(item.id) === bookingId);
  const selectedJob = jobs.find((item) => String(item.id) === jobId);
  const eligibleBookings = bookings.filter((item) => item.status === 'awaiting_schedule');
  const offerableJobs = jobs.filter((item) => item.booking_id && item.status === 'unassigned');
  const confirmableJobs = jobs.filter((item) => item.booking_id && item.status === 'assigned');
  const acceptedOffers = knownOffers.filter((item) => item.status === 'accepted' && (!jobId || String(item.job_id) === jobId));
  const activeRelationships = relationships.filter((item) => item.status === 'active');

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); }
    catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 503) setDisabled(true);
      toast.error(issue(error, he));
    } finally { setBusy(false); }
  };

  const confirmSchedule = () => run(async () => {
    if (!selectedBooking || !start || !end || !serviceKey.trim() || !serviceArea.trim()) throw new Error('missing fields');
    await cleanfixApi.confirmBookingSchedule(selectedBooking.id, {
      window_start: new Date(start).toISOString(), window_end: new Date(end).toISOString(),
      timezone: 'Asia/Jerusalem',
      expected_version: selectedBooking.version,
    }, stableKey(`booking-${selectedBooking.id}-v${selectedBooking.version}-${start}-${end}`));
    toast.success(he ? 'המועד אושר ונוצרה עבודה לא משובצת.' : 'Schedule confirmed and one unassigned job created.');
    await load();
  });

  const taskChecks: Record<string, string[]> = {
    mounting_under_5kg: ['customer_supplied_item', 'feet_on_floor', 'dry_interior_location', 'non_utility_zone', 'existing_verified_fixing', 'no_wall_penetration', 'no_powered_drilling', 'no_new_anchors'],
    flat_pack_under_25kg: ['customer_supplied_components', 'manufacturer_instructions_available', 'no_structural_anchor', 'no_utilities', 'no_structural_alteration', 'no_two_person_lift'],
    cabinet_hardware: ['specific_hardware_only', 'no_locks_security_doors_windows_glazing', 'no_utilities'],
  };
  const classifyTask = () => run(async () => {
    if (!classificationLeadId || !serviceKey || classificationReason.trim().length < 10) throw new Error('missing fields');
    await cleanfixApi.createPilotTaskClassification({
      lead_id: Number(classificationLeadId), task_key: serviceKey,
      measured_weight_kg: classificationWeight ? Number(classificationWeight) : null,
      safety_confirmations: classificationChecks, reason: classificationReason.trim(),
    });
    toast.success(he ? 'סיווג המשימה נשמר כרשומה בלתי ניתנת לשינוי.' : 'Task classification saved as an immutable record.');
  });

  const createProfile = () => run(async () => {
    const created = await cleanfixApi.createManagedProvider({ relationship_id: Number(relationshipId), display_name: displayName.trim(), availability_status: 'available' }) as Profile;
    setKnownProfiles((current) => [...current.filter((item) => item.id !== created.id), created]);
    setProfileId(String(created.id)); setProfileVersion(String(created.version));
    toast.success(he ? `פרופיל #${created.id} נוצר כטיוטה.` : `Provider profile #${created.id} created as a draft.`);
  });

  const addCapability = () => run(async () => {
    const currentDecision = knownProfiles.find((item) => String(item.id) === profileId)?.capability_decisions?.find((item) => item.service_key === capabilityServiceKey);
    await cleanfixApi.addProviderCapabilityDecision(Number(profileId), {
      service_key: capabilityServiceKey, status: 'eligible_supervised', assessment_method: 'supervised_trial', assessment_result: 'passed',
      evidence_reference: capabilityEvidenceReference.trim(), evidence_hash: capabilityEvidenceHash.trim().toLowerCase(),
      assessor_name: capabilityAssessor.trim(), assessor_role: capabilityAssessorRole,
      assessed_at: new Date(capabilityAssessedAt).toISOString(), effective_at: new Date(capabilityEffectiveAt).toISOString(),
      expires_at: new Date(capabilityExpiresAt).toISOString(), review_trigger: capabilityReviewTrigger.trim(),
      conditions_open: false, supervision_only: true, safety_acknowledgements: capabilityChecks,
      decision_reason: capabilityReason.trim(), supersedes_id: currentDecision?.id || null,
    }, capabilityCommandKey);
    setCapabilityCommandKey(crypto.randomUUID());
    toast.success(he ? 'כשירות מפוקחת ומתועדת נרשמה.' : 'Evidence-backed supervised eligibility recorded.');
    await load();
  });

  const stopCapability = () => run(async () => {
    const currentDecision = knownProfiles.find((item) => String(item.id) === profileId)?.capability_decisions?.find((item) => item.service_key === capabilityServiceKey);
    if (!currentDecision) throw new Error('missing current decision');
    await cleanfixApi.stopProviderCapabilityDecision(Number(profileId), {
      status: capabilityStopStatus, service_key: capabilityServiceKey, supersedes_id: currentDecision.id,
      decision_reason: capabilityStopReason.trim(),
    }, capabilityCommandKey);
    setCapabilityCommandKey(crypto.randomUUID());
    setCapabilityStopReason('');
    toast.success(he ? 'הכשירות נעצרה מיד ונשמרה בהיסטוריה.' : 'Capability stopped immediately and retained in history.');
    await load();
  });

  const addVetting = () => run(async () => {
    const reviewerRoles: Record<string, string> = { identity_check: 'identity_verifier', provider_agreement: 'contract_reviewer', invoice_capability: 'accountant', insurance: 'insurance_broker' };
    await cleanfixApi.addProviderVetting(Number(profileId), {
      requirement_key: requirement, status: 'approved', expires_at: vettingExpiry ? new Date(vettingExpiry).toISOString() : null,
      effective_at: new Date(vettingEffective).toISOString(), reviewer_role: reviewerRoles[requirement],
      evidence_reference: vettingEvidenceReference.trim(), evidence_hash: vettingEvidenceHash.trim().toLowerCase(),
      review_trigger: vettingReviewTrigger.trim(), conditions_open: false,
    });
    toast.success(he ? 'בדיקת החובה נשמרה כמאושרת.' : 'Required vetting item recorded as approved.');
  });

  const activate = () => run(async () => {
    const updated = await cleanfixApi.activateManagedProvider(Number(profileId), Number(profileVersion)) as Profile;
    setProfileVersion(String(updated.version));
    toast.success(he ? 'בעל המקצוע פעיל לשיבוץ בכפוף לבדיקות בכל עבודה.' : 'Provider activated; eligibility will still be checked for every job.');
  });

  const createOffer = () => run(async () => {
    if (!selectedJob || !deadline) throw new Error('missing fields');
    const created = await cleanfixApi.createAssignmentOffer(selectedJob.id, {
      provider_profile_id: Number(profileId), provider_payout: Number(payout),
      response_deadline: new Date(deadline).toISOString(), expected_job_version: selectedJob.version,
    }, stableKey(`offer-job-${selectedJob.id}-v${selectedJob.version}-provider-${profileId}-payout-${payout}-deadline-${deadline}`)) as Offer;
    setKnownOffers((current) => [...current.filter((item) => item.id !== created.id), created]);
    setOfferId(String(created.id));
    toast.success(he ? `הצעה #${created.id} נשלחה לבעל המקצוע.` : `Offer #${created.id} sent to the provider.`);
  });

  const assignedJob = useMemo(() => confirmableJobs.find((item) => String(item.id) === jobId), [confirmableJobs, jobId]);
  const selectedOffer = useMemo(() => knownOffers.find((item) => String(item.id) === offerId), [knownOffers, offerId]);
  const confirmAssignment = () => run(async () => {
    if (!assignedJob || !selectedOffer || selectedOffer.job_id !== assignedJob.id) throw new Error('missing assignment');
    await cleanfixApi.confirmAssignment(Number(offerId), {
      expected_offer_version: selectedOffer.version, expected_job_version: assignedJob.version,
    }, stableKey(`confirm-offer-${offerId}-job-v${assignedJob.version}`));
    toast.success(he ? 'השיבוץ אושר. בעל המקצוע יכול להתחיל במסע השטח.' : 'Assignment confirmed. The provider can begin the field journey.');
    await load();
  });

  const loadLocation = () => run(async () => {
    const location = await cleanfixApi.getOwnerServiceLocation(Number(locationBookingId)) as ServiceLocation;
    setExactAddress(location.exact_address);
    setAccessInstructions(location.access_instructions || '');
    setLocationVersion(location.version);
  });

  const saveLocation = () => run(async () => {
    const location = await cleanfixApi.setServiceLocation(Number(locationBookingId), {
      exact_address: exactAddress.trim(), access_instructions: accessInstructions.trim() || null,
      expected_version: locationVersion,
    }, locationCommandKey) as ServiceLocation;
    setLocationVersion(location.version);
    setLocationCommandKey(crypto.randomUUID());
    toast.success(he ? 'המיקום המדויק נשמר באופן מוצפן.' : 'Exact service location saved encrypted.');
  });

  return <div className="space-y-5">
    <PilotReadinessCenter />
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9A7548]">{he ? 'ביצוע מבוקר' : 'Controlled fulfillment'}</p><h1 className="mt-1 text-2xl font-semibold text-[#173F46]">{he ? 'מהזמנה מאושרת ועד תחילת עבודה' : 'From accepted booking to work start'}</h1><p className="mt-2 max-w-3xl text-sm text-[#6f6a62]">{he ? 'רק נתונים אמיתיים מהשרת. סיום, תיעוד ותשלום עדיין אינם זמינים.' : 'Real server records only. Completion, evidence, and payment controls are not available yet.'}</p></div>
      <Button variant="outline" onClick={() => void load()} disabled={loading || busy}><RefreshCw className="me-2 h-4 w-4" />{he ? 'רענון' : 'Refresh'}</Button>
    </div>
    {disabled && <Card className="border-amber-300 bg-amber-50" aria-live="polite"><CardContent className="flex gap-3 p-4 text-sm text-amber-900"><ShieldCheck className="h-5 w-5 shrink-0" /><span>{he ? 'בקרות הביצוע עדיין כבויות בשרת. שינויים, תזמון ושיבוץ חסומים עד להשלמת האישורים.' : 'Fulfillment controls are disabled on the server. Setup changes, scheduling, and dispatch remain blocked until approvals are complete.'}</span></CardContent></Card>}

    <Card><CardHeader><CardTitle>{he ? '0. סיווג משימה מבוקר' : '0. Owner-reviewed task classification'}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-[#6f6a62]">{he ? 'הבקשה המקורית נשמרת. כאן בוחרים רק משימה צרה ומדידה שמותרת בפיילוט.' : 'The original customer request is preserved. Classify it before publishing any acceptance-capable quote.'}</p><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label={he ? 'בקשת לקוח מקורית' : 'Original customer request'}><Select value={classificationLeadId} onValueChange={setClassificationLeadId}><SelectTrigger><SelectValue placeholder="Select customer request" /></SelectTrigger><SelectContent>{leads.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · {item.customer_name} · {(item.service_requested || 'Unspecified').slice(0, 45)}</SelectItem>)}</SelectContent></Select></Field><Field label={he ? 'משימת פיילוט' : 'Pilot task'}><Select value={serviceKey} onValueChange={(value) => { setServiceKey(value); setClassificationChecks([]); }}><SelectTrigger><SelectValue placeholder="Select exact task" /></SelectTrigger><SelectContent><SelectItem value="mounting_under_5kg">Customer-supplied mounting item ≤5kg</SelectItem><SelectItem value="flat_pack_under_25kg">Flat-pack component ≤25kg</SelectItem><SelectItem value="cabinet_hardware">Specific cabinet/drawer hardware</SelectItem></SelectContent></Select></Field><Field label={he ? 'משקל נמדד בק״ג' : 'Measured weight kg'}><Input type="number" min="0" max="25" step="0.1" value={classificationWeight} onChange={(e) => setClassificationWeight(e.target.value)} /></Field><Field label={he ? 'סיבת הסיווג' : 'Classification reason'}><Input value={classificationReason} onChange={(e) => setClassificationReason(e.target.value)} placeholder="What was checked and why it fits" /></Field></div><div className="flex flex-wrap gap-3">{(taskChecks[serviceKey] || []).map((check) => <label key={check} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"><input type="checkbox" checked={classificationChecks.includes(check)} onChange={(e) => setClassificationChecks((current) => e.target.checked ? [...current, check] : current.filter((item) => item !== check))} />{check.replace(/_/g, ' ')}</label>)}</div><Button variant="outline" disabled={busy || disabled || !classificationLeadId || !serviceKey || classificationChecks.length !== (taskChecks[serviceKey] || []).length || classificationReason.trim().length < 10} onClick={classifyTask}>{he ? 'שמירת סיווג בלתי ניתן לשינוי' : 'Record immutable classification'}</Button></CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" />{he ? '1. אישור חלון הזמנה' : '1. Confirm booking window'}</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Field label={he ? 'הזמנה שממתינה למועד' : 'Awaiting-schedule booking'}><Select value={bookingId} onValueChange={setBookingId}><SelectTrigger><SelectValue placeholder={loading ? '…' : (he ? 'בחירת הזמנה' : 'Select booking')} /></SelectTrigger><SelectContent>{eligibleBookings.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · {item.scope_snapshot.slice(0, 70)}</SelectItem>)}</SelectContent></Select></Field>
      <Field label={he ? 'תחילת החלון' : 'Window start'}><Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} /></Field>
      <Field label={he ? 'סיום החלון' : 'Window end'}><Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} /></Field>
      <div className="flex items-end"><Button className="w-full bg-[#174E57]" disabled={busy || disabled || !selectedBooking} onClick={confirmSchedule}>{he ? 'אישור מועד ויצירת עבודה' : 'Confirm and create job'}</Button></div>
      {!eligibleBookings.length && !loading && <p className="text-sm text-[#6f6a62]">{he ? 'אין הזמנות שממתינות לאישור מועד.' : 'No bookings are waiting for schedule confirmation.'}</p>}
    </CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />{he ? 'מיקום שירות פרטי' : 'Private service location'}</CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="text-sm text-[#6f6a62]">{he ? 'הכתובת והוראות הגישה מוצפנות ואינן מופיעות ברשימות. כל צפייה נרשמת.' : 'The address and access instructions are encrypted, excluded from listings, and every reveal is audited.'}</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label={he ? 'הזמנה' : 'Booking'}><Select value={locationBookingId} onValueChange={(value) => { setLocationBookingId(value); setExactAddress(''); setAccessInstructions(''); setLocationVersion(0); setLocationCommandKey(crypto.randomUUID()); }}><SelectTrigger><SelectValue placeholder={he ? 'בחירת הזמנה' : 'Select booking'} /></SelectTrigger><SelectContent>{bookings.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · {item.scope_snapshot.slice(0, 60)}</SelectItem>)}</SelectContent></Select></Field><Field label={he ? 'כתובת מדויקת' : 'Exact address'}><Input autoComplete="street-address" value={exactAddress} onChange={(event) => { setExactAddress(event.target.value); setLocationCommandKey(crypto.randomUUID()); }} /></Field><Field label={he ? 'הוראות גישה' : 'Access instructions'}><Input value={accessInstructions} onChange={(event) => { setAccessInstructions(event.target.value); setLocationCommandKey(crypto.randomUUID()); }} /></Field><div className="flex items-end gap-2"><Button variant="outline" disabled={busy || disabled || !locationBookingId} onClick={loadLocation}>{he ? 'טעינה' : 'Load'}</Button><Button disabled={busy || disabled || !locationBookingId || exactAddress.trim().length < 3} onClick={saveLocation}>{he ? 'שמירה מוצפנת' : 'Save encrypted'}</Button></div></div>
      <p className="text-xs text-[#736f68]">{he ? `גרסת מיקום: ${locationVersion}. יש לטעון לפני עדכון קיים.` : `Location version: ${locationVersion}. Load before updating an existing record.`}</p>
    </CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><HardHat className="h-5 w-5" />{he ? '2. כשירות בעל מקצוע' : '2. Provider eligibility'}</CardTitle></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3"><Field label={he ? 'קשר פעיל' : 'Active relationship'}><Select value={relationshipId} onValueChange={setRelationshipId}><SelectTrigger><SelectValue placeholder={he ? 'בחירת קשר' : 'Select relationship'} /></SelectTrigger><SelectContent>{activeRelationships.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · {item.user_id}</SelectItem>)}</SelectContent></Select></Field><Field label={he ? 'שם תצוגה' : 'Display name'}><Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></Field><div className="flex items-end"><Button variant="outline" className="w-full" disabled={busy || !relationshipId || !displayName.trim()} onClick={createProfile}>{he ? 'יצירת פרופיל טיוטה' : 'Create draft profile'}</Button></div></div>
      {!!knownProfiles.length && <div className="flex flex-wrap gap-2">{knownProfiles.map((item) => <Badge key={item.id} variant="outline">#{item.id} · {item.display_name} · {item.operational_status}</Badge>)}</div>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label={he ? 'פרופיל בעל מקצוע' : 'Provider profile'}><Select value={profileId} onValueChange={(value) => { const profile = knownProfiles.find((item) => String(item.id) === value); setProfileId(value); setProfileVersion(String(profile?.version || 1)); }}><SelectTrigger><SelectValue placeholder={he ? 'בחירת פרופיל' : 'Select profile'} /></SelectTrigger><SelectContent>{knownProfiles.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · {item.display_name}</SelectItem>)}</SelectContent></Select></Field><Field label={he ? 'משימה מדויקת' : 'Exact task'}><Select value={capabilityServiceKey} onValueChange={(value) => { setCapabilityServiceKey(value); setCapabilityChecks([]); setCapabilityCommandKey(crypto.randomUUID()); }}><SelectTrigger><SelectValue placeholder="Select approved task" /></SelectTrigger><SelectContent><SelectItem value="mounting_under_5kg">Mounting item ≤5kg</SelectItem><SelectItem value="flat_pack_under_25kg">Flat-pack component ≤25kg</SelectItem><SelectItem value="cabinet_hardware">Cabinet/drawer hardware</SelectItem></SelectContent></Select></Field><Field label={he ? 'אזור קבוע' : 'Fixed area'}><Input value="Harish" readOnly /></Field><Field label={he ? 'שם המעריך' : 'Assessor name'}><Input value={capabilityAssessor} onChange={(e) => { setCapabilityAssessor(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} placeholder="Owner or qualified supervisor" /></Field><Field label="Assessor role"><Select value={capabilityAssessorRole} onValueChange={(value) => { setCapabilityAssessorRole(value); setCapabilityCommandKey(crypto.randomUUID()); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="owner_supervisor">Owner supervisor</SelectItem><SelectItem value="qualified_supervisor">Qualified supervisor</SelectItem></SelectContent></Select></Field><Field label="Private assessment evidence ID"><Input value={capabilityEvidenceReference} onChange={(e) => { setCapabilityEvidenceReference(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} placeholder="CAPABILITY-2026-001" /></Field><Field label="Evidence SHA-256"><Input value={capabilityEvidenceHash} onChange={(e) => { setCapabilityEvidenceHash(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} placeholder="64 hexadecimal characters" dir="ltr" /></Field><Field label="Assessed at"><Input type="datetime-local" value={capabilityAssessedAt} onChange={(e) => { setCapabilityAssessedAt(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} /></Field><Field label="Effective at"><Input type="datetime-local" value={capabilityEffectiveAt} onChange={(e) => { setCapabilityEffectiveAt(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} /></Field><Field label="Review / expiry"><Input type="datetime-local" value={capabilityExpiresAt} onChange={(e) => { setCapabilityExpiresAt(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} /></Field><Field label="Review trigger"><Input value={capabilityReviewTrigger} onChange={(e) => { setCapabilityReviewTrigger(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} placeholder="Scope, incident, expiry, or policy change" /></Field><Field label="Decision reason"><Input value={capabilityReason} onChange={(e) => { setCapabilityReason(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} placeholder="What was observed and why it passed" /></Field></div>
      {capabilityServiceKey && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Canonical supervised task</strong><p className="mt-1">{CAPABILITY_TASK_TEXT[capabilityServiceKey]}</p><p className="mt-1 text-xs">Always excluded: electrical, plumbing, gas, HVAC, structural, glazing, locks/security, wall penetration, powered drilling, new anchors, hazardous/licensed trades, extra tasks and two-person lifts. Owner onsite is mandatory.</p></div>}
      <div className="grid gap-3 md:grid-cols-2">{Object.keys(CAPABILITY_CHECK_TEXT).map((check) => <label key={check} className="flex items-start gap-2 rounded-md border bg-white px-3 py-2 text-sm"><input className="mt-1" type="checkbox" checked={capabilityChecks.includes(check)} onChange={(e) => { setCapabilityChecks((current) => e.target.checked ? [...current, check] : current.filter((item) => item !== check)); setCapabilityCommandKey(crypto.randomUUID()); }} /><span>{CAPABILITY_CHECK_TEXT[check]}</span></label>)}</div>
      <Button className="w-full" disabled={busy || !profileId || !capabilityServiceKey || !capabilityAssessor.trim() || !capabilityEvidenceReference.trim() || !/^[0-9a-fA-F]{64}$/.test(capabilityEvidenceHash) || !capabilityAssessedAt || !capabilityEffectiveAt || !capabilityExpiresAt || capabilityReviewTrigger.trim().length < 3 || capabilityReason.trim().length < 10 || capabilityChecks.length !== 6} onClick={addCapability}>{he ? 'רישום כשירות מפוקחת' : 'Record supervised eligibility'}</Button>
      {knownProfiles.find((item) => String(item.id) === profileId)?.capability_decisions?.filter((item) => !capabilityServiceKey || item.service_key === capabilityServiceKey).map((item) => <div key={item.id} className="rounded-lg border bg-white p-3 text-xs"><strong>Decision #{item.id} · {item.status}</strong><p>{item.service_key} · expires {new Date(item.expires_at).toLocaleString()}</p><p className="break-all">Task definition: {item.task_definition_hash}</p></div>)}
      <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]"><Select value={capabilityStopStatus} onValueChange={setCapabilityStopStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="suspended">Suspend immediately</SelectItem><SelectItem value="rejected">Reject</SelectItem><SelectItem value="expired">Mark expired</SelectItem></SelectContent></Select><Input value={capabilityStopReason} onChange={(e) => { setCapabilityStopReason(e.target.value); setCapabilityCommandKey(crypto.randomUUID()); }} placeholder="Required: why this provider must stop now" /><Button variant="destructive" disabled={busy || !profileId || !capabilityServiceKey || !knownProfiles.find((item) => String(item.id) === profileId)?.capability_decisions?.some((item) => item.service_key === capabilityServiceKey) || capabilityStopReason.trim().length < 10} onClick={stopCapability}>{he ? 'עצירה ושמירת היסטוריה' : 'Stop and retain history'}</Button></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label={he ? 'בדיקת חובה' : 'Required vetting'}><Select value={requirement} onValueChange={setRequirement}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['identity_check','provider_agreement','invoice_capability','insurance'].map((key) => <SelectItem key={key} value={key}>{key.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></Field><Field label={he ? 'תחולה' : 'Effective date'}><Input type="datetime-local" value={vettingEffective} onChange={(event) => setVettingEffective(event.target.value)} /></Field><Field label={he ? 'תוקף, אם קיים' : 'Expiry, if applicable'}><Input type="datetime-local" value={vettingExpiry} onChange={(event) => setVettingExpiry(event.target.value)} /></Field><Field label={he ? 'מזהה ראיה פרטית' : 'Private evidence record ID'}><Input value={vettingEvidenceReference} onChange={(event) => setVettingEvidenceReference(event.target.value)} placeholder="PROVIDER-2026-001" /></Field><Field label="Evidence SHA-256"><Input value={vettingEvidenceHash} onChange={(event) => setVettingEvidenceHash(event.target.value)} placeholder="64 hexadecimal characters" dir="ltr" /></Field><Field label={he ? 'גורם לבדיקה מחדש' : 'Review trigger'}><Input value={vettingReviewTrigger} onChange={(event) => setVettingReviewTrigger(event.target.value)} placeholder="Expiry, scope or document change" /></Field><div className="flex items-end"><Button variant="outline" className="w-full" disabled={busy || !profileId || !vettingEffective || !vettingEvidenceReference.trim() || !/^[0-9a-fA-F]{64}$/.test(vettingEvidenceHash) || vettingReviewTrigger.trim().length < 3} onClick={addVetting}>{he ? 'שמירת בדיקה מאושרת' : 'Record evidence-backed vetting'}</Button></div></div>
      <Button disabled={busy || !profileId} onClick={activate}><CheckCircle2 className="me-2 h-4 w-4" />{he ? 'הפעלת בעל מקצוע לאחר ארבע הבדיקות' : 'Activate after all four checks'}</Button>
    </CardContent></Card>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" />{he ? '3. הצעה ושיבוץ' : '3. Offer and assignment'}</CardTitle></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label={he ? 'עבודה לא משובצת' : 'Unassigned job'}><Select value={jobId} onValueChange={setJobId}><SelectTrigger><SelectValue placeholder={he ? 'בחירת עבודה' : 'Select job'} /></SelectTrigger><SelectContent>{offerableJobs.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · {item.title} · {item.service_area}</SelectItem>)}</SelectContent></Select></Field><Field label={he ? 'תשלום מוסכם לבעל המקצוע ₪' : 'Agreed provider payout ₪'}><Input type="number" min="0" value={payout} onChange={(event) => setPayout(event.target.value)} /></Field><Field label={he ? 'מועד אחרון לתשובה' : 'Response deadline'}><Input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></Field><div className="flex items-end"><Button className="w-full bg-[#174E57]" disabled={busy || disabled || !selectedJob || !profileId || !payout || !deadline} onClick={createOffer}>{he ? 'שליחת הצעה אחת' : 'Send one offer'}</Button></div></div>
      {!!knownOffers.length && <div className="flex flex-wrap gap-2">{knownOffers.map((item) => <Badge key={item.id} variant="outline">{he ? 'הצעה' : 'Offer'} #{item.id} · {item.status}</Badge>)}</div>}
      <div className="border-t pt-5"><p className="mb-3 text-sm font-semibold text-[#173F46]">{he ? 'אישור בעלים לאחר שהספק קיבל' : 'Owner confirmation after provider acceptance'}</p><div className="grid gap-3 md:grid-cols-3"><Field label={he ? 'עבודה במצב assigned' : 'Assigned job'}><Select value={jobId} onValueChange={(value) => { setJobId(value); setOfferId(''); }}><SelectTrigger><SelectValue placeholder={he ? 'בחירת עבודה' : 'Select job'} /></SelectTrigger><SelectContent>{confirmableJobs.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · {item.title} · profile #{item.managed_provider_profile_id}</SelectItem>)}</SelectContent></Select></Field><Field label={he ? 'הצעה שהתקבלה' : 'Accepted offer'}><Select value={offerId} onValueChange={setOfferId}><SelectTrigger><SelectValue placeholder={he ? 'בחירת הצעה' : 'Select accepted offer'} /></SelectTrigger><SelectContent>{acceptedOffers.map((item) => <SelectItem key={item.id} value={String(item.id)}>#{item.id} · profile #{item.provider_profile_id}</SelectItem>)}</SelectContent></Select></Field><div className="flex items-end"><Button disabled={busy || disabled || !assignedJob || !selectedOffer} onClick={confirmAssignment}>{he ? 'אישור שיבוץ' : 'Confirm assignment'}</Button></div></div></div>
    </CardContent></Card>
  </div>;
}
