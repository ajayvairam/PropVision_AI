import urllib.request, json
data = json.dumps({'username': 'testuser', 'password': 'password123', 'confirm_password': 'password123'}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/signup', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(e)
