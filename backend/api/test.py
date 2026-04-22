#!/usr/bin/env python3
"""
Automated API tester for CampusNest Flask backend.
Make sure your app.py is running locally on port 3001 before running this.
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:3001/api"

# Utility print helper
def log(title, data=None):
    print(f"\n=== {title} ===")
    if data is not None:
        if isinstance(data, (dict, list)):
            print(json.dumps(data, indent=2))
        else:
            print(data)


def test_health():
    r = requests.get(f"{BASE_URL}/health")
    log("Health Check", r.json())
    assert r.status_code == 200


def test_register():
    payload = {
        "email": f"user{int(time.time())}@test.com",
        "password": "password123",
        "username": "testuser",
        "name": "Test User"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=payload)
    log("Register", r.json())
    assert r.status_code in (201, 409)  # 409 if already exists
    return payload["email"], payload["password"]


def test_login(email, password):
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    log("Login", r.json())
    assert r.status_code == 200
    data = r.json()
    return data["access_token"], data["refresh_token"]


def test_refresh(refresh_token):
    headers = {"Authorization": f"Bearer {refresh_token}"}
    r = requests.post(f"{BASE_URL}/auth/refresh", headers=headers)
    log("Refresh", r.json())
    assert r.status_code == 200
    return r.json()["access_token"]


def test_get_profile(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get(f"{BASE_URL}/user/profile", headers=headers)
    log("Get Profile", r.json())
    assert r.status_code == 200


def test_update_profile(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {"full_name": "Updated Test User", "language_preference": "en"}
    r = requests.put(f"{BASE_URL}/user/profile", headers=headers, json=payload)
    log("Update Profile", r.json())
    assert r.status_code in (200, 409)


def test_list_pgs():
    r = requests.get(f"{BASE_URL}/pgs")
    log("List PGs", r.json())
    assert r.status_code == 200
    data = r.json()
    if data:
        return data[0]["id"]
    return None


def test_get_pg(pg_id):
    if pg_id is None:
        print("\n(No PGs found, skipping get_pg test)")
        return
    r = requests.get(f"{BASE_URL}/pgs/{pg_id}")
    log(f"Get PG {pg_id}", r.json())
    assert r.status_code == 200


def test_list_colleges():
    r = requests.get(f"{BASE_URL}/colleges")
    log("List Colleges", r.json())
    assert r.status_code == 200


def test_search(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {"query": "test"}
    r = requests.post(f"{BASE_URL}/search", headers=headers, json=payload)
    log("Search", r.json())
    assert r.status_code == 200


def test_create_booking(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {
        "pg_id": 1,
        "start_date": "2025-11-05",
        "duration_months": 6,
        "note": "Testing booking"
    }
    r = requests.post(f"{BASE_URL}/bookings", headers=headers, json=payload)
    log("Create Booking", r.json())
    assert r.status_code == 201


# ============================================================
# MAIN TEST RUNNER
# ============================================================

if __name__ == "__main__":
    print("🚀 Starting API tests...")

    test_health()
    email, password = test_register()
    access, refresh = test_login(email, password)
    new_access = test_refresh(refresh)

    test_get_profile(new_access)
    test_update_profile(new_access)

    pg_id = test_list_pgs()
    test_get_pg(pg_id)

    test_list_colleges()
    test_search(new_access)
    test_create_booking(new_access)

    print("\n✅ All tests completed.")

