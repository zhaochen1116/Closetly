import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, HTTPException
from utils.database import models_collection
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

class ModelItem(BaseModel):
    name: str
    imageBase64: str
    gender: str = "unspecified"
    style: str = "unspecified"

@router.get("/models")
def get_models():
    try:
        models = list(models_collection.find({}, {"_id": 1, "imageUrl": 1, "name": 1}))
        for model in models:
            model["_id"] = str(model["_id"])  
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models")
def upload_model(item: ModelItem):
    data = item.dict()

    try:
        upload_result = cloudinary.uploader.upload(
            f"data:image/png;base64,{data['imageBase64']}",
            folder="closetly/models"
        )
        image_url = upload_result.get("secure_url")
        data["imageUrl"] = image_url   
        result = models_collection.insert_one(data)
        return {"id": str(result.inserted_id), "imageUrl": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Upload model failed")

@router.get("/models/full")
def get_models_with_base64():
    models = list(models_collection.find())  
    for model in models:
        model["_id"] = str(model["_id"])
    return {"models": models}

@router.delete("/model/{model_id}")
def delete_model(model_id: str):
    try:
        result = models_collection.delete_one({"_id": ObjectId(model_id)})
        if result.deleted_count == 1:
            return {"message": "Item deleted"}
        else:
            raise HTTPException(status_code=404, detail="Item not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))