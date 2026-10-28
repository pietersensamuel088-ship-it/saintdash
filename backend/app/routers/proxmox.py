from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from backend.app.auth import verify_token
from backend.app.services.proxmox import proxmox_service
from backend.app.services.docker_service import docker_service

router = APIRouter(prefix="/api/proxmox", tags=["proxmox"])

@router.get("/summary")
def get_cluster_summary(user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Generates the primary top-level telemetry metrics matching the dashboard view."""
    nodes = proxmox_service.get_nodes()
    vms = proxmox_service.get_vms()
    lxc = proxmox_service.get_lxc()
    docker_containers = docker_service.get_containers()

    total_cpu_cores = 0
    total_cpu_used_pct = 0.0
    total_mem_bytes = 0
    used_mem_bytes = 0
    primary_uptime = 0
    online_nodes = 0

    for n in nodes:
        if n.get("status") == "online":
            online_nodes += 1
            cores = n.get("maxcpu", 0)
            total_cpu_cores += cores
            cpu_ratio = n.get("cpu", 0.0)
            # Weighted cpu usage
            total_cpu_used_pct += cpu_ratio * 100
            total_mem_bytes += n.get("maxmem", 0)
            used_mem_bytes += n.get("mem", 0)
            if n.get("uptime", 0) > primary_uptime:
                primary_uptime = n.get("uptime", 0)

    avg_cpu_pct = round(total_cpu_used_pct / max(online_nodes, 1), 2)
    mem_used_pct = round((used_mem_bytes / max(total_mem_bytes, 1)) * 100, 2)
    cpu_cores_used = round((avg_cpu_pct / 100.0) * total_cpu_cores, 3)

    running_vms = sum(1 for v in vms if v.get("status") == "running")
    running_lxc = sum(1 for l in lxc if l.get("status") == "running")
    running_docker = sum(1 for d in docker_containers if d.get("status") == "running")
    total_workloads_count = len(vms) + len(lxc) + len(docker_containers)
    running_workloads_count = running_vms + running_lxc + running_docker

    # Format uptime in hours and days
    hours = round(primary_uptime / 3600.0, 2)

    return {
        "cluster": {
            "online_nodes": online_nodes,
            "total_nodes": len(nodes),
        },
        "cpu": {
            "usage_pct": avg_cpu_pct,
            "cores_used": cpu_cores_used,
            "cores_total": total_cpu_cores,
        },
        "ram": {
            "usage_pct": mem_used_pct,
            "used_bytes": used_mem_bytes,
            "total_bytes": total_mem_bytes,
            "used_gib": round(used_mem_bytes / (1024**3), 2),
            "total_gib": round(total_mem_bytes / (1024**3), 2),
        },
        "workloads": {
            "total_count": total_workloads_count,
            "running_count": running_workloads_count,
            "vms_count": len(vms),
            "lxc_count": len(lxc),
            "docker_count": len(docker_containers),
        },
        "uptime": {
            "seconds": primary_uptime,
            "hours": hours,
            "formatted": f"{hours} hour" if hours < 24 else f"{round(hours / 24, 1)} days",
        },
        "is_live_proxmox": proxmox_service.is_configured,
    }

@router.get("/nodes")
def list_nodes(user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    return proxmox_service.get_nodes()

@router.get("/nodes/{node}/status")
def get_node_details(node: str, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    return proxmox_service.get_node_status(node)

@router.get("/vms")
def list_vms(node: Optional[str] = None, user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    return proxmox_service.get_vms(node)

@router.get("/lxc")
def list_lxc(node: Optional[str] = None, user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    return proxmox_service.get_lxc(node)

@router.get("/storage")
def list_storage(node: str = "pve", user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    return proxmox_service.get_storage(node)

@router.get("/rrd")
def get_rrd_telemetry(
    node: str = "pve",
    timeframe: str = Query("hour", pattern="^(hour|day|week|month|year)$"),
    user: dict = Depends(verify_token),
) -> List[Dict[str, Any]]:
    return proxmox_service.get_rrd_data(node=node, timeframe=timeframe)
