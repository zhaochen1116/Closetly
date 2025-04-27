from datetime import datetime
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from bson import ObjectId
from ai_modules.classifier import classify_base64
from utils.database import items_collection

router = APIRouter()

class Item(BaseModel):
    name: str
    imageBase64: str
    imageUrl: str
    type: str = "unknown"

class UpdateItemRequest(BaseModel):
    name: str = None
    type: str = None

class DeleteItemsRequest(BaseModel):
    item_ids: List[str]

@router.get("/items")
def get_items():
    items = list(items_collection.find({}, {"_id": 1, "imageUrl": 1, "name": 1, "type": 1}))
    for item in items:
        item["_id"] = str(item["_id"])
    return {"items": items}

@router.post("/items")
def add_item(item: Item):
    data = item.dict()

    # Step 1: Upload to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(
            f"data:image/png;base64,{data['imageBase64']}",
            folder="closetly/items"
        )
        image_url = upload_result.get("secure_url")
        data["imageUrl"] = image_url
        print("☁️ Uploaded to Cloudinary:", image_url)
    except Exception as e:
        print("❌ Cloudinary upload failed:", e)
        raise HTTPException(status_code=500, detail="Image upload failed")

    # Step 2: Classify type if unknown
    ALLOWED_TYPES = ['top', 'pants', 't-shirt', 'pajama', 'dress', 'jacket', 'skirt']

    if data.get("type") == "unknown":
        try:
            predicted_type = classify_base64(data["imageBase64"])
            print("🧠 Predicted type:", predicted_type)

            if predicted_type.lower() in ALLOWED_TYPES:
                data["type"] = predicted_type.lower()
            else:
                data["type"] = "others"

        except Exception as e:
            data["type"] = "others"
    
    
    try:
        data["created_at"] = datetime.utcnow()
        result = items_collection.insert_one(data)
        print("✅ Inserted to MongoDB, ID:", result.inserted_id)
        return {"id": str(result.inserted_id), "type": data["type"]}
    except Exception as e:
        print("❌ MongoDB insert error:", e)
        return {"error": f"DB insert failed: {str(e)}"}

@router.put("/items/{item_id}")
def update_item(item_id: str, update: dict):
    try:
        result = items_collection.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": update}
        )
        if result.modified_count == 1:
            return {"message": "Item updated"}
        else:
            return {"message": "No changes made"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/items/{item_id}")
def delete_item(item_id: str):
    try:
        result = items_collection.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 1:
            return {"message": "Item deleted"}
        else:
            raise HTTPException(status_code=404, detail="Item not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/items/batch-delete")
def batch_delete_items(request: DeleteItemsRequest):
    try:
        object_ids = [ObjectId(item_id) for item_id in request.item_ids]
        result = items_collection.delete_many({"_id": {"$in": object_ids}})
        return {"message": f"Deleted {result.deleted_count} items"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/items/full")
def get_items_with_base64():
    items = list(items_collection.find())  # 不排除 imageBase64
    for item in items:
        item["_id"] = str(item["_id"])
    return {"items": items}