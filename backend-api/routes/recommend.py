from fastapi import APIRouter, Query
from utils.database import items_collection

router = APIRouter()

@router.get("/recommend-by-weather")
def recommend_by_weather(temp: float = Query(...), weather: str = Query(...)):
    try:
        query = {}

        if temp < 10:
            query = {"type": {"$in": ["jacket", "coat", "sweater", "boots", "pants", "hat"]}}
        elif temp > 25:
            query = {"type": {"$in": ["t-shirt", "shorts", "skirt"]}}
        else:
            query = {"type": {"$in": ["t-shirt", "long-pants", "light-jacket"]}}

        if "rain" in weather.lower():
            query = {"type": {"$in": ["jacket", "raincoat", "dark-shirt"]}}
        elif "snow" in weather.lower():
            query = {"type": {"$in": ["coat", "sweater", "boots"]}}

        # 🛠️ 查的时候顺便把 type 一起返回
        items = list(items_collection.find(query, {"_id": 1, "name": 1, "imageUrl": 1, "type": 1}).limit(5))
        for item in items:
            item["_id"] = str(item["_id"])

        return {"recommendations": items}

    except Exception as e:
        return {"error": str(e)}
