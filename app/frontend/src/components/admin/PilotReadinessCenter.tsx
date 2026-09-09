import { useEffect, useState } from 'react';
import { LockKeyhole, RefreshCw, Save, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cleanfixApi } from '@/lib/cleanfixApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PilotConfig = {
  scope_version: string; company_legal_name: string | null;
  company_registration_id_configured: boolean; entity_or_dealer_type: string | null;
  identifier_type: string | null; operating_area: string;
  timezone: string; operating_days: string[]; opening_time: string;
  closing_time: string; weekly_job_cap: number; max_managed_providers: number;
  owner_onsite_required: boolean; version: number;
};
type Gate = { gate_key: string; status: string; version: number; reviewer_name?: string; reviewer_role?: string; evidence_reference?: string; evidence_hash?: string; reviewed_at?: string; effective_at?: string; expires_at?: string; review_trigger?: string; conditions_open: boolean; is_current_valid: boolean };
type Readiness = { configuration: PilotConfig; gates: Gate[]; blockers: string[]; approved_gate_count: number; required_gate_count: number; paid_dispatch_ready: boolean };

export default function PilotReadinessCenter() {
  const { lang } = useLanguage();
  const he = lang === 'he';
  const [data, setData] = useState<Readiness | null>(null);
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [identifierType, setIdentifierType] = useState('');
  const [gateKey, setGateKey] = useState('');
  const [gateStatus, setGateStatus] = useState('not_started');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [evidenceHash, setEvidenceHash] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [effectiveAt, setEffectiveAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [reviewTrigger, setReviewTrigger] = useState('');
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const next = await cleanfixApi.getPilotReadiness() as Readiness;
      setData(next);
      setName(next.configuration.company_legal_name || '');
      setCompanyId('');
      setEntityType(next.configuration.entity_or_dealer_type || '');
      setIdentifierType(next.configuration.identifier_type || '');
    } catch {
      toast.error(he ? 'לא ניתן לטעון את מוכנות הפיילוט.' : 'Pilot readiness could not be loaded.');
    } finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!data) return;
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        expected_version: data.configuration.version,
        company_legal_name: name.trim() || null,
        entity_or_dealer_type: entityType || null,
        identifier_type: identifierType || null,
      };
      if (companyId.trim()) payload.company_registration_id = companyId.trim();
      await cleanfixApi.updatePilotConfiguration(payload);
      toast.success(he ? 'הגדרות הפיילוט נשמרו.' : 'Pilot configuration saved.');
      await load();
    } catch {
      toast.error(he ? 'ההגדרות לא נשמרו. בדקו את השדות ורעננו.' : 'Settings were not saved. Check the fields and refresh.');
    } finally { setBusy(false); }
  };

  const saveGate = async () => {
    const gate = data?.gates.find((item) => item.gate_key === gateKey);
    if (!gate) return;
    setBusy(true);
    try {
      await cleanfixApi.updatePilotGate(gateKey, {
        expected_version: gate.version, status: gateStatus,
        reviewer_name: reviewerName.trim() || null, reviewer_role: reviewerRole || null,
        evidence_reference: evidenceReference.trim() || null,
        evidence_hash: evidenceHash.trim().toLowerCase() || null,
        reviewed_at: reviewedAt ? new Date(reviewedAt).toISOString() : null,
        effective_at: effectiveAt ? new Date(effectiveAt).toISOString() : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        review_trigger: reviewTrigger.trim() || null, conditions_open: conditionsOpen,
      });
      toast.success(he ? 'החלטת השער נרשמה.' : 'Gate decision recorded.');
      await load();
    } catch {
      toast.error(he ? 'החלטת השער לא נשמרה. אישור דורש ראיות מלאות ומתאימות.' : 'Gate decision was not saved. Approval requires complete, discipline-matched evidence.');
    } finally { setBusy(false); }
  };
  const chooseGate = (key: string) => {
    setGateKey(key);
    const gate = data?.gates.find((item) => item.gate_key === key);
    setGateStatus(gate?.status || 'not_started');
    setReviewerName(gate?.reviewer_name || ''); setReviewerRole(gate?.reviewer_role || '');
    setEvidenceReference(gate?.evidence_reference || ''); setEvidenceHash(gate?.evidence_hash || '');
    // datetime-local has no timezone. Re-entry is safer than silently shifting
    // an existing professional decision when the owner saves from Jerusalem.
    setReviewedAt(''); setEffectiveAt(''); setExpiresAt('');
    setReviewTrigger(gate?.review_trigger || '');
    setConditionsOpen(Boolean(gate?.conditions_open));
  };

  return <div className="space-y-4">
    <Card className="border-red-300 bg-red-50">
      <CardContent className="flex gap-3 p-4 text-sm text-red-900">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <div><strong>{he ? 'אין אישור להפעלת עבודות בתשלום' : 'NO-GO for paid dispatch'}</strong><p className="mt-1">{he ? 'לפני הפעלה מותרות רק קליטה, מיון, איסוף מידע חסר והערכות לא מחייבות. אין קבלה, הזמנה, תשלום, תזמון, חשיפת כתובת, שיבוץ או שיגור.' : 'Before activation: intake, triage, missing-information collection and non-binding estimates only; no acceptance, booking, payment, schedule, address release, assignment or dispatch.'}</p></div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3"><div><CardTitle>{he ? 'מרכז מוכנות הפיילוט' : 'Pilot Readiness Center'}</CardTitle><p className="mt-1 text-sm text-[#6f6a62]">{data?.configuration.scope_version || 'PILOT-HOME-VISIT-v1'} · {he ? 'חריש בלבד' : 'Harish only'}</p></div><Button variant="outline" size="sm" disabled={busy} onClick={() => void load()}><RefreshCw className="me-2 h-4 w-4" />{he ? 'רענון' : 'Refresh'}</Button></CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5"><Label>{he ? 'שם משפטי של העסק' : 'Company legal name'}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={he ? 'שם משפטי של העסק — חובה לפני הפעלה' : 'Company legal name — required before activation'} /><p className="text-xs text-[#786f65]">{he ? 'אפשר להשאיר לסקירה הסופית.' : 'May be completed during final review.'}</p></div>
          <div className="space-y-1.5"><Label>{he ? 'מספר רישום / עוסק' : 'Company ID'}</Label><Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} inputMode="numeric" autoComplete="off" placeholder={he ? 'מספר חברה — חובה לפני הפעלה' : 'Company ID — required before activation'} /><p className="flex items-center gap-1 text-xs text-[#786f65]"><LockKeyhole className="h-3.5 w-3.5" />{data?.configuration.company_registration_id_configured ? (he ? 'שמור באופן מוצפן; הזינו רק כדי להחליף.' : 'Encrypted and stored; enter only to replace.') : (he ? 'טרם נוסף. נשמר מוצפן ולעולם אינו מוחזר למסך.' : 'Not added. Stored encrypted and never returned to the screen.')}</p></div>
          <div className="space-y-1.5"><Label>{he ? 'סוג ישות / עוסק' : 'Entity or dealer type'}</Label><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={entityType} onChange={(e) => setEntityType(e.target.value)}><option value="">{he ? 'לבחירה בסקירה הסופית' : 'Choose during final review'}</option><option value="licensed_dealer">Licensed dealer</option><option value="exempt_dealer">Exempt dealer</option><option value="company">Company</option><option value="partnership">Partnership</option><option value="other">Other</option></select></div>
          <div className="space-y-1.5"><Label>{he ? 'סוג מזהה' : 'Identifier type'}</Label><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={identifierType} onChange={(e) => setIdentifierType(e.target.value)}><option value="">{he ? 'לבחירה בסקירה הסופית' : 'Choose during final review'}</option><option value="israeli_business_number">Israeli business number</option></select></div>
        </div>
        <div className="grid gap-2 rounded-xl border bg-[#fbfaf7] p-4 text-sm sm:grid-cols-2 lg:grid-cols-3"><span><strong>{he ? 'אזור:' : 'Area:'}</strong> {data?.configuration.operating_area || 'Harish'}</span><span><strong>{he ? 'שעות:' : 'Hours:'}</strong> Mon–Thu {data?.configuration.opening_time || '09:00'}–{data?.configuration.closing_time || '17:00'}</span><span><strong>{he ? 'קיבולת:' : 'Capacity:'}</strong> {data?.configuration.weekly_job_cap || 3} jobs/week</span><span><strong>{he ? 'בעלי מקצוע:' : 'Providers:'}</strong> max {data?.configuration.max_managed_providers || 2}</span><span><strong>{he ? 'נוכחות בעלים:' : 'Owner onsite:'}</strong> {data?.configuration.owner_onsite_required ? 'Required' : '—'}</span><span><strong>{he ? 'אזור זמן:' : 'Timezone:'}</strong> {data?.configuration.timezone || 'Asia/Jerusalem'}</span></div>
        <p className="text-xs text-[#786f65]">{he ? 'גבולות בטיחות אלה קבועים בגרסה v1. שינוי דורש גרסת היקף חדשה ואישורים חדשים.' : 'These v1 safety boundaries are fixed. Any change requires a new scope version and fresh approvals.'}</p>
        <Button onClick={() => void save()} disabled={busy || !data}><Save className="me-2 h-4 w-4" />{he ? 'שמירת פרטי זהות' : 'Save identity details'}</Button>
      </CardContent>
    </Card>
    {!!data?.blockers.length && <Card className="border-amber-300"><CardHeader><CardTitle>{he ? 'פעולות נדרשות לפני הפעלה' : 'Required before activation'}</CardTitle></CardHeader><CardContent><div className="space-y-2">{data.blockers.map((blocker) => {
      const owner = blocker.startsWith('gate_') ? (blocker.includes(':SYSTEM_') ? 'Engineering / verified CI' : 'External licensed professional') : blocker === 'eligible_managed_provider_missing' ? 'Operations' : blocker === 'runtime_dispatch_switch_off' ? 'Owner — final kill switch' : 'Owner';
      return <div key={blocker} className="rounded-lg border bg-white p-3"><p className="text-sm font-medium text-[#173f46]">{blocker.replace(/_/g, ' ')}</p><p className="mt-1 text-xs text-[#786f65]">Responsible: {owner}</p></div>;
    })}</div></CardContent></Card>}
    <Card><CardHeader><CardTitle>{he ? 'שערי שחרור' : 'Release gates'} <Badge variant="outline" className="ms-2">{data?.approved_gate_count || 0}/{data?.required_gate_count || 28}</Badge></CardTitle></CardHeader><CardContent className="space-y-5"><div className="grid gap-2 md:grid-cols-2">{(data?.gates || []).map((gate) => <div key={gate.gate_key} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3"><span className="text-sm">{gate.gate_key.replace(/_/g, ' ').toLowerCase()}</span><Badge variant={gate.is_current_valid ? 'default' : 'outline'}>{gate.status === 'approved' && !gate.is_current_valid ? 'approved · invalid/stale' : gate.status.replace(/_/g, ' ')}</Badge></div>)}</div>
      <div className="border-t pt-5"><h3 className="font-semibold text-[#173f46]">{he ? 'רישום החלטה מקצועית חיצונית' : 'Record an external professional decision'}</h3><p className="mt-1 text-xs text-[#786f65]">{he ? 'הבעלים מתעד החלטה; הוא אינו מעניק את האישור. שערים טכניים נרשמים רק על ידי אימות מערכת.' : 'The owner records a professional decision; the owner does not grant approval. Technical gates are recorded only by verified system evidence.'}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1.5"><Label>Gate</Label><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={gateKey} onChange={(e) => chooseGate(e.target.value)}><option value="">Select external gate</option>{(data?.gates || []).filter((gate) => !gate.gate_key.startsWith('SYSTEM_')).map((gate) => <option key={gate.gate_key} value={gate.gate_key}>{gate.gate_key}</option>)}</select></div>
        <div className="space-y-1.5"><Label>Status</Label><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={gateStatus} onChange={(e) => setGateStatus(e.target.value)}>{['not_started','packet_ready','submitted','questions_open','conditional','approved','rejected','expired','superseded'].map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}</select></div>
        <div className="space-y-1.5"><Label>Reviewer role</Label><select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={reviewerRole} onChange={(e) => setReviewerRole(e.target.value)}><option value="">Select discipline</option><option value="israeli_counsel">Israeli counsel</option><option value="israeli_accountant">Israeli accountant</option><option value="israeli_tax_adviser">Israeli tax adviser</option><option value="insurance_broker">Insurance broker</option><option value="insurance_adviser">Insurance adviser</option></select></div>
        <div className="space-y-1.5"><Label>Reviewer / firm reference</Label><Input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Professional or firm name" /></div>
        <div className="space-y-1.5"><Label>Private evidence record ID</Label><Input value={evidenceReference} onChange={(e) => setEvidenceReference(e.target.value)} placeholder="LEGAL-2026-001" /></div>
        <div className="space-y-1.5"><Label>Evidence SHA-256</Label><Input value={evidenceHash} onChange={(e) => setEvidenceHash(e.target.value)} placeholder="64 hexadecimal characters" dir="ltr" /></div>
        <div className="space-y-1.5"><Label>Decision date</Label><Input type="datetime-local" value={reviewedAt} onChange={(e) => setReviewedAt(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Effective date</Label><Input type="datetime-local" value={effectiveAt} onChange={(e) => setEffectiveAt(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Expiry / review date (optional)</Label><Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></div>
        <div className="space-y-1.5 xl:col-span-2"><Label>Review trigger</Label><Input value={reviewTrigger} onChange={(e) => setReviewTrigger(e.target.value)} placeholder="Review on scope, law, policy, or document change" /></div>
        <label className="flex items-center gap-2 self-end rounded-md border p-2.5 text-sm"><input type="checkbox" checked={conditionsOpen} onChange={(e) => setConditionsOpen(e.target.checked)} />Conditions remain open</label>
      </div><Button className="mt-4" variant="outline" disabled={busy || !gateKey} onClick={() => void saveGate()}>{he ? 'שמירת החלטה' : 'Record decision'}</Button></div>
    </CardContent></Card>
  </div>;
}
