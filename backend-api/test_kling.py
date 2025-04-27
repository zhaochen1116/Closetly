import time
import jwt  # pip install pyjwt
import requests
import os
from dotenv import load_dotenv

# load environment variables from .env file
load_dotenv()
ACCESS_KEY = os.getenv("KLING_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("KLING_ACCESS_KEY_SECRET")

# generate JWT token for authentication
def generate_jwt():
    now = int(time.time())
    payload = {
        "iss": ACCESS_KEY,
        "iat": now,
        "nbf": now,
        "exp": now + 3600  # effective for 1 hour
    }
    print("🔍 JWT Payload:", payload)

    token = jwt.encode(payload, str(SECRET_KEY), algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    print("🧾 JWT Token:", token)
    return token

# initiate a request to the API
def send_request():
    token = generate_jwt()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 🔧 use your own
    fake_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAUA"

    payload = {
        "human_image": fake_base64,
        "cloth_image": fake_base64
    }

    try:
        response = requests.post(
            "https://api.klingai.com/v1/images/kolors-virtual-try-on",
            headers=headers,
            json=payload,
            timeout=15
        )
        print("✅ status code:", response.status_code)
        print("📨 response text:", response.text)
    except Exception as e:
        print("❌ poll err:", e)

# main function to run the script
if __name__ == "__main__":
    send_request()
