import logging
import math
import random
import time
from typing import Any, Dict, List, Optional
import requests
import urllib3
from backend.app.config import settings

# Suppress insecure SSL warnings when user is connecting to self-signed PVE cert
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logger = logging.getLogger("saintdash.proxmox")

class ProxmoxService:
    def __init__(self):
        self.session = requests.Session()

    @property
    def is_configured(self) -> bool:
        return bool(
            settings.PROXMOX_HOST
            and settings.PROXMOX_USER
            and settings.PROXMOX_TOKEN_NAME
            and settings.PROXMOX_TOKEN_VALUE
        )

    def _get_headers(self) -> Dict[str, str]:
        auth_header = (
            f"PVEAPIToken={settings.PROXMOX_USER}!{settings.PROXMOX_TOKEN_NAME}="
            f"{settings.PROXMOX_TOKEN_VALUE}"
        )
        return {
            "Authorization": auth_header,
            "Accept": "application/json",
        }

    def _request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Optional[Any]:
        if not self.is_configured:
            return None
        
        base_url = settings.PROXMOX_HOST.rstrip("/")
        url = f"{base_url}/api2/json/{endpoint.lstrip('/')}"
        try:
            resp = self.session.get(
                url,
                headers=self._get_headers(),
                params=params,
                verify=settings.PROXMOX_VERIFY_SSL,
                timeout=5.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("data")
            else:
                logger.warning(f"Proxmox API returned {resp.status_code}: {resp.text}")
                return None
        except Exception as e:
            logger.error(f"Error querying Proxmox API ({url}): {e}")
            return None

    def test_connection(self) -> Dict[str, Any]:
        """Tests live reachability and authentication with Proxmox server."""
        if not self.is_configured:
            return {
                "success": False,
                "message": "Proxmox credentials not configured in .env",
                "is_mock": True,
            }
        try:
            version_data = self._request("version")
            if version_data:
                return {
                    "success": True,
                    "version": version_data.get("version"),
                    "release": version_data.get("release"),
                    "message": "Successfully connected to Proxmox VE API",
                    "is_mock": False,
                }
            return {
                "success": False,
                "message": "Proxmox host responded, but could not retrieve version data (check token permissions)",
                "is_mock": False,
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection error: {str(e)}",
                "is_mock": False,
            }

    def get_nodes(self) -> List[Dict[str, Any]]:
        """Retrieves cluster nodes with resource utilization."""
        data = self._request("nodes")
        if data is not None:
            return data
        return self._generate_mock_nodes()

    def get_node_status(self, node: str) -> Dict[str, Any]:
        """Retrieves detailed status for a specific node."""
        data = self._request(f"nodes/{node}/status")
        if data is not None:
            return data
        return self._generate_mock_node_status(node)

    def get_vms(self, node: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves QEMU Virtual Machines."""
        if node:
            data = self._request(f"nodes/{node}/qemu")
            if data is not None:
                for vm in data:
                    vm["node"] = node
                    vm["type"] = "qemu"
                return data
        else:
            nodes = self.get_nodes()
            all_vms = []
            for n in nodes:
                node_name = n.get("node", "pve")
                vms = self._request(f"nodes/{node_name}/qemu")
                if vms:
                    for vm in vms:
                        vm["node"] = node_name
                        vm["type"] = "qemu"
                    all_vms.extend(vms)
            if all_vms:
                return all_vms

        return self._generate_mock_vms()

    def get_lxc(self, node: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves LXC Containers."""
        if node:
            data = self._request(f"nodes/{node}/lxc")
            if data is not None:
                for ct in data:
                    ct["node"] = node
                    ct["type"] = "lxc"
                return data
        else:
            nodes = self.get_nodes()
            all_cts = []
            for n in nodes:
                node_name = n.get("node", "pve")
                cts = self._request(f"nodes/{node_name}/lxc")
                if cts:
                    for ct in cts:
                        ct["node"] = node_name
                        ct["type"] = "lxc"
                    all_cts.extend(cts)
            if all_cts:
                return all_cts

        return self._generate_mock_lxc()

    def get_storage(self, node: str = "pve") -> List[Dict[str, Any]]:
        """Retrieves storage pool information."""
        data = self._request(f"nodes/{node}/storage")
        if data is not None:
            return data
        return self._generate_mock_storage()

    def get_rrd_data(self, node: str = "pve", timeframe: str = "hour") -> List[Dict[str, Any]]:
        """Retrieves time series RRD metrics."""
        data = self._request(f"nodes/{node}/rrddata", params={"timeframe": timeframe})
        if data is not None:
            return data
        return self._generate_mock_rrd()

    # --- Realistic Mock Fallback Generators ---
    def _generate_mock_nodes(self) -> List[Dict[str, Any]]:
        # Modeled on laptop running Proxmox 24/7 (16 cores, 16GB RAM)
        now = time.time()
        return [
            {
                "node": "pve-laptop-01",
                "status": "online",
                "cpu": 0.042,  # 4.2%
                "maxcpu": 16,
                "mem": 11166914560,  # ~10.4 GB
                "maxmem": 16535552000,  # ~15.4 GB
                "disk": 128849018880,  # ~120 GB
                "maxdisk": 512110190592,  # ~476 GB SSD
                "uptime": 34236,  # 9.51 hours
                "id": "node/pve-laptop-01",
                "level": "",
                "type": "node",
                "ssl_fingerprint": "AA:BB:CC:DD:EE:FF:11:22:33:44:55:66",
            }
        ]

    def _generate_mock_node_status(self, node: str) -> Dict[str, Any]:
        return {
            "cpu": 0.042,
            "cpuinfo": {
                "cores": 16,
                "cpus": 16,
                "hvm": 1,
                "model": "12th Gen Intel(R) Core(TM) i7-12700H",
                "sockets": 1,
            },
            "current-kernel": {
                "machine": "x86_64",
                "release": "6.8.4-2-pve",
                "sysname": "Linux",
                "version": "#1 SMP PREEMPT_DYNAMIC PVE 6.8.4-2",
            },
            "idle": 0.958,
            "iowait": 0.008,
            "kversion": "Linux 6.8.4-2-pve",
            "loadavg": ["0.45", "0.62", "0.58"],
            "memory": {
                "free": 5368709120,
                "total": 16535552000,
                "used": 11166914560,
                "cache": 2147483648,
                "buffer": 314572800,
            },
            "pveversion": "pve-manager/8.2.2/9355359cd7af05e0",
            "rootfs": {
                "avail": 383261171712,
                "free": 383261171712,
                "total": 512110190592,
                "used": 128849018880,
            },
            "swap": {
                "free": 8589934592,
                "total": 8589934592,
                "used": 0,
            },
            "uptime": 34236,
            "thermal": {
                "cpu_temp": 46.5,
                "fan_rpm": 1850,
            },
        }

    def _generate_mock_vms(self) -> List[Dict[str, Any]]:
        return [
            {
                "vmid": 100,
                "name": "docker-node-srv",
                "status": "running",
                "node": "pve-laptop-01",
                "type": "qemu",
                "cpus": 4,
                "cpu": 0.065,
                "mem": 4294967296,
                "maxmem": 8589934592,
                "disk": 21474836480,
                "maxdisk": 64424509440,
                "uptime": 34200,
                "netin": 142850912,
                "netout": 98234190,
                "ip": "192.168.1.150",
            },
            {
                "vmid": 101,
                "name": "db-postgres-cluster",
                "status": "running",
                "node": "pve-laptop-01",
                "type": "qemu",
                "cpus": 2,
                "cpu": 0.028,
                "mem": 2147483648,
                "maxmem": 4294967296,
                "disk": 15032385536,
                "maxdisk": 42949672960,
                "uptime": 34150,
                "netin": 84920194,
                "netout": 120491823,
                "ip": "192.168.1.151",
            },
            {
                "vmid": 102,
                "name": "backup-vault",
                "status": "stopped",
                "node": "pve-laptop-01",
                "type": "qemu",
                "cpus": 2,
                "cpu": 0.0,
                "mem": 0,
                "maxmem": 2147483648,
                "disk": 5368709120,
                "maxdisk": 107374182400,
                "uptime": 0,
                "netin": 0,
                "netout": 0,
                "ip": "—",
            },
        ]

    def _generate_mock_lxc(self) -> List[Dict[str, Any]]:
        return [
            {
                "vmid": 200,
                "name": "nginx-ingress-proxy",
                "status": "running",
                "node": "pve-laptop-01",
                "type": "lxc",
                "cpus": 1,
                "cpu": 0.012,
                "mem": 268435456,
                "maxmem": 1073741824,
                "disk": 1073741824,
                "maxdisk": 8589934592,
                "uptime": 34220,
                "ip": "192.168.1.160",
            },
            {
                "vmid": 201,
                "name": "redis-cache",
                "status": "running",
                "node": "pve-laptop-01",
                "type": "lxc",
                "cpus": 1,
                "cpu": 0.008,
                "mem": 134217728,
                "maxmem": 536870912,
                "disk": 536870912,
                "maxdisk": 4294967296,
                "uptime": 34210,
                "ip": "192.168.1.161",
            },
        ]

    def _generate_mock_storage(self) -> List[Dict[str, Any]]:
        return [
            {
                "storage": "local",
                "type": "dir",
                "content": "iso,vztmpl,backup",
                "total": 104857600000,
                "used": 34567890000,
                "avail": 70289710000,
                "active": 1,
                "enabled": 1,
            },
            {
                "storage": "local-lvm",
                "type": "lvmthin",
                "content": "rootdir,images",
                "total": 407252590592,
                "used": 94281128880,
                "avail": 312971461712,
                "active": 1,
                "enabled": 1,
            },
        ]

    def _generate_mock_rrd(self) -> List[Dict[str, Any]]:
        now = int(time.time())
        points = []
        # Generate 30 data points representing the last 30 intervals (30s each, matching screenshot)
        base_cpu = 0.038
        for i in range(30):
            t = now - ((29 - i) * 30)
            # Subtle variation
            noise = (math.sin(i / 3.0) * 0.012) + (random.uniform(-0.005, 0.005))
            cpu_val = max(0.015, min(0.095, base_cpu + noise))
            user_cpu = cpu_val * 0.65
            sys_cpu = cpu_val * 0.30
            iowait = max(0.001, cpu_val * 0.05)
            idle = max(0.0, 1.0 - (user_cpu + sys_cpu + iowait))

            mem_used = 11166914560 + int(math.sin(i / 4.0) * 80000000)
            mem_cache = 2147483648 + int(math.cos(i / 5.0) * 30000000)
            mem_buffer = 314572800
            mem_total = 16535552000
            mem_free = mem_total - mem_used

            time_str = time.strftime("%H:%M:%S", time.localtime(t))
            points.append({
                "time": t,
                "formatted_time": time_str,
                "cpu": round(cpu_val * 100, 2),
                "user": round(user_cpu * 100, 2),
                "system": round(sys_cpu * 100, 2),
                "iowait": round(iowait * 100, 2),
                "idle": round(idle * 100, 2),
                "mem_total_gib": round(mem_total / (1024**3), 2),
                "mem_used_gib": round(mem_used / (1024**3), 2),
                "mem_cache_gib": round(mem_cache / (1024**3), 2),
                "mem_buffer_gib": round(mem_buffer / (1024**3), 2),
                "mem_free_gib": round(mem_free / (1024**3), 2),
                "swap_used_gib": 0.0,
                "swap_total_gib": 8.0,
            })
        return points

proxmox_service = ProxmoxService()
