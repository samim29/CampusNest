# database.py
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, ForeignKey,
    Boolean, Date, DateTime, Float, Enum, JSON, DECIMAL
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import enum
import os

# ============================================================
# DATABASE CONFIGURATION
# ============================================================

# Default: SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///campusnest.db")

# Future-ready: PostgreSQL example
# DATABASE_URL = "postgresql+psycopg2://user:password@localhost/campusnest"

# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # set True for SQL debugging
    future=True,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create a session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

# Base class for all ORM models
Base = declarative_base()


# ============================================================
# ENUM DEFINITIONS
# ============================================================

class UserType(enum.Enum):
    student = "student"
    owner = "owner"
    admin = "admin"


class UserStatus(enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending_verification = "pending_verification"


class PropertyType(enum.Enum):
    pg = "pg"
    hostel = "hostel"
    apartment = "apartment"
    room = "room"


class GenderPreference(enum.Enum):
    male = "male"
    female = "female"
    coed = "co-ed"


# ============================================================
# MODEL DEFINITIONS
# ============================================================

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    short_name = Column(String(50))
    type = Column(Enum("university", "college", "institute", name="college_type"), nullable=False)

    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(10))
    country = Column(String(100), default="India")
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))

    phone = Column(String(15))
    email = Column(String(255))
    website_url = Column(Text)

    established_year = Column(Integer)
    affiliation = Column(String(255))
    accreditation = Column(JSON)
    courses_offered = Column(JSON)
    total_students = Column(Integer)

    verified = Column(Boolean, default=False)
    status = Column(Enum("active", "inactive", name="college_status"), default="active")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="college", cascade="all, delete-orphan")
    pg_listings = relationship("PGListing", back_populates="college", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<College(name='{self.name}', city='{self.city}')>"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(15), unique=True)
    password_hash = Column(String(255), nullable=False)

    user_type = Column(Enum(UserType), default=UserType.student)
    status = Column(Enum(UserStatus), default=UserStatus.pending_verification)

    full_name = Column(String(255), nullable=False)
    profile_picture_url = Column(Text)
    date_of_birth = Column(Date)
    gender = Column(Enum("male", "female", "other", name="gender_type"))

    college_id = Column(Integer, ForeignKey("colleges.id"))
    course = Column(String(255))
    year_of_study = Column(Integer)
    graduation_year = Column(Integer)

    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)

    notification_preferences = Column(JSON, default={"email": True, "sms": False, "push": True})
    privacy_settings = Column(JSON, default={"profile_visible": True, "contact_visible": False})
    language_preference = Column(String(10), default="en")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    college = relationship("College", back_populates="users")
    pg_listings = relationship("PGListing", back_populates="owner")
    safety_reports = relationship("SafetyReport", back_populates="reporter")

    def __repr__(self):
        return f"<User(username='{self.username}', type='{self.user_type.value}')>"


class PGListing(Base):
    __tablename__ = "pg_listings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)

    name = Column(String(255), nullable=False)
    description = Column(Text)
    property_type = Column(Enum(PropertyType), default=PropertyType.pg)
    gender_preference = Column(Enum(GenderPreference), nullable=False)

    address = Column(Text, nullable=False)
    area = Column(String(100))
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(10))

    base_price = Column(Integer, nullable=False)
    discounted_price = Column(Integer)
    discount_percentage = Column(Float)
    security_deposit = Column(Integer)

    total_rooms = Column(Integer, nullable=False)
    total_beds = Column(Integer, nullable=False)
    occupied_rooms = Column(Integer, default=0)
    occupied_beds = Column(Integer, default=0)

    basic_amenities = Column(JSON)
    comfort_amenities = Column(JSON)
    safety_features = Column(JSON)

    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    verified = Column(Boolean, default=False)

    status = Column(Enum("active", "inactive", "pending_approval", "suspended", name="pg_status"),
                    default="pending_approval")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="pg_listings")
    college = relationship("College", back_populates="pg_listings")

    def __repr__(self):
        return f"<PGListing(name='{self.name}', city='{self.city}', price={self.base_price})>"


class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_name = Column(String(255), default="Anonymous")
    description = Column(Text, nullable=False)
    priority = Column(Enum("low", "medium", "high", name="report_priority"), default="medium")
    status = Column(Enum("pending", "investigating", "resolved", name="report_status"), default="pending")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reporter = relationship("User", back_populates="safety_reports")

    def __repr__(self):
        return f"<SafetyReport(type='{self.type}', status='{self.status}', priority='{self.priority}')>"


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def init_db():
    """Initialize all database tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency generator for FastAPI or general use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# MAIN (For Direct Run)
# ============================================================

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized successfully.")

