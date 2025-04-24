import React, { useState } from 'react';
import { useEffect } from 'react-native';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { uploadItem } from '../services/api';
import { uploadToCloudinary } from '../services/uploadToCloudinary';
import { Picker } from '@react-native-picker/picker'; // 确保安装了 @react-native-picker/picker

export default function UploadScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('unknown'); // 新增
  

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,  // ✅ 使用 MediaTypeOptions
        base64: true, // 获取 base64
        quality: 1,
      });
  
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64);
      }
    } catch (err) {
      console.error("❌ Image pick error:", err);
      Alert.alert("Image picking failed.");
    }
  };

  const handleUpload = async () => {
    if (!imageBase64 || !name) {
      Alert.alert('Please select an image and enter a name.');
      return;
    }

    setLoading(true);

    try {
      // ✅ 第一步：上传 Cloudinary 获取 URL
      const imageUrl = await uploadToCloudinary(imageBase64);

      // ✅ 第二步：提交到后端
      const response = await uploadItem({
        name,
        imageBase64,
        imageUrl,
        type,
      });
      const uploadedType = response?.type || 'unknown'; // 如果需要显示类型的话

      Alert.alert(`✅ Upload successful!`, `Category: ${uploadedType}`);
      setImageUri(null);
      setImageBase64('');
      setName('');
      setType('unknown');
      navigation.goBack();
    } catch (error) {
      console.error("❌ Upload error:", error);
      Alert.alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload New Item</Text>

      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Tap to select image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter item name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Select Clothing Type:</Text>
      <Picker
        selectedValue={type}
        onValueChange={(value) => setType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Unknown (Auto Detect)" value="unknown" />
        <Picker.Item label="Top" value="top" />
        <Picker.Item label="Pants" value="pants" />
        <Picker.Item label="T-Shirt" value="t-shirt" />
        <Picker.Item label="Pajama" value="pajama" />
        <Picker.Item label="Jacket" value="jacket" />
        <Picker.Item label="Dress" value="dress" />
        <Picker.Item label="Others" value="others" />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleUpload}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  imageBox: { backgroundColor: '#eee', height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 10 },
  imageText: { color: '#888' },
  image: { width: '100%', height: '100%', borderRadius: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 },
  label: { marginTop: 10, fontWeight: 'bold' },
  picker: { backgroundColor: '#f2f2f2', borderRadius: 8, marginBottom: 20, },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20, },
  buttonText: { color: '#fff', fontWeight: '600' },
});
