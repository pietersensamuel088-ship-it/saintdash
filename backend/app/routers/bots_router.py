from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from backend.app.auth import verify_token
from backend.app.services.discord_service import discord_service

router = APIRouter(prefix="/api/bots", tags=["discord_bots"])

class UpdateBotRequest(BaseModel):
    name: str
    tag: str

class SyncTokensRequest(BaseModel):
    tokens: List[str]

@router.get("")
def list_bots(user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    """Returns Discord bots with live Gateway telemetry if tokens are configured, or VM-linked status."""
    return discord_service.get_bots()

@router.post("/sync-tokens")
def sync_tokens(payload: SyncTokensRequest, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Allows submitting Discord bot tokens dynamically from the dashboard UI."""
    discord_service.set_tokens(payload.tokens)
    return {
        "success": True,
        "count": len(payload.tokens),
        "message": f"Successfully synced {len(payload.tokens)} Discord bot tokens",
    }

@router.put("/{bot_id}")
def update_bot(bot_id: str, payload: UpdateBotRequest, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Allows user to customize bot names and roles."""
    return discord_service.update_bot_profile(bot_id, payload.name, payload.tag)

@router.post("/{bot_id}/restart")
def restart_bot(bot_id: str, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Restarts a specific bot container or VM signal."""
    return discord_service.restart_bot(bot_id)
