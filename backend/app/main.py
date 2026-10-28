import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.routers import auth, proxmox, docker_router, database_router, diagnostics, bots_router
from backend.app.config import settings

app = FastAPI(
    title="SaintDash API",
    description="Proxmox VE & Node Infrastructure Telemetry Dashboard",
    version="1.0.0",
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(proxmox.router)
app.include_router(docker_router.router)
app.include_router(database_router.router)
app.include_router(diagnostics.router)
app.include_router(bots_router.router)

# Serve built frontend in production if dist directory exists
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "name": "SaintDash Telemetry API",
            "status": "online",
            "docs": "/docs",
            "message": "Frontend not built yet. Run 'npm run build' in frontend/ or run Vite dev server.",
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
