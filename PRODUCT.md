# Product Context: SaintDash

## Mission
Provide a unified, single-pane-of-glass dashboard for self-hosted Proxmox VE servers, Docker containers, and database nodes running on a 24/7 laptop node. High visibility, instant response, private access.

## Target User
Solo homelab administrator and developer accessing the dashboard over the local home network (and later via Cloudflare tunnel / HTTPS).

## Mode
**Operate** — High scanability, dark telemetry aesthetic, instant state visibility, real metric values, zero decorative fluff.

## Key Capabilities
1. Real-time CPU, RAM, Disk, and Network telemetry for Proxmox nodes.
2. Direct visual breakdown of all QEMU VMs, LXC containers, and Docker containers with live CPU/RAM utilization and status.
3. Database monitoring (Supabase / PostgreSQL connection pool, size, active queries).
4. Time series telemetry graphs replicating the high-precision Grafana / Prometheus aesthetic.
5. Private master password login with JWT session locking.
6. Local connection diagnostic tool to verify Proxmox token and Docker socket health.
