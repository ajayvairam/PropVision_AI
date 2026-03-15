"""
End-to-end test: Signup → Login → Upload bedroom.png → My Images → Stats → Search
"""
import urllib.request
import urllib.error
import json
import uuid
import os
import io

BASE_URL = "http://127.0.0.1:8000"
test_username = f"imgtest_{uuid.uuid4().hex[:6]}"
test_password = "password123"
BEDROOM_PATH = os.path.join(os.path.dirname(__file__), "..", "bedroom.png")

def api_json(method, endpoint, data=None, headers=None):
    if headers is None:
        headers = {}
    body = None
    if data:
        body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body

def multipart_upload(endpoint, file_path, headers=None):
    """Upload a file using multipart/form-data (manual construction)."""
    if headers is None:
        headers = {}
    boundary = uuid.uuid4().hex
    filename = os.path.basename(file_path)
    
    with open(file_path, 'rb') as f:
        file_data = f.read()
    
    body = b''
    body += f'--{boundary}\r\n'.encode()
    body += f'Content-Disposition: form-data; name="files"; filename="{filename}"\r\n'.encode()
    body += b'Content-Type: image/png\r\n\r\n'
    body += file_data
    body += f'\r\n--{boundary}--\r\n'.encode()
    
    headers['Content-Type'] = f'multipart/form-data; boundary={boundary}'
    
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(res_body)
        except:
            return e.code, res_body

# Check bedroom.png exists
if not os.path.exists(BEDROOM_PATH):
    print(f"ERROR: bedroom.png not found at {BEDROOM_PATH}")
    exit(1)
print(f"Found bedroom.png ({os.path.getsize(BEDROOM_PATH)} bytes)")
print(f"Test user: {test_username}\n")

# 1) Signup
print("=" * 60)
print("1. SIGNUP")
print("=" * 60)
code, res = api_json("POST", "/signup", {"username": test_username, "password": test_password, "confirm_password": test_password})
print(f"   Status: {code}")
if code != 200:
    print(f"   ERROR: {res}")
    exit(1)
token = res["access_token"]
print(f"   Token: {token[:30]}...")
print(f"   Username: {res['username']}")
print()

auth = {"Authorization": f"Bearer {token}"}

# 2) Upload bedroom.png
print("=" * 60)
print("2. UPLOAD bedroom.png")
print("=" * 60)
code, res = multipart_upload("/upload", BEDROOM_PATH, headers=dict(auth))
print(f"   Status: {code}")
if code == 200:
    print(f"   Message: {res.get('message')}")
    for img in res.get("images", []):
        print(f"   --- Image Result ---")
        print(f"   ID:               {img.get('id')}")
        print(f"   Room Type:        {img.get('room_type')}")
        print(f"   Confidence:       {img.get('confidence_score')}")
        print(f"   Detected Objects: {img.get('detected_objects')}")
        print(f"   File URL:         {img.get('file_url')}")
else:
    print(f"   ERROR: {res}")
print()

# 3) My Images
print("=" * 60)
print("3. GET /my-images")
print("=" * 60)
code, res = api_json("GET", "/my-images", headers=auth)
print(f"   Status: {code}")
print(f"   Total images: {len(res) if isinstance(res, list) else 'N/A'}")
if isinstance(res, list):
    for img in res:
        print(f"   - {img.get('room_type')} (confidence: {img.get('confidence_score')})")
print()

# 4) Stats
print("=" * 60)
print("4. GET /stats")
print("=" * 60)
code, res = api_json("GET", "/stats", headers=auth)
print(f"   Status: {code}")
if isinstance(res, dict):
    for k, v in res.items():
        print(f"   {k}: {v}")
print()

# 5) Search for "bedroom"
print("=" * 60)
print("5. SEARCH 'bedroom'")
print("=" * 60)
code, res = api_json("GET", "/search?query=bedroom", headers=auth)
print(f"   Status: {code}")
if isinstance(res, dict):
    print(f"   Query: {res.get('query')}")
    print(f"   Results: {len(res.get('results', []))}")
    for img in res.get('results', []):
        print(f"   - {img.get('room_type')} (confidence: {img.get('confidence_score')})")
print()

print("=" * 60)
print("ALL TESTS COMPLETE!")
print("=" * 60)
