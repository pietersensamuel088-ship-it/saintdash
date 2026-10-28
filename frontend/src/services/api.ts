import type {
  ClusterSummary,
  DatabaseMetrics,
  DiscordBot,
  ProxmoxNode,
  RrdTelemetryPoint,
  StoragePool,
  WorkloadItem,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('saintdash_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('saintdash_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('saintdash_token');
  }

  hasToken(): boolean {
    return !!this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async login(password: string): Promise<{ access_token: string }> {
    const data = await this.request<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async verify(): Promise<{ valid: boolean; user: string }> {
    return this.request('/api/auth/verify');
  }

  async getSummary(): Promise<ClusterSummary> {
    return this.request('/api/proxmox/summary');
  }

  async getNodes(): Promise<ProxmoxNode[]> {
    return this.request('/api/proxmox/nodes');
  }

  async getVms(node?: string): Promise<WorkloadItem[]> {
    const url = node ? `/api/proxmox/vms?node=${node}` : '/api/proxmox/vms';
    return this.request(url);
  }

  async getLxc(node?: string): Promise<WorkloadItem[]> {
    const url = node ? `/api/proxmox/lxc?node=${node}` : '/api/proxmox/lxc';
    return this.request(url);
  }

  async getDockerContainers(): Promise<WorkloadItem[]> {
    return this.request('/api/docker/containers');
  }

  async getRrd(node: string = 'pve', timeframe: string = 'hour'): Promise<RrdTelemetryPoint[]> {
    return this.request(`/api/proxmox/rrd?node=${node}&timeframe=${timeframe}`);
  }

  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    return this.request('/api/database/metrics');
  }

  async getStorage(node: string = 'pve'): Promise<StoragePool[]> {
    return this.request(`/api/proxmox/storage?node=${node}`);
  }

  async getBots(): Promise<DiscordBot[]> {
    return this.request('/api/bots');
  }

  async restartBot(botId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/bots/${botId}/restart`, {
      method: 'POST',
    });
  }

  async testProxmoxConnection(): Promise<{ success: boolean; message: string; version?: string; is_mock?: boolean }> {
    return this.request('/api/diagnostics/proxmox');
  }

  async testCustomConfig(config: {
    proxmox_host: string;
    proxmox_user: string;
    token_name: string;
    token_value: string;
    verify_ssl: boolean;
  }): Promise<{ success: boolean; message: string; version?: string }> {
    return this.request('/api/diagnostics/test-config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }
}

export const api = new ApiService();
