import requests

test_email = "test_browser_1@test.com"

url = "http://127.0.0.1:8000/api/register/"
payload = {
    "name": "Test User",
    "email": test_email,
    "password": "Password123!",
    "role": "rider"
}

print(f"Sending POST request to {url} with email {test_email}...")
try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)
