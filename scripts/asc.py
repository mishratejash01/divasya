"""App Store Connect API client. Credentials come from .env.local
(ASC_ISSUER_ID / ASC_KEY_ID / ASC_KEY_PATH) so nothing secret lives in the repo.

Usage:  python3 scripts/asc.py GET /v1/apps
        from asc import get, post, patch      (when imported)
"""
import json, os, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://api.appstoreconnect.apple.com"

def _env():
    out = {}
    with open(os.path.join(ROOT, ".env.local")) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, _, v = line.partition("=")
                out[k.strip()] = v.strip()
    return out

def token():
    import jwt as pyjwt
    e = _env()
    with open(e["ASC_KEY_PATH"]) as f:
        key = f.read()
    now = int(time.time())
    return pyjwt.encode(
        {"iss": e["ASC_ISSUER_ID"], "iat": now, "exp": now + 1100, "aud": "appstoreconnect-v1"},
        key, algorithm="ES256", headers={"kid": e["ASC_KEY_ID"], "typ": "JWT"})

def req(method, path, body=None):
    url = path if path.startswith("http") else BASE + path
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {token()}",
        **({"Content-Type": "application/json"} if body is not None else {}),
    })
    try:
        with urllib.request.urlopen(r, timeout=120) as resp:
            t = resp.read()
            return json.loads(t) if t else None
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()}")

def get(path): return req("GET", path)
def post(path, body): return req("POST", path, body)
def patch(path, body): return req("PATCH", path, body)
def delete(path): return req("DELETE", path)

if __name__ == "__main__":
    method, path = (sys.argv[1].upper(), sys.argv[2]) if len(sys.argv) > 2 else ("GET", sys.argv[1])
    body = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None
    print(json.dumps(req(method, path, body), indent=1))
