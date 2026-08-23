import axios from 'axios';
import { getAPIBaseURL } from './config';

const http = axios.create({ headers: { 'Content-Type': 'application/json' } });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cleanfix_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const cleanfixApi = {
  async listPublicPartners(limit = 50) {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/entities/partners/public`, {
      params: { limit },
    });
    return response.data;
  },
  async listAccountProfiles() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/account/profiles`);
    return response.data;
  },
  async getViewerDashboard() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/viewer/dashboard`);
    return response.data;
  },
  async listViewers() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/admin/viewers`);
    return response.data as { id: number; email: string; access_role: 'viewer' | 'admin'; is_active: boolean; created_at?: string }[];
  },
  async addViewer(email: string, accessRole: 'viewer' | 'admin' = 'viewer') {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/admin/viewers`, { email, access_role: accessRole });
    return response.data;
  },
  async removeViewer(id: number) {
    await http.delete(`${getAPIBaseURL()}/api/v1/admin/viewers/${id}`);
  },
  async createLead(data: Record<string, unknown>) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/entities/leads`, data);
    return response.data;
  },

  async listLeads(limit = 100) {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/entities/leads`, {
      params: { sort: '-created_at', limit },
    });
    return response.data;
  },

  async updateLead(id: number | string, data: Record<string, unknown>) {
    const response = await http.put(`${getAPIBaseURL()}/api/v1/entities/leads/${id}`, data);
    return response.data;
  },

  async listPartners(limit = 200) {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/entities/partners`, {
      params: { sort: 'sort_order', limit },
    });
    return response.data;
  },

  async createPartner(data: Record<string, unknown>) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/entities/partners`, data);
    return response.data;
  },

  async updatePartner(id: number | string, data: Record<string, unknown>) {
    const response = await http.put(`${getAPIBaseURL()}/api/v1/entities/partners/${id}`, data);
    return response.data;
  },

  async listJobs(limit = 200) {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/entities/jobs`, {
      params: { sort: '-created_at', limit },
    });
    return response.data;
  },

  async createJob(data: Record<string, unknown>) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/entities/jobs`, data);
    return response.data;
  },

  async updateJob(id: number | string, data: Record<string, unknown>) {
    const response = await http.put(`${getAPIBaseURL()}/api/v1/entities/jobs/${id}`, data);
    return response.data;
  },

  async listServices(limit = 200) {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/entities/services`, {
      params: { sort: 'sort_order', limit },
    });
    return response.data;
  },

  async updateService(id: number | string, data: Record<string, unknown>) {
    const response = await http.put(`${getAPIBaseURL()}/api/v1/entities/services/${id}`, data);
    return response.data;
  },

  async listPricingReferences() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/pricing/references`);
    return response.data;
  },

  async listPriceEstimates() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/pricing/estimates`);
    return response.data;
  },

  async createPriceEstimate(data: Record<string, unknown>) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/pricing/estimates`, data);
    return response.data;
  },

  async approvePriceEstimate(id: number | string) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/pricing/estimates/${id}/approve`);
    return response.data;
  },

  async listLocalPriceEvidence() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/pricing/local-evidence`);
    return response.data;
  },

  async createLocalPriceEvidence(data: Record<string, unknown>) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/pricing/local-evidence`, data);
    return response.data;
  },

  async approveLocalPriceEvidence(id: number | string) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/pricing/local-evidence/${id}/approve`);
    return response.data;
  },

  async getLocalPriceBenchmarks() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/pricing/local-benchmarks`);
    return response.data;
  },

  async listSiteContent() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/entities/site_content`, {
      params: { sort: 'section_key', limit: 200 },
    });
    return response.data;
  },

  async updateSiteContent(id: number | string, data: Record<string, unknown>) {
    const response = await http.put(`${getAPIBaseURL()}/api/v1/entities/site_content/${id}`, data);
    return response.data;
  },

  async getSiteSettings() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/site-settings`);
    return response.data;
  },

  async updateSiteSettings(data: Record<string, unknown>) {
    const response = await http.put(`${getAPIBaseURL()}/api/v1/site-settings`, data);
    return response.data;
  },

  async listSiteMedia() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/site-media`);
    return response.data;
  },

  async uploadSiteMedia(image: File, altText: string) {
    const form = new FormData();
    form.append('image', image);
    form.append('alt_text', altText);
    const response = await http.post(`${getAPIBaseURL()}/api/v1/site-media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async askAssistant(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/aihub/gentxt`, {
      messages,
      stream: false,
      temperature: 0.3,
      max_tokens: 1800,
    });
    return response.data as { content: string; model?: string };
  },

  async generateThemePalette(data: { color: string; type: 'complementary' | 'analogous' | 'triadic' }) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/theme-palettes/generate`, data);
    return response.data;
  },

  async generateVideo(data: {
    prompt: string;
    image?: string;
    model?: string;
    size?: string;
    seconds?: string;
  }) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/aihub/genvideo`, {
      model: 'wan2.6-t2v',
      size: '1280x720',
      seconds: '4',
      ...data,
    });
    return response.data as {
      url: string;
      model: string;
      duration: number;
      revised_prompt?: string;
    };
  },

  async getDefaultRestorePoint() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/website-restore/default`);
    return response.data as { name: string; created_at: string; content_sections: number; services: number };
  },

  async restoreDefaultWebsite() {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/website-restore/default`);
    return response.data as { name: string; restored: boolean; content_sections: number; services: number };
  },

  async listServiceQuotes() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/quotes`);
    return response.data;
  },

  async createServiceQuote(data: Record<string, unknown>) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/quotes`, data);
    return response.data;
  },

  async publishServiceQuote(id: number | string) {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/quotes/${id}/publish`);
    return response.data;
  },

  async getPublicServiceQuote(token: string) {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/public/quotes/${encodeURIComponent(token)}`);
    return response.data;
  },

  async decidePublicServiceQuote(token: string, decision: 'accept' | 'decline') {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/public/quotes/${encodeURIComponent(token)}/decision`, { decision });
    return response.data;
  },
};

export function absoluteApiUrl(path?: string) {
  if (!path || /^(https?:|data:|\/assets\/)/.test(path)) return path || '';
  return `${getAPIBaseURL()}${path.startsWith('/') ? path : `/${path}`}`;
}
