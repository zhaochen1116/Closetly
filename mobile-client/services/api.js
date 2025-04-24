import axios from 'axios';
import { BASE_URL, CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';

// 上传衣物条目（会发送 imageBase64）
export const uploadItem = async (itemData) => {
  const response = await axios.post(`${BASE_URL}/api/items`, itemData);
  return response.data;
};

// 获取所有衣物条目
export const fetchItems = async () => {
  const response = await axios.get(`${BASE_URL}/api/items`);
  return response.data.items;
};

// 删除衣物条目
export const deleteItem = async (id) => {
  const response = await axios.delete(`${BASE_URL}/api/items/${id}`);
  if (!response.status === 200) {
    throw new Error('Failed to delete');
  }
};

// 上传图片到 Cloudinary，返回上传后的 URL
export const uploadToCloudinary = async (base64) => {
  console.log("📤 正在上传到 Cloudinary...");
  const formData = new FormData();
  formData.append('file', `data:image/png;base64,${base64}`);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  console.log("📦 Cloudinary 响应：", result);
  if (response.ok && result.secure_url) {
    return result.secure_url;
  } else {
    throw new Error("Upload to Cloudinary failed");
  }
};

// 上传人体模特照片
export const uploadModelPhoto = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/models`, data);
  return response.data;
};

export const fetchModelPhotos = async () => {
  const response = await axios.get(`${BASE_URL}/api/models`);
  return response.data.models; // ✅ 这里必须是 .models
};

// 删除模特照片
export const deleteModelPhoto = async (id) => {
  await axios.delete(`${BASE_URL}/api/models/${id}`);
};

export const fetchItemsWithBase64 = async () => {
  const response = await axios.get(`${BASE_URL}/api/items/full`);
  return response.data.items;
};

export const fetchModelPhotosWithBase64 = async () => {
  const response = await axios.get(`${BASE_URL}/api/models/full`);
  return response.data.models;
};