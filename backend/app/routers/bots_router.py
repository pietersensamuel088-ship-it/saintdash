from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.app.auth import verify_token
from backend.app.services.discord_service import discord_service

router = APIRouter(prefix="/api/bots", tags=["discord_bots"])

class UpdateBotRequest(BaseModel):
    name: str
    tag: str

@router.get("")
def list_bots(user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    """Returns all 4 Discord bots linked directly to your Proxmox VM host (no tokens needed)."""
    return discord_service.get_bots()

@router.put("/{bot_id}")
def update_bot(bot_id: str, payload: UpdateBotRequest, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Allows user to customize their bot names and roles directly."""
    return discord_service.update_bot_profile(bot_id, payload.name, payload.tag)

@router.post("/{bot_id}/restart")
def restart_bot(bot_id: str, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Restarts a specific bot container or VM signal."""
    return discord_service.restart_bot(bot_id)
