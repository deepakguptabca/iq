import requests


API_KEY = "AIzaSyDAnfOYP9elO9LhU9vLFubrdlJ62af-n1Q"


url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

headers = {
    "Content-Type": "application/json"
}

params = {
    "key": API_KEY
}

data = {
    "contents": [
        {
            "parts": [
                {"text": "Say hello in one sentence"}
            ]
        }
    ]
}

res = requests.post(url, headers=headers, params=params, json=data)

print("Status:", res.status_code)
print(res.text)