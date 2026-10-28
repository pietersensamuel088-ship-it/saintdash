from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from backend.app.auth import verify_token
from backend.app.services.docker_service import docker_service

router = APIRouter(prefix="/api/docker", tags=["docker"])

@router.get("/containers")
def list_containers(user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    return docker_service.get_containers()

@router.get("/status")
def docker_status(user: dict = Depends(verify_token)) -> Dict[str, Any]:
    connected = docker_service.is_connected()
    return {
        "connected": connected,
        "engine": "Docker Engine" if connected else "Simulated Docker Engine",
    }
