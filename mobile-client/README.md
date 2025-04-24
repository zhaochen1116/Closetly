
# 👗 Closetly: AI-Powered Virtual Try-On & Wardrobe Manager

**Closetly** is an AI-driven virtual closet and outfit try-on app built with React Native, FastAPI, and MongoDB. Users can upload clothing and model photos, generate virtual try-on images using AI (via Replicate), and manage their wardrobe visually.

---

## 🧠 Core Features

- 👕 Upload clothing with base64 image + auto-categorization
- 🧍 Upload model photos (with gender and style tags)
- 🤖 AI Virtual Try-On (powered by Replicate's Kolors model)
- ☁️ Cloudinary image hosting for smooth mobile performance
- 🛢 MongoDB database for items and models
- 🔐 JWT-based registration and login system (no frontend UI yet)

---

## 💡 Tech Stack

| Tech            | Purpose                      |
|-----------------|------------------------------|
| React Native    | Frontend mobile interface    |
| FastAPI         | Backend API server           |
| MongoDB         | Database for items/models    |
| Cloudinary      | Hosting images (items/models)|
| Kling           | AI try-on generation         |
| python-jose     | JWT token generation         |

---

## 🚀 Getting Started

### Backend Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Create a `.env` file with the following:

```env
MONGO_URL=mongodb://localhost:27017
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REPLICATE_API_TOKEN=your_replicate_token
JWT_SECRET=your_jwt_secret
```

3. Run the FastAPI backend:

```bash
uvicorn main:app --reload
```

> Default URL: `http://localhost:8000`

---

### Frontend Structure (React Native)

| File                  | Description                         |
|-----------------------|-------------------------------------|
| `/screens/TryOnScreen.js` | Model + clothing picker + try-on button |
| `/screens/MyCloset.js`    | Displays uploaded clothing items     |
| `/screens/ModelGallery.js`| Displays uploaded model photos      |
| `/services/api.js`        | API request wrapper (Axios)         |

---

## 🖼 Screenshots

### Uploading a Clothing Item
![Upload Clothing](assets/upload-item.png)

### Uploading a Model Photo
![Upload Model](assets/upload-model.png)

### AI-Generated Try-On Preview
![Virtual Try-On](assets/virtual-tryon.png)

---

## 🔜 TODO / Roadmap

- ✅ Backend JWT registration & login
- ⏳ Google Login (planned)
- ⏳ KlingAI try-on model integration (pending)
- ⏳ Personal closet features
- ⏳ Try-on history and outfit archives
- ⏳ Outfit suggestions and style matching

---

## 📁 Project Structure (Backend)

```
backend/
├── main.py                 # FastAPI backend entry
├── .env                    # Environment variables
├── ai_modules/
│   └── classifier.py       # Clothing type classifier
├── requirements.txt        # Python dependencies
```

---

## 👤 Author

**Closetly Team**  
📧 Email: zhaochen1116@Gmail.com  
🌐 GitHub: [ClosetlyAI](https://github.com/yourproject)

---

> If you like this project, give it a ⭐ star on GitHub!
