#!/usr/bin/env python3
import json
from werkzeug.security import generate_password_hash
from sqlalchemy.orm import Session

from backend.api.database import (
    SessionLocal,
    init_db,
    User,
    College,
    PGListing,
    SafetyReport,
    UserType,
    UserStatus,
    GenderPreference,
    PropertyType,
)

# ============================================================
# USER SEED
# ============================================================

def seed_users(db: Session):
    demo = db.query(User).filter(User.username == "demo").first()
    if not demo:
        user = User(
            username="demo",
            email="demo@campusconnect.com",
            phone="9999999999",
            password_hash=generate_password_hash("demo1234"),
            user_type=UserType.admin,
            status=UserStatus.active,
            full_name="Demo Admin",
            email_verified=True,
        )
        db.add(user)

    owner = db.query(User).filter(User.username == "pgowner").first()
    if not owner:
        owner_user = User(
            username="pgowner",
            email="owner@campusconnect.com",
            phone="9999999998",
            password_hash=generate_password_hash("owner1234"),
            user_type=UserType.owner,
            status=UserStatus.active,
            full_name="PG Owner Demo",
            email_verified=True,
        )
        db.add(owner_user)

    db.commit()


# ============================================================
# COLLEGE SEED
# ============================================================

def seed_colleges(db: Session):
    if db.query(College).count() > 0:
        return

    colleges = [
        College(
            name="ABC Engineering College",
            short_name="ABC",
            type="college",
            address="Andheri East",
            city="Mumbai",
            state="Maharashtra",
            latitude=19.0760,
            longitude=72.8777,
            verified=True,
        ),
        College(
            name="XYZ Medical College",
            short_name="XYZ",
            type="college",
            address="North Campus",
            city="Delhi",
            state="Delhi",
            latitude=28.7041,
            longitude=77.1025,
            verified=True,
        ),
    ]

    db.add_all(colleges)
    db.commit()


# ============================================================
# PG LISTING SEED
# ============================================================

def seed_pg_listings(db: Session):
    if db.query(PGListing).count() > 0:
        return

    owner = db.query(User).filter(User.username == "pgowner").first()
    college = db.query(College).first()

    listings = [
        PGListing(
            owner_id=owner.id,
            college_id=college.id,
            name="Sunrise Boys PG",
            description="A comfortable PG with all modern amenities",
            property_type=PropertyType.pg,
            gender_preference=GenderPreference.male,
            address="Mukherjee Nagar",
            area="North Delhi",
            city="Delhi",
            state="Delhi",
            base_price=12000,
            total_rooms=10,
            total_beds=20,
            basic_amenities=["Wi-Fi", "Meals"],
            comfort_amenities=["AC", "Parking"],
            safety_features=["CCTV", "Security Guard"],
            average_rating=4.5,
            total_reviews=23,
            verified=True,
            status="active",
        ),
        PGListing(
            owner_id=owner.id,
            college_id=college.id,
            name="Green Valley Girls PG",
            description="Safe and affordable PG for girls",
            property_type=PropertyType.pg,
            gender_preference=GenderPreference.female,
            address="Kamla Nagar",
            area="North Delhi",
            city="Delhi",
            state="Delhi",
            base_price=10000,
            total_rooms=8,
            total_beds=16,
            basic_amenities=["Wi-Fi", "Meals"],
            safety_features=["Biometric Entry", "CCTV"],
            average_rating=4.2,
            total_reviews=18,
            verified=True,
            status="active",
        ),
    ]

    db.add_all(listings)
    db.commit()


def seed_safety_reports(db: Session):
    if db.query(SafetyReport).count() > 0:
        return

    reports = [
        SafetyReport(
            type="Ragging Incident",
            location="Campus Central Mess",
            reporter_name="Anonymous",
            description="Inappropriate behavior by seniors during mess hours",
            priority="high",
            status="investigating",
        ),
        SafetyReport(
            type="Safety Concern",
            location="Parking Area Block B",
            reporter_name="Student ID: ST001",
            description="Poor lighting in parking area causing safety issues",
            priority="medium",
            status="resolved",
        ),
        SafetyReport(
            type="Infrastructure Issue",
            location="Library Reading Room",
            reporter_name="Anonymous",
            description="Air conditioning not working properly",
            priority="low",
            status="pending",
        ),
    ]

    db.add_all(reports)
    db.commit()


# ============================================================
# MAIN
# ============================================================

def main():
    print("Initializing database...")
    init_db()

    db = SessionLocal()
    try:
        seed_users(db)
        seed_colleges(db)
        seed_pg_listings(db)
        seed_safety_reports(db)
        print("Seed data inserted successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
