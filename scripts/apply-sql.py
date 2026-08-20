#!/usr/bin/env python3
"""Apply a .sql file (or read a query) against the production database via the
Supabase Management API. Credentials come from .env.local at runtime — nothing
secret lives in this file.

    python3 scripts/apply-sql.py supabase/migrations/0NN_name.sql
    python3 scripts/apply-sql.py <(echo "select count(*) from temples;")
"""
import json, os, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_env():
    env = {}
    with open(os.path.join(ROOT, ".env.local")) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def main():
    env = load_env()
    with open(sys.argv[1]) as f:
        sql = f.read()
    url = f"https://api.supabase.com/v1/projects/{env['SUPABASE_PROJECT_REF']}/database/query"
    req = urllib.request.Request(url, data=json.dumps({"query": sql}).encode(), method="POST", headers={
        "Authorization": f"Bearer {env['SUPABASE_ACCESS_TOKEN']}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) supabase-cli/divasya",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            out = r.read().decode()
            print(f"OK {r.status}")
            print(out[:1200] if out.strip() not in ("", "[]") else "(no rows returned)")
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}")
        print(e.read().decode()[:1500])
        sys.exit(1)

if __name__ == "__main__":
    main()
