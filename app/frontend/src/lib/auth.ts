import axios, { AxiosInstance } from 'axios';
import { getAPIBaseURL } from './config';

class RPApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('cleanfix_access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  private getBaseURL() {
    return getAPIBaseURL();
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/me`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return null;
      }
      throw new Error(
        error.response?.data?.detail || 'Failed to get user info'
      );
    }
  }

  async login() {
    window.location.assign(`${this.getBaseURL()}/api/v1/auth/login`);
  }

  async getStatus(): Promise<{ configured: boolean; provider: string; email_configured: boolean; email_signup_configured: boolean }> {
    const response = await this.client.get(`${this.getBaseURL()}/api/v1/auth/status`);
    return response.data;
  }

  async exchangeSupabaseToken(accessToken: string) {
    const response = await this.client.post(`${this.getBaseURL()}/api/v1/auth/supabase/exchange`, {
      access_token: accessToken,
    });
    this.storeSession(response.data.token);
    return response.data;
  }

  async logout() {
    localStorage.removeItem('cleanfix_access_token');
    localStorage.removeItem('cleanfix_token_expires_at');
    window.location.assign('/');
  }

  storeSession(token: string, expiresAt?: string) {
    localStorage.setItem('cleanfix_access_token', token);
    if (expiresAt) localStorage.setItem('cleanfix_token_expires_at', expiresAt);
  }

  async getProfile() {
    const response = await this.client.get(`${this.getBaseURL()}/api/v1/account/profile`);
    return response.data;
  }

  async getBusinessAccess(): Promise<{
    account_type: 'business';
    relationships: Array<{ relationship_type: 'managed_provider' | 'referral_partner'; status: 'pending' | 'active' | 'paused' | 'rejected' | 'revoked' }>;
  }> {
    const response = await this.client.get(`${this.getBaseURL()}/api/v1/business-access/me`);
    return response.data;
  }

  async getBusinessPortalContext(kind: 'provider' | 'partner'): Promise<{
    relationship_id: number;
    relationship_type: 'managed_provider' | 'referral_partner';
    status: 'active';
  }> {
    const response = await this.client.get(`${this.getBaseURL()}/api/v1/business-access/${kind}/context`);
    return response.data;
  }

  async updateProfile(data: Record<string, unknown>) {
    const response = await this.client.put(`${this.getBaseURL()}/api/v1/account/profile`, data);
    return response.data;
  }
}

export const authApi = new RPApi();
