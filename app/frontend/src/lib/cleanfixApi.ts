import axios from 'axios';
import { getAPIBaseURL } from './config';

const http = axios.create({ headers: { 'Content-Type': 'application/json' } });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cleanfix_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const cleanfixApi = {
  async getViewerDashboard() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/viewer/dashboard`);
    return response.data;
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

  async getDefaultRestorePoint() {
    const response = await http.get(`${getAPIBaseURL()}/api/v1/website-restore/default`);
    return response.data as { name: string; created_at: string; content_sections: number; services: number };
  },

  async restoreDefaultWebsite() {
    const response = await http.post(`${getAPIBaseURL()}/api/v1/website-restore/default`);
    return response.data as { name: string; restored: boolean; content_sections: number; services: number };
  },
};

export function absoluteApiUrl(path?: string) {
  if (!path || /^(https?:|data:|\/assets\/)/.test(path)) return path || '';
  return `${getAPIBaseURL()}${path.startsWith('/') ? path : `/${path}`}`;
}
