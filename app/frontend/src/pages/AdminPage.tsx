import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Users, FileText, Building2, LayoutDashboard, LogIn, LogOut,
  Phone, MessageCircle, Clock, CheckCircle, XCircle, AlertCircle, Plus, Edit2,
} from 'lucide-react';
import { client } from '@/lib/api';

interface Lead {
  id: number;
  customer_name: string;
  phone: string;
  whatsapp: string;
  area: string;
  service_requested: string;
  description: string;
  source: string;
  status: string;
  assignment: string;
  assigned_partner_id: number | null;
  quote_status: string;
  booking_status: string;
  follow_up_status: string;
  follow_up_date: string;
  notes: string;
  outcome: string;
  priority: string;
  created_at: string;
}

interface Partner {
  id: number;
  name: string;
  business_type: string;
  description_en: string;
  description_he: string;
  phone: string;
  whatsapp: string;
  area: string;
  partner_type: string;
  is_active: boolean;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  booked: 'bg-green-100 text-green-800',
  completed: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
};

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const { user, loading: authLoading, login, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [leadsRes, partnersRes] = await Promise.all([
        client.entities.leads.query({ query: {}, sort: '-created_at', limit: 100 }),
        client.entities.partners.query({ query: {}, sort: 'sort_order', limit: 50 }),
      ]);
      setLeads(leadsRes.data?.items || []);
      setPartners(partnersRes.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const updateLead = async (leadId: number, data: Partial<Lead>) => {
    try {
      await client.entities.leads.update({ id: String(leadId), data });
      await fetchData();
      setSelectedLead(null);
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t.nav.admin}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {lang === 'en' ? 'Sign in to access the admin dashboard' : 'התחבר כדי לגשת ללוח הניהול'}
            </p>
            <Button onClick={login} className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              {lang === 'en' ? 'Sign In' : 'התחבר'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredLeads = filterStatus === 'all' ? leads : leads.filter((l) => l.status === filterStatus);
  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const bookedCount = leads.filter((l) => l.status === 'booked').length;
  const completedCount = leads.filter((l) => l.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="CleanFixHarish" className="w-7 h-7 rounded-full object-cover" />
            <span className="font-semibold text-sm">{t.nav.admin}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
              {lang === 'en' ? 'View Site' : 'צפה באתר'}
            </a>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{newLeadsCount}</p>
                  <p className="text-xs text-muted-foreground">{t.admin.newLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leads.length}</p>
                  <p className="text-xs text-muted-foreground">{t.admin.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bookedCount}</p>
                  <p className="text-xs text-muted-foreground">{t.admin.booked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">{t.admin.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="leads">
          <TabsList className="mb-4">
            <TabsTrigger value="leads" className="gap-1.5">
              <Users className="h-4 w-4" />
              {t.admin.leads}
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-1.5">
              <Building2 className="h-4 w-4" />
              {t.admin.partners}
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t.admin.leads}</CardTitle>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{lang === 'en' ? 'All' : 'הכל'}</SelectItem>
                      <SelectItem value="new">{lang === 'en' ? 'New' : 'חדש'}</SelectItem>
                      <SelectItem value="contacted">{lang === 'en' ? 'Contacted' : 'נוצר קשר'}</SelectItem>
                      <SelectItem value="quoted">{lang === 'en' ? 'Quoted' : 'הוצעה הצעה'}</SelectItem>
                      <SelectItem value="booked">{lang === 'en' ? 'Booked' : 'הוזמן'}</SelectItem>
                      <SelectItem value="completed">{lang === 'en' ? 'Completed' : 'הושלם'}</SelectItem>
                      <SelectItem value="lost">{lang === 'en' ? 'Lost' : 'אבד'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {lang === 'en' ? 'No leads found' : 'לא נמצאו לידים'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLeads.map((lead) => (
                      <Dialog key={lead.id}>
                        <DialogTrigger asChild>
                          <div
                            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedLead(lead);
                              setEditNotes(lead.notes || '');
                              setEditStatus(lead.status);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-sm">{lead.customer_name}</p>
                                <p className="text-xs text-muted-foreground">{lead.service_requested} • {lead.area || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                                {lead.status}
                              </Badge>
                              {lead.source && (
                                <span className="text-xs text-muted-foreground">{lead.source}</span>
                              )}
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{lead.customer_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">{lang === 'en' ? 'Phone' : 'טלפון'}</p>
                                <a href={`tel:${lead.phone}`} className="font-medium text-primary">{lead.phone}</a>
                              </div>
                              <div>
                                <p className="text-muted-foreground">WhatsApp</p>
                                <a href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium text-[#25D366]">
                                  {lead.whatsapp || lead.phone}
                                </a>
                              </div>
                              <div>
                                <p className="text-muted-foreground">{lang === 'en' ? 'Service' : 'שירות'}</p>
                                <p className="font-medium">{lead.service_requested}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">{lang === 'en' ? 'Area' : 'אזור'}</p>
                                <p className="font-medium">{lead.area || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">{lang === 'en' ? 'Source' : 'מקור'}</p>
                                <p className="font-medium">{lead.source || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">{lang === 'en' ? 'Assignment' : 'הקצאה'}</p>
                                <p className="font-medium">{lead.assignment || 'internal'}</p>
                              </div>
                            </div>
                            {lead.description && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">{lang === 'en' ? 'Description' : 'תיאור'}</p>
                                <p className="text-sm bg-muted/50 p-2 rounded">{lead.description}</p>
                              </div>
                            )}
                            <div>
                              <Label>{lang === 'en' ? 'Status' : 'סטטוס'}</Label>
                              <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="quoted">Quoted</SelectItem>
                                  <SelectItem value="booked">Booked</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>{lang === 'en' ? 'Notes' : 'הערות'}</Label>
                              <Textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="mt-1"
                                rows={3}
                              />
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => updateLead(lead.id, { status: editStatus, notes: editNotes })}
                            >
                              {lang === 'en' ? 'Save Changes' : 'שמור שינויים'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t.admin.partners}</CardTitle>
              </CardHeader>
              <CardContent>
                {partners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {lang === 'en' ? 'No partners found' : 'לא נמצאו שותפים'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {partners.map((partner) => (
                      <div key={partner.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <div>
                          <p className="font-medium text-sm">{partner.name}</p>
                          <p className="text-xs text-muted-foreground">{partner.business_type} • {partner.area}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {partner.partner_type}
                          </Badge>
                          {partner.phone && (
                            <a href={`tel:${partner.phone}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}