from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.items import router as items_router
from routes.models import router as models_router
from routes.tryon import router as tryon_router
from routes.kling import router as kling_router  
from routes.recommend import router as recommend_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(tryon_router, prefix="/api")
app.include_router(kling_router, prefix="/api")
app.include_router(recommend_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Closetly API running"}

