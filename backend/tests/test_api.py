import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings

client = TestClient(app)

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={"password": "wrongpassword"})
    assert response.status_code == 401

def test_login_success_and_verify():
    # Login with default configured password
    response = client.post("/api/auth/login", json={"password": settings.DASHBOARD_PASSWORD})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]

    # Verify token
    headers = {"Authorization": f"Bearer {token}"}
    verify_resp = client.get("/api/auth/verify", headers=headers)
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True

def test_unauthorized_endpoints():
    response = client.get("/api/proxmox/summary")
    assert response.status_code == 401

def test_proxmox_summary_endpoint():
    # Obtain token
    login_resp = client.post("/api/auth/login", json={"password": settings.DASHBOARD_PASSWORD})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch summary
    summary_resp = client.get("/api/proxmox/summary", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert "cpu" in summary
    assert "ram" in summary
    assert "workloads" in summary
    assert "uptime" in summary
    assert summary["cpu"]["cores_total"] > 0
    assert summary["ram"]["total_gib"] > 0

def test_workloads_endpoints():
    login_resp = client.post("/api/auth/login", json={"password": settings.DASHBOARD_PASSWORD})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    vms_resp = client.get("/api/proxmox/vms", headers=headers)
    assert vms_resp.status_code == 200
    assert isinstance(vms_resp.json(), list)

    lxc_resp = client.get("/api/proxmox/lxc", headers=headers)
    assert lxc_resp.status_code == 200
    assert isinstance(lxc_resp.json(), list)

    docker_resp = client.get("/api/docker/containers", headers=headers)
    assert docker_resp.status_code == 200
    assert isinstance(docker_resp.json(), list)

def test_database_metrics_endpoint():
    login_resp = client.post("/api/auth/login", json={"password": settings.DASHBOARD_PASSWORD})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    db_resp = client.get("/api/database/metrics", headers=headers)
    assert db_resp.status_code == 200
    db_data = db_resp.json()
    assert "metrics" in db_data
    assert "nodes" in db_data
    assert db_data["metrics"]["cache_hit_ratio_pct"] > 90

def test_frontend_spa_serving():
    # If dist exists, root should return the index.html
    resp = client.get("/")
    assert resp.status_code == 200

