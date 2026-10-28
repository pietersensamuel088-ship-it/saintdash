import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Security
    JWT_SECRET: str = "saintdash-super-secret-key-replace-in-production-env"
    DASHBOARD_PASSWORD: str = "admin123"
    JWT_EXPIRE_HOURS: int = 72

    # Proxmox VE API
    PROXMOX_HOST: Optional[str] = None
    PROXMOX_USER: Optional[str] = None
    PROXMOX_TOKEN_NAME: Optional[str] = None
    PROXMOX_TOKEN_VALUE: Optional[str] = None
    PROXMOX_VERIFY_SSL: bool = False

    # Docker
    DOCKER_HOST_SOCKET: str = "unix:///var/run/docker.sock"
    DOCKER_ENABLED: bool = True

    # Database & Supabase
    DATABASE_URL: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # App
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEMO_MODE: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
