from fastapi import FastAPI, HTTPException, Request, Path, Body
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime
from ai_modules.classifier import classify_base64
from pydantic import BaseModel
import cloudinary
import cloudinary.uploader
import requests
from PIL import Image
from io import BytesIO

# from tryon import router as tryon_router


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Load environment variables
load_dotenv()
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client.closetly
items_collection = db.items


app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    name: str
    imageBase64: str
    imageUrl: str  # 新增字段
    type: str = "unknown"
    created_at: datetime = datetime.utcnow()

class ModelItem(BaseModel):
    name: str
    imageBase64: str
    gender: str = "unspecified"    # 新增字段，默认未指定
    style: str = "unspecified"     # 新增字段
    created_at: datetime = datetime.utcnow()

class TryOnRequest(BaseModel):
    modelBase64: str
    clothingBase64: str

items_collection = db.items
models_collection = db.models

@app.get("/")
def root():
    return {"message": "Closetly API running"}

@app.get("/api/items")
def get_items():
    items = list(items_collection.find({}, {"_id": 1, "imageUrl": 1, "name": 1, "type": 1}))
    for item in items:
        item["_id"] = str(item["_id"])
    return {"items": items}


@app.post("/api/items")
def add_item(item: Item):
    data = item.dict()

    # Step 1: 上传图片到 Cloudinary
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

    # Step 2: 分类识别
    ALLOWED_TYPES = ['top', 'pants', 't-shirt', 'pajama', 'dress', 'jacket', 'skirt']

    if data.get("type") == "unknown":
        try:
            predicted_type = classify_base64(data["imageBase64"])
            print("🧠 Predicted type:", predicted_type)

            # ✅ 如果预测类型不在允许范围内，统一归为 'others'
            if predicted_type.lower() in ALLOWED_TYPES:
                data["type"] = predicted_type.lower()
            else:
                print("⚠️ 类型不在预定义列表中，归为 others")
                data["type"] = "others"

        except Exception as e:
            print("❌ Type classification error:", e)
            data["type"] = "others"
     # 删除 base64，存储优化
    # del data["imageBase64"]
    try:
        data["created_at"] = datetime.utcnow()
        result = items_collection.insert_one(data)
        print("✅ Inserted to MongoDB, ID:", result.inserted_id)
        return {"id": str(result.inserted_id), "type": data["type"]}
    except Exception as e:
        print("❌ MongoDB insert error:", e)
        return {"error": f"DB insert failed: {str(e)}"}
    
@app.delete("/api/items/{item_id}")
def delete_item(item_id: str):
    try:
        result = items_collection.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 1:
            return {"message": "Item deleted"}
        else:
            raise HTTPException(status_code=404, detail="Item not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/api/items/{item_id}")
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

@app.post("/api/models")
def upload_model(item: ModelItem):
    data = item.dict()

    try:
        upload_result = cloudinary.uploader.upload(
            f"data:image/png;base64,{data['imageBase64']}",
            folder="closetly/models"
        )
        image_url = upload_result.get("secure_url")
        data["imageUrl"] = image_url   # ✅ 加入 imageUrl 字段
        result = models_collection.insert_one(data)
        return {"id": str(result.inserted_id), "imageUrl": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Upload model failed")

@app.get("/api/models")
def get_models():
    try:
        models = list(models_collection.find({}, {"_id": 1, "imageUrl": 1, "name": 1}))
        for model in models:
            model["_id"] = str(model["_id"])  # 转字符串
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tryon")
def try_on(request: TryOnRequest = Body(...)):
    print("接收到请求字段长度:", len(request.modelBase64), len(request.clothingBase64))
    try:
        print("🧪 ModelBase64 length:", len(request.modelBase64))
        print("🧪 ClothingBase64 length:", len(request.clothingBase64))
        headers = {
            "Authorization": f"Token {REPLICATE_API_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "version": "6145c9c5cbd646873232d661fe0398ab87ac93db66d5c365959a471c651862d7",  # fofr/kolors 最新版本
            "input": {
                "human_image": request.modelBase64,
                "cloth_image": request.clothingBase64
            }
        }

        response = requests.post(
            "https://api.replicate.com/v1/predictions",
            headers=headers,
            json=payload
        )

        result = response.json()
        print("🧠 Replicate 响应 keys:", list(result.keys()))
        

        if "id" in result:
            return {"id": result["id"]}
        else:
            raise Exception("No task ID returned")

    except Exception as e:
        print("❌ Try-on失败:", e)
        raise HTTPException(status_code=500, detail="AI Try-on failed")
    
@app.get("/api/tryon/status/{task_id}")
def get_tryon_status(task_id: str):
    try:
        headers = {
            "Authorization": f"Token {REPLICATE_API_TOKEN}",
            "Content-Type": "application/json"
        }

        url = f"https://api.replicate.com/v1/predictions/{task_id}"
        response = requests.get(url, headers=headers)
        result = response.json()
        print("🔄 Replicate 轮询结果:", result)

        status = result.get("status")

        if status == "succeeded":
            output_url = result.get("output")[-1] if isinstance(result.get("output"), list) else result.get("output")
            print("🎯 生成的 WebP 图像 URL:", output_url)

            # ✅ Step 1: 下载 .webp
            webp_response = requests.get(output_url)
            webp_image = Image.open(BytesIO(webp_response.content)).convert("RGB")

            # ✅ Step 2: 转为 PNG 并写入内存
            png_buffer = BytesIO()
            webp_image.save(png_buffer, format="PNG")
            png_buffer.seek(0)

            # ✅ Step 3: 上传到 Cloudinary
            cloudinary_upload_result = cloudinary.uploader.upload(png_buffer, folder="closetly/tryon")
            cloudinary_url = cloudinary_upload_result.get("secure_url")
            print("☁️ 已上传 PNG 图像到 Cloudinary:", cloudinary_url)

            return {
                "status": "succeeded",
                "output_url": cloudinary_url
            }

        elif status == "failed":
            return {"status": "failed", "error": result.get("error", "Generation failed")}

        else:
            return {"status": status}  # pending or starting

    except Exception as e:
        print("❌ 获取状态失败:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch try-on status")

@app.get("/api/items/full")
def get_items_with_base64():
    items = list(items_collection.find())  # 不排除 imageBase64
    for item in items:
        item["_id"] = str(item["_id"])
    return {"items": items}

@app.get("/api/models/full")
def get_models_with_base64():
    models = list(models_collection.find())  # 不排除 imageBase64
    for model in models:
        model["_id"] = str(model["_id"])
    return {"models": models}