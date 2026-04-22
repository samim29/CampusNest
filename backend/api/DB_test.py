#!/usr/bin/env python3
import os
import time
import psycopg2
import numpy as np
from pgvector.psycopg2 import register_vector
import pgai  # PGAI Python client

# 📊 Adjust as needed:
DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_PORT   = os.getenv("DB_PORT", "5432")
DB_NAME   = os.getenv("DB_NAME", "test")
DB_USER   = os.getenv("DB_USER", "postgres")
DB_PASS   = os.getenv("DB_PASS", "password")
DB_URL    = f"postgresql://{DB_USER}:{DB_PASS}@{DB_SERVER}:{DB_PORT}/{DB_NAME}"

def create_database():
    conn = psycopg2.connect(dbname=DB_NAME,
                            user=DB_USER,
                            password=DB_PASS,
                            host=DB_SERVER,
                            port=DB_PORT)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(f"SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,))
    if not cur.fetchone():
        cur.execute(f"CREATE DATABASE {DB_NAME};")
        print(f"Database '{DB_NAME}' created")
    else:
        print(f"Database '{DB_NAME}' already exists")
    conn.close()

def install_extensions_and_setup():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    register_vector(conn)  # important for <=> comparisons

    cur = conn.cursor()
    # install extensions
    cur.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    cur.execute("CREATE EXTENSION IF NOT EXISTS vectorscale;")
    cur.execute("CREATE EXTENSION IF NOT EXISTS timescaledb_toolkit;")

    # create test table
    cur.execute("DROP TABLE IF EXISTS test_snippet;")
    cur.execute("""
    CREATE TABLE test_snippet(
      id SERIAL,
      v vector(3),
      ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id, ts)
    );
    """)
    # convert to hypertable
    cur.execute("SELECT create_hypertable('test_snippet','ts', chunk_time_interval => INTERVAL '1 day');")

    # seed table
    rows = [(np.array([0.0,0.0,0.0], dtype=np.float32),),
            (np.array([1.0,0.0,0.0], dtype=np.float32),),
            (np.array([0.0,1.0,0.0], dtype=np.float32),)]
    cur.executemany("INSERT INTO test_snippet (v) VALUES (%s);", rows)

    # create diskann index
    cur.execute("CREATE INDEX IF NOT EXISTS idx_test_snippet_v ON test_snippet USING diskann (v);")

    conn.close()
    print("✅ Basics & hypertable setup complete")




if __name__ == "__main__":
    create_database()
    print("Waiting 1 second to allow DB server to be ready...")
    time.sleep(1)
    install_extensions_and_setup()


