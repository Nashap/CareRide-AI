import requests

url = "http://127.0.0.1:8000/api/ai/recommend-helper/"

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgyMjgwNjgwLCJpYXQiOjE3ODIxOTQyODAsImp0aSI6ImEwZDFkYjMwMTlmZDRiYzA4OTZhZWE5Nzg1MzUyMjYxIiwidXNlcl9pZCI6IjEifQ.hKNa1wPDRnvrMtE3PmMg7E_W55pajAtLHYsf2zcO0Dc"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

payload = {
    "travel_request_id": 7
}

for i in range(12):
    response = requests.post(
        url,
        json=payload,
        headers=headers
    )

    print(f"Request {i+1} | Status: {response.status_code}")