from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from backend.app.auth import verify_token
from backend.app.services.discord_service import discord_service

router = APIRouter(prefix="/api/bots", tags=["discord_bots"])

@router.get("")
def list_bots(user: dict = Depends(verify_token)) -> List[Dict[str, Any]]:
    """Returns all monitored Discord bots with live status and metrics."""
    return discord_service.get_bots()

@router.post("/{bot_id}/restart")
def restart_bot(bot_id: str, user: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Restarts a specific bot container or instance."""
    return discord_service.restart_bot(bot_id)
