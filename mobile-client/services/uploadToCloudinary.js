// services/uploadToCloudinary.js
export async function uploadToCloudinary(base64) {
    console.log("📤 正在上传到 Cloudinary...");
  
    const formData = new FormData();
    formData.append('file', `data:image/png;base64,${base64}`);
    formData.append('upload_preset', 'closetly_unsigned'); // ✅ 你的 unsigned preset 名字
  
    const response = await fetch('https://api.cloudinary.com/v1_1/dqxbn00bc/image/upload', {
      method: 'POST',
      body: formData,
    });
  
    const result = await response.json();
  
    console.log("🛰️ 响应状态：", response.status);
    console.log("📦 Cloudinary 响应：", result);
  
    if (!response.ok || !result.secure_url) {
      throw new Error('Upload to Cloudinary failed');
    }
  
    return result.secure_url;
  }