import json, requests

with open('menu_data.json') as f:
    items = json.load(f)

resp = requests.post('http://localhost:3000/api/menu/sync',
    json={"items": items, "secret": "dev-secret"},
    headers={"Content-Type": "application/json"})
print(resp.json())