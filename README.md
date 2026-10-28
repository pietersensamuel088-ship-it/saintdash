# 🛰️ SaintDash — Proxmox & Node Telemetry Dashboard

A high-performance, dark-mode telemetry dashboard engineered for **Proxmox VE servers, Docker containers, and database nodes** hosted 24/7 on private homelabs and laptops.

Built with **FastAPI (Python 3.12)**, **React 18 + Vite**, **Tailwind CSS**, and **Recharts**, featuring single-user Master Password JWT security, live Proxmox REST API token integration, and zero external runtime dependencies.

---

## ✨ Features

- **⚡ Semi-Circular SVG Gauges**: High-contrast CPU and RAM utilization arc meters with dynamic color thresholds (<50% emerald, 50-80% amber, >80% rose).
- **📊 Real-Time Grafana-Style Telemetry**: Dual time series charts for CPU breakdown (Idle, System, User, IOWait) and Memory distribution (Total, Used, Cache, Free, Buffer).
- **📦 Unified Workload Manager**: Single-pane inventory of all Proxmox **QEMU Virtual Machines**, **LXC Containers**, and **Docker Containers** with instant search, filtering, and live state indicators.
- **🗄️ Database & Multi-Node Telemetry**: Connection pool gauges, database size, cache hit ratio, TPS, and separate node health cards (Primary read/write vs Read replicas).
- **💾 Storage Pools & Volumes**: Visual capacity tracking across Proxmox storage backends (`local`, `local-lvm`, `local-zfs`).
- **🔒 Private Master Guard**: Local single-user master password with signed JWT sessions. Only you can access the dashboard.
- **🌐 Cloudflare Ready**: Prepared for local LAN access and one-click Cloudflare Tunnel routing for custom domains with HTTPS.
- **🔄 Live & Simulation Modes**: Seamlessly falls back to realistic mock telemetry if Proxmox credentials are not yet supplied, allowing immediate preview and testing.

---

## 🚀 Quick Start (Local Development)

### 1. Setup Environment
```bash
# Clone the repository
git clone https://github.com/your-username/saintdash.git
cd saintdash

# Copy environment configuration
cp .env.example .env
```

Edit `.env` to customize your master password:
```ini
DASHBOARD_PASSWORD=your_secure_password
JWT_SECRET=generate_a_long_random_string_here
```

### 2. Run Backend
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🖥️ Deploying on Your 24/7 Proxmox Laptop Node

SaintDash is packaged as a multi-stage Docker container that builds the frontend and serves it directly from the FastAPI backend on port `8000`.

### Step 1: Push Code to GitHub
On your development machine:
```bash
git add .
git commit -m "feat: initial SaintDash deployment ready"
git remote add origin https://github.com/your-username/saintdash.git
git branch -M main
git push -u origin main
```

### Step 2: Clone onto Your Proxmox Docker Node
SSH into your Proxmox server or Docker VM:
```bash
git clone https://github.com/your-username/saintdash.git
cd saintdash
cp .env.example .env
nano .env
```

### Step 3: Configure Proxmox API Token
1. Open your Proxmox web interface (`https://your-laptop-ip:8006`).
2. Navigate to **Datacenter &rarr; Permissions &rarr; API Tokens &rarr; Add**.
3. Select User (`root@pam` or a dedicated monitoring user), set Token ID to `saintdash`, and uncheck **Privilege Separation**.
4. Copy the generated **Token Value (UUID)**.
5. In `.env`:
   ```ini
   PROXMOX_HOST=https://192.168.1.xxx:8006
   PROXMOX_USER=root@pam
   PROXMOX_TOKEN_NAME=saintdash
   PROXMOX_TOKEN_VALUE=your-token-uuid-here
   PROXMOX_VERIFY_SSL=false
   ```

### Step 4: Start SaintDash
```bash
docker compose up -d --build
```
Your dashboard will now be live on your home network at:
`http://<your-laptop-ip>:8000`

---

## ☁️ Exposing Online with Cloudflare Tunnel (Optional)

When you are ready to make SaintDash accessible outside your home network with automatic HTTPS on your domain:

1. In the **Cloudflare Zero Trust Dashboard**, create a **Cloudflare Tunnel**.
2. Uncomment the `cloudflared` service inside [docker-compose.yml](file:///c:/saintdash/docker-compose.yml).
3. Set your tunnel token in `.env`:
   ```ini
   CLOUDFLARE_TUNNEL_TOKEN=eyJh...
   ```
4. Restart docker compose:
   ```bash
   docker compose up -d
   ```

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
python -m pytest backend/tests/test_api.py
```

Run Impeccable design quality detector:
```bash
npx impeccable detect frontend/src
```
