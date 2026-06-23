import requests

url = "http://127.0.0.1:8000/"

success = 0

for i in range(50):
    response = requests.get(url)

    print(
        f"Request {i+1}: {response.status_code}"
    )

    if response.status_code == 200:
        success += 1

print(
    f"\nSuccessful Requests: {success}/50"
)