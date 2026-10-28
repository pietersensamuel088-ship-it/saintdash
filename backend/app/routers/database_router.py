from typing import Any, Dict
from fastapi import APIRouter, Depends
from backend.app.auth import verify_token
from backend.app.services.database_service import database_service

router = APIRouter(prefix="/api/database", tags=["database"])

@router.get("/metrics")
def get_database_metrics(user: dict = Depends(verify_token)) -> Dict[str, Any]:
    return database_service.get_database_metrics()
