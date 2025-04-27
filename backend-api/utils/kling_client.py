# utils/kling_client.py

import os
import time
import jwt
import requests
from dotenv import load_dotenv

load_dotenv()

ACCESS_KEY = os.getenv("KLING_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("KLING_ACCESS_KEY_SECRET")
API_BASE_URL = "https://api.klingai.com"

# Generate JWT Token
def generate_jwt_token():
    now = int(time.time())
    payload = {
        "iss": ACCESS_KEY,
        "iat": now,
        "nbf": now,
        "exp": now + 3600
    }
    token = jwt.encode(payload, str(SECRET_KEY), algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

# use this function to submit a try-on request
def submit_tryon(human_base64: str, cloth_base64: str):
    token = generate_jwt_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "human_image": human_base64,
        "cloth_image": cloth_base64
    }

    url = f"{API_BASE_URL}/v1/images/kolors-virtual-try-on"
    response = requests.post(url, headers=headers, json=payload, timeout=15)
    return response.json()

# polling function to get the status of the try-on request
def get_tryon_status(task_id: str):
    token = generate_jwt_token()
    headers = {
        "Authorization": f"Bearer {token}"
    }

    url = f"{API_BASE_URL}/v1/images/kolors-virtual-try-on/{task_id}"
    response = requests.get(url, headers=headers, timeout=15)
    return response.json()
