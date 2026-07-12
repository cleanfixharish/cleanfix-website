export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'scheduled' | 'in progress' | 'completed' | 'follow-up' | 'cancelled';

export interface DashboardLead {
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
}

export const starterLeads: DashboardLead[] = [
  { id: 9001, customerName: 'Noa Levi', phone: '050-412-7830', service: 'Handyman', location: 'Avnei Hen, Harish', message: 'Two shelves and a curtain rail need installation.', source: 'WhatsApp', date: 'Today, 09:40', status: 'new', provider: 'Unassigned', notes: 'Prefers afternoon.', needsReply: true },
  { id: 9002, customerName: 'Daniel Cohen', phone: '052-764-1182', service: 'Plumbing', location: 'HaHoresh, Harish', message: 'Slow leak under kitchen sink.', source: 'Website', date: 'Today, 08:15', status: 'contacted', provider: 'Amit Ben-David', notes: 'Requested photos before quote.', needsReply: false },
  { id: 9003, customerName: 'Sarah Miller', phone: '054-330-9217', service: 'Move-in cleaning', location: 'Tzavta, Harish', message: 'Four-room apartment before move-in.', source: 'Google', date: 'Yesterday', status: 'quoted', provider: 'Maya Cleaning Team', notes: 'Quote sent: ₪1,250.', needsReply: true },
  { id: 9004, customerName: 'Eli Rosen', phone: '053-905-6631', service: 'Electrical', location: 'Maof, Harish', message: 'Replace two light fixtures.', source: 'Referral', date: '11 Jul', status: 'scheduled', provider: 'Yossi Electrical', notes: 'Scheduled Sunday at 10:00.', needsReply: false },
  { id: 9005, customerName: 'Michal Azulay', phone: '050-671-2489', service: 'AC cleaning', location: 'HaPrahim, Harish', message: 'Clean two wall units.', source: 'Website', date: '10 Jul', status: 'follow-up', provider: 'Amit Ben-David', notes: 'Ask if airflow improved.', needsReply: true },
];

export const jobs = [
  { id: 'JOB-1042', customer: 'Eli Rosen', service: 'Electrical', provider: 'Yossi Electrical', when: 'Sun · 10:00', status: 'Scheduled', price: '₪480 est.', urgency: 'Normal', next: 'Confirm arrival Saturday evening' },
  { id: 'JOB-1041', customer: 'Daniel Cohen', service: 'Plumbing', provider: 'Amit Ben-David', when: 'Today · 16:30', status: 'In progress', price: '₪350 est.', urgency: 'High', next: 'Receive completion photo' },
  { id: 'JOB-1039', customer: 'Yael Shavit', service: 'Handyman', provider: 'Harish Fix Team', when: 'Mon · 12:00', status: 'Scheduled', price: '₪620 est.', urgency: 'Normal', next: 'Confirm wall type and anchors' },
];

export const providers = [
  { name: 'Amit Ben-David', phone: '050-630-1844', specialty: 'Handyman · Plumbing', area: 'Harish', availability: 'Available today', rating: '4.8', trust: 'Reliable, clean work, sends completion photos.' },
  { name: 'Yossi Electrical', phone: '052-718-4590', specialty: 'Licensed electrical', area: 'Harish & Pardes Hanna', availability: 'Next: Sunday', rating: '4.9', trust: 'Confirm licence for regulated work before assignment.' },
  { name: 'Maya Cleaning Team', phone: '054-885-2031', specialty: 'Move-in · Post-renovation', area: 'Harish', availability: 'Available Monday', rating: '4.7', trust: 'Strong detail work; confirm team size in advance.' },
  { name: 'Harish Fix Team', phone: '053-411-7602', specialty: 'General maintenance', area: 'Harish', availability: 'Limited', rating: '4.6', trust: 'Good backup capacity for multi-item visits.' },
];

export const services = [
  { name: 'Handyman services', publicCopy: 'Careful help with installations, repairs and everyday home maintenance.', guidance: 'Scope by photos first. Minimum visit guidance: ₪250–₪350.', active: true, priority: 'Primary' },
  { name: 'Post-renovation cleaning', publicCopy: 'Detailed cleaning after building or renovation work.', guidance: 'Quote by rooms, condition, access and crew size.', active: true, priority: 'Supporting' },
  { name: 'Move-in / move-out cleaning', publicCopy: 'A careful reset before keys change hands.', guidance: 'Confirm empty/occupied, windows, appliances and parking.', active: true, priority: 'Supporting' },
  { name: 'AC cleaning', publicCopy: 'Internal cleaning that supports cleaner airflow and reliable performance.', guidance: 'Ask for unit count and photos. No repair promises.', active: true, priority: 'Supporting' },
];

export const activity = [
  { time: '10:18', text: 'Lead Noa Levi added from WhatsApp', type: 'Lead' },
  { time: '09:52', text: 'JOB-1041 marked in progress', type: 'Job' },
  { time: '09:31', text: 'Quote follow-up scheduled for Sarah Miller', type: 'Follow-up' },
  { time: 'Yesterday', text: 'Homepage handyman copy updated', type: 'Content' },
];
