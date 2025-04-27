import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HUGGINGFACE_MODEL_ID = "google/vit-base-patch16-224"  # or try another model
API_URL = f"https://api-inference.huggingface.co/models/{HUGGINGFACE_MODEL_ID}"
HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}

def classify_base64(image_base64: str) -> str:
    
    try:
        image_data = base64.b64decode(image_base64)
        response = requests.post(API_URL, headers=HEADERS, data=image_data)

        if response.status_code == 503:
            return "loading"

        if response.status_code != 200:
            return "unknown"

        predictions = response.json()

        if isinstance(predictions, list) and predictions:
            label = predictions[0].get("label", "unknown")
            print("🧠 Predicted label:", label)
            return label.lower()

        return "unknown"

    except Exception as e:
        return "unknown"
