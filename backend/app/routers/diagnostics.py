from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import requests
import urllib3
from backend.app.auth import verify_token
from backend.app.services.proxmox import proxmox_service

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
router = APIRouter(prefix="/api/diagnostics", tags=["diagnostics"])

class TestConfigRequest(BaseModel):
    proxmox_host: str
    proxmox_user: str
    token_name: str
    token_value: str
    verify_ssl: bool = False

@router.get("/proxmox")
def test_current_proxmox(user: dict = Depends(verify_token)) -> Dict[str, Any]:
    return proxmox_service.test_connection()

@router.post("/test-config")
def test_custom_config(payload: TestConfigRequest, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Allows testing arbitrary Proxmox connection details from the Settings UI."""
    try:
        url = f"{payload.proxmox_host.rstrip('/')}/api2/json/version"
        auth_header = f"PVEAPIToken={payload.proxmox_user}!{payload.token_name}={payload.token_value}"
        resp = requests.get(
            url,
            headers={"Authorization": auth_header, "Accept": "application/json"},
            verify=payload.verify_ssl,
            timeout=4.0,
        )
        if resp.status_code == 200:
            data = resp.json().get("data", {})
            return {
                "success": True,
                "version": data.get("version"),
                "release": data.get("release"),
                "message": f"Success! Connected to Proxmox VE {data.get('release', '')}",
            }
        else:
            return {
                "success": False,
                "message": f"Server returned HTTP {resp.status_code}: {resp.text[:120]}",
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Connection failed: {str(e)}",
        }
