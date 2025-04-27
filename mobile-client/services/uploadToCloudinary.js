// services/uploadToCloudinary.js
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';


export async function uploadToCloudinary(base64) {
  
    const formData = new FormData();
    formData.append('file', `data:image/png;base64,${base64}`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 
  
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
  
    const result = await response.json();
  
    if (!response.ok || !result.secure_url) {
      throw new Error('Upload to Cloudinary failed');
    }
  
    return result.secure_url;
  }