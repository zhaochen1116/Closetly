import axios from 'axios';
import { BASE_URL, CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';

// uploadItem to the server
export const uploadItem = async (itemData) => {
  const response = await axios.post(`${BASE_URL}/api/items`, itemData);
  return response.data;
};

// fetch items from the server
export const fetchItems = async () => {
  const response = await axios.get(`${BASE_URL}/api/items`);
  return response.data.items;
};

// delete item from the server
export const deleteItem = async (id) => {
  const response = await axios.delete(`${BASE_URL}/api/items/${id}`);
  if (!response.status === 200) {
    throw new Error('Failed to delete');
  }
};

export const updateItemType = async (id, newType) => {
  const response = await axios.put(`${BASE_URL}/api/items/${id}`, { type: newType });
  return response.data;
};

// upload image to Cloudinary
export const uploadToCloudinary = async (base64) => {
  const formData = new FormData();
  formData.append('file', `data:image/png;base64,${base64}`);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (response.ok && result.secure_url) {
    return result.secure_url;
  } else {
    throw new Error("Upload to Cloudinary failed");
  }
};

// upload model photo to the server
export const uploadModelPhoto = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/models`, data);
  return response.data;
};

export const fetchModelPhotos = async () => {
  const response = await axios.get(`${BASE_URL}/api/models`);
  return response.data.models; 
};

// delete model photo from the server
export const deleteModelPhoto = async (id) => {
  await axios.delete(`${BASE_URL}/api/model/${id}`);
};

export const fetchItemsWithBase64 = async () => {
  const response = await axios.get(`${BASE_URL}/api/items/full`);
  return response.data.items;
};

export const fetchModelPhotosWithBase64 = async () => {
  const response = await axios.get(`${BASE_URL}/api/models/full`);
  return response.data.models;
};