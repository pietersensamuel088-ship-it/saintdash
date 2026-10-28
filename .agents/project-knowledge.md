# Project Knowledge Base: SaintDash (Proxmox & Node Monitor)

## 1. Project Mission & Overview
- **Project Name**: SaintDash
- **Description**: A modern, high-density, real-time telemetry dashboard for Proxmox VE servers, Docker containers, and database nodes with private single-user master authentication, inspired by the high-visibility Prometheus/Grafana dark telemetry layout.
- **Target Audience / Users**: Private homelab & self-hosted server operator (hosted 24/7 on local Proxmox laptop, accessed on local network, with Cloudflare tunnel readiness).

## 2. Tech Stack & Toolchain
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Recharts for timeline metrics, custom SVG radial arc gauges.
- **Backend**: Python 3.12, FastAPI, Uvicorn, Proxmoxer / Requests (Proxmox VE REST API v2), PyJWT, Pydantic v2.
- **Design Standard**: Impeccable Operate Mode — high-contrast telemetry palette (`#090a0f` deep dark, `#11131a` surface, `#10b981` vibrant emerald, `#f59e0b` amber, `#3b82f6` cyan-blue, `#ef4444` rose), balanced typography, high scanability, custom scrollbars, zero AI slop.
- **Packaging & Deployment**: Multi-stage `Dockerfile` and `docker-compose.yml` for effortless deployment onto Proxmox Docker nodes, syncable via GitHub.

## 3. Architecture & Key Files
- `backend/`:
  - `app/main.py`: FastAPI server, static mount, API routers.
  - `app/config.py`: Environment configuration via Pydantic settings.
  - `app/auth.py`: Master password verification and JWT token generator/validator.
  - `app/services/proxmox.py`: Proxmox VE API integration (Nodes, VMs, LXC, Storage, RRD graphs).
  - `app/services/docker_service.py`: Docker socket API integration for container telemetry.
  - `app/services/database_service.py`: Supabase / PostgreSQL database health metrics.
  - `app/routers/`: Auth, Proxmox, Docker, Database, and Connection diagnostics routes.
- `frontend/`:
  - `src/App.tsx`: Main dashboard router with authentication guard.
  - `src/components/`:
    - `RadialGauge.tsx`: Authentic SVG semi-circular gauge meters matching the user's reference.
    - `MetricsOverview.tsx`: CPU, RAM, Container count, and Uptime telemetry cards.
    - `WorkloadTable.tsx`: Searchable, filterable list of VMs, LXC, and Docker containers.
    - `TelemetryCharts.tsx`: Real-time and historical CPU / Memory time series.
    - `StorageSection.tsx`: ZFS / LVM / Local disk usage bars and IOPS.
    - `DatabaseSection.tsx`: Database connections, pool status, and database node telemetry.
    - `LoginModal.tsx`: Secure master password modal for private access.
    - `SettingsModal.tsx`: Dynamic configuration & connection test tool.
- `docker-compose.yml`: Single-command container deployment for Proxmox host.
- `.env.example`: Secure environment configuration template.

## 4. Architectural Decisions & Rationale
- **Decision 1: FastAPI + Vite SPA**: Selected as per user choice (Option 2). FastAPI provides native asynchronous HTTP clients for Proxmox REST API with low CPU footprint, while React + Vite provides instant rendering and high frame-rate metric charts.
- **Decision 2: Graceful Mock & Live Auto-Switching**: If Proxmox credentials are not yet entered or reachable, the backend serves rich, realistic telemetry samples so the UI can be developed, previewed, and tested locally without breaking. Once live Proxmox credentials or Docker socket are provided, it smoothly switches to real live hardware data.
- **Decision 3: Master Password + JWT**: Zero external dependency required for authentication. Stored as salted SHA-256 hash or verified via environment master key.
- **Decision 4: Single Container Production Delivery**: The production Dockerfile builds the React frontend and packages it into FastAPI's static directory, producing a single lean Docker container that can be transferred via GitHub and spun up on the Proxmox Docker node with `docker compose up -d`.

## 5. External Services & Database
- **Proxmox VE REST API**: Port 8006, authenticated via `PVEAPIToken` (`PVEAPIToken=USER@REALM!TOKENID=UUID`).
- **Docker Engine API**: Local UNIX socket `/var/run/docker.sock`.
- **Database (Supabase / Postgres)**: Optional direct connection pool monitoring.
- *(Note: All secrets loaded via environment variables; never hardcoded)*

## 6. Current Progress & Roadmap
- [x] Initial project interview & architecture design
- [ ] Backend FastAPI implementation & mock/live Proxmox service
- [ ] Frontend React + Tailwind UI with Impeccable telemetry theme
- [ ] Verification with tests & linter
- [ ] Docker packaging & deployment guide
