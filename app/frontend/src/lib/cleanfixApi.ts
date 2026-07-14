import axios from 'axios';
import { getAPIBaseURL } from './config';

const http = axios.create({ headers: { 'Content-Type': 'application/json' } });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cleanfix_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const cleanfixApi = {
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
};
