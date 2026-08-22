#!/usr/bin/env python3
"""Signed Cloudinary uploads for Divasya media. Creds come from .env.local
(CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET) so nothing lives in code.

  python3 scripts/upload-to-cloudinary.py <src> <public_id>
  python3 scripts/upload-to-cloudinary.py --stdin        # lines: src<TAB>public_id

<src> is a local file path or an https URL (Cloudinary fetches URLs itself).
Prints one line per upload: <public_id>\t<delivery_url> (f_auto,q_auto baked
in) or FAIL\t<public_id>\t<reason>. Signed uploads overwrite on repeat, so
re-running is safe. Pass --video before the args for video files."""
import hashlib, json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def env():
    out = {}
    with open(os.path.join(ROOT, ".env.local")) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, _, v = line.partition("=")
                out[k.strip()] = v.strip()
    return out

E = env()
CLOUD, KEY, SECRET = E["CLOUDINARY_CLOUD_NAME"], E["CLOUDINARY_API_KEY"], E["CLOUDINARY_API_SECRET"]

def upload(src, public_id, kind="image"):
    ts = str(int(time.time()))
    sig = hashlib.sha1(f"public_id={public_id}&timestamp={ts}{SECRET}".encode()).hexdigest()
    file_arg = src if src.startswith("http") else f"@{src}"
    r = subprocess.run(
        ["curl", "-s", "--max-time", "120",
         "-F", f"file={file_arg}", "-F", f"api_key={KEY}",
         "-F", f"timestamp={ts}", "-F", f"public_id={public_id}",
         "-F", f"signature={sig}",
         f"https://api.cloudinary.com/v1_1/{CLOUD}/{kind}/upload"],
        capture_output=True, text=True)
    try:
        j = json.loads(r.stdout)
    except Exception:
        return None, f"bad response: {r.stdout[:120]}"
    if "secure_url" not in j:
        return None, j.get("error", {}).get("message", r.stdout[:120])
    # q_auto picks compression, f_auto serves avif/webp to phones that take it
    return j["secure_url"].replace("/upload/", "/upload/f_auto,q_auto/"), None

def main():
    argv = [a for a in sys.argv[1:] if a != "--video"]
    kind = "video" if "--video" in sys.argv else "image"
    if argv and argv[0] == "--stdin":
        jobs = [line.rstrip("\n").split("\t") for line in sys.stdin if "\t" in line]
        def run(j):
            url, err = upload(j[0], j[1], kind)
            print(f"FAIL\t{j[1]}\t{err}" if err else f"{j[1]}\t{url}", flush=True)
        with ThreadPoolExecutor(8) as ex:
            list(ex.map(run, jobs))
    elif len(argv) == 2:
        url, err = upload(argv[0], argv[1], kind)
        if err:
            print(f"FAIL\t{argv[1]}\t{err}"); sys.exit(1)
        print(f"{argv[1]}\t{url}")
    else:
        print(__doc__); sys.exit(2)

if __name__ == "__main__":
    main()
