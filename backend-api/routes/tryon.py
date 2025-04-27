import cloudinary
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from utils.kling_client import submit_tryon, get_tryon_status
from dotenv import load_dotenv
from pymongo import MongoClient
import os
from datetime import datetime

load_dotenv()

# Initialize MongoDB client and collection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client.closetly
items_collection = db.items
router = APIRouter()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

class TryOnRequest(BaseModel):
    modelBase64: str
    clothingBase64: str

@router.post("/tryon")
def tryon(request: TryOnRequest = Body(...)):
    try:
        result = submit_tryon(request.modelBase64, request.clothingBase64)
        print("🧪 KLING request result:", result)

        if result.get("code") != 0:
            raise HTTPException(status_code=401, detail=result.get("message", "Auth or request error"))

        task_id = result["data"]["task_id"]
        return {"id": task_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Try-on failed: {str(e)}")

@router.get("/tryon/status/{task_id}")
def tryon_status(task_id: str):
    try:
        result = get_tryon_status(task_id)
        print("Poll result:", result)

        if result.get("code") != 0:
            raise HTTPException(status_code=400, detail=result.get("message", "Auth or API error"))

        data = result["data"]
        status = data.get("task_status")

        if status == "succeed":
            image_url = data.get("task_result", {}).get("images", [{}])[0].get("url")
            try:
                upload_result = cloudinary.uploader.upload(image_url, folder="closetly/tryon")
                cloudinary_url = upload_result.get("secure_url")
            except Exception as e:
                print("❌ Cloudinary upload error:", e)
                raise HTTPException(status_code=500, detail="Cloudinary upload failed")
            
        if(image_url):
            try:
                print("Insert tryon：", cloudinary_url)
                items_collection.insert_one({
                    "name": "Try-On Result",
                    "type": "tryon", 
                    "imageUrl": cloudinary_url,  
                    "created_at": datetime.utcnow()
                })

            except Exception as e:
                print("❌ insert err:", e)

            return {"status": "succeeded", "output_url": cloudinary_url}        

        elif status == "failed":
            return {"status": "failed", "error": data.get("task_status_msg", "Unknown failure")}
        else:
            return {"status": status}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"poll failure: {str(e)}")
