export interface ClusterSummary {
  cluster: {
    online_nodes: number;
    total_nodes: number;
  };
  cpu: {
    usage_pct: number;
    cores_used: number;
    cores_total: number;
  };
  ram: {
    usage_pct: number;
    used_bytes: number;
    total_bytes: number;
    used_gib: number;
    total_gib: number;
  };
  workloads: {
    total_count: number;
    running_count: number;
    vms_count: number;
    lxc_count: number;
    docker_count: number;
  };
  uptime: {
    seconds: number;
    hours: number;
    formatted: string;
  };
  is_live_proxmox: boolean;
}

export interface ProxmoxNode {
  node: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
  id: string;
}

export interface WorkloadItem {
  id: string | number;
  name: string;
  status: string;
  type: 'qemu' | 'lxc' | 'docker';
  node: string;
  cpu_pct?: number;
  cpu?: number;
  mem_bytes?: number;
  mem?: number;
  maxmem?: number;
  uptime?: string | number;
  ip?: string;
  ports?: string;
  image?: string;
}

export interface RrdTelemetryPoint {
  time: number;
  formatted_time: string;
  cpu: number;
  user: number;
  system: number;
  iowait: number;
  idle: number;
  mem_total_gib: number;
  mem_used_gib: number;
  mem_cache_gib: number;
  mem_buffer_gib: number;
  mem_free_gib: number;
  swap_used_gib: number;
  swap_total_gib: number;
}

export interface DatabaseNode {
  node_id: string;
  role: string;
  host: string;
  status: string;
  replication_lag_ms: number;
  cpu_usage_pct: number;
  ram_usage_mb: number;
  active_queries: number;
}

export interface DatabaseMetrics {
  status: string;
  provider: string;
  version: string;
  metrics: {
    active_connections: number;
    max_connections: number;
    connection_pct: number;
    database_size_bytes: number;
    database_size_pretty: string;
    cache_hit_ratio_pct: number;
    transactions_per_sec: number;
    table_count: number;
    index_count: number;
    deadlocks_detected: number;
  };
  nodes: DatabaseNode[];
  supabase_services: Record<string, string>;
}

export interface StoragePool {
  storage: string;
  type: string;
  content: string;
  total: number;
  used: number;
  avail: number;
  active: number;
  enabled: number;
}

export interface DiscordBot {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'idle';
  type: string;
  uptime: string;
  memory_mb: number;
  ping_ms: number;
  host_vm?: string;
  host_ip?: string;
  vmid?: number;
  guilds?: number;
  prefix?: string;
  version?: string;
  avatar_url?: string;
  tag?: string;
}
