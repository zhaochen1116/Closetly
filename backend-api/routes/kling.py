# routes/kling.py

from datetime import datetime
from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from utils.kling_client import submit_tryon, get_tryon_status
import cloudinary
import os
import cloudinary.uploader
from pymongo import MongoClient
router = APIRouter()
from dotenv import load_dotenv

load_dotenv()

# Initialize MongoDB client and collection
MONGO_URL = os.getenv("MONGO_URL")
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

@router.post("/api/tryon")
def tryon(request: TryOnRequest = Body(...)):
    try:
        result = submit_tryon(request.modelBase64, request.clothingBase64)

        if result.get("code") != 0:
            raise HTTPException(status_code=401, detail=result.get("message", "Auth or request error"))

        task_id = result["data"]["task_id"]
        return {"id": task_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Try-on failed: {str(e)}")

@router.get("/api/tryon/status/{task_id}")
def tryon_status(task_id: str):
    try:
        result = get_tryon_status(task_id)

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
                raise HTTPException(status_code=500, detail="Cloudinary upload failed")
            
            try:
                items_collection.insert_one({
                    "name": "Try-On Result",
                    "type": "tryon",  
                    "imageUrl": cloudinary_url, 
                    "created_at": datetime.utcnow()
                })

            except Exception as e:
                raise HTTPException(status_code=500, detail="Database insert failed")
            return {"status": "succeeded", "output_url": cloudinary_url}        

        elif status == "failed":
            return {"status": "failed", "error": data.get("task_status_msg", "Unknown failure")}
        else:
            return {"status": status}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Poll failure: {str(e)}")
