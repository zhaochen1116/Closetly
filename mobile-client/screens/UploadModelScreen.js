import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator,
  Alert, Pressable, Modal, TextInput, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadModelPhoto, fetchModelPhotos, deleteModelPhoto } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function ModelScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [previewUri, setPreviewUri] = useState(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [style, setStyle] = useState('unspecified');
  const navigation = useNavigation();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await fetchModelPhotos();
      setModels(data);
    } catch (err) {
      console.error('❌ Failed to fetch models:', err);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
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
      Alert.alert('Please select a photo and enter a name');
      return;
    }

    setLoading(true);
    try {
      await uploadModelPhoto({
        name,
        imageBase64,
        gender,
        style,
        created_at: new Date().toISOString(),
      });

      Alert.alert('✅ Model photo uploaded!');
      setImageUri(null);
      setImageBase64('');
      setName('');
      setGender('unspecified');
      setStyle('unspecified');
      await loadModels();
      navigation.goBack();
    } catch (err) {
      console.error('❌ Upload error:', err);
      Alert.alert('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteModelPhoto(id);
          loadModels();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setPreviewUri(item.imageUrl)}
      onLongPress={() => handleDelete(item._id)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.title}>🧍‍♂️ Model Photos</Text>
  
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Upload a Model Photo</Text>
          )}
        </TouchableOpacity>
  
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
  
        <Text style={styles.label}>Gender:</Text>
        <Picker
          selectedValue={gender}
          onValueChange={setGender}
        >
          <Picker.Item label="Unspecified" value="unspecified" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
  
        <Text style={styles.label}>Style:</Text>
        <Picker
          selectedValue={style}
          onValueChange={setStyle}
        >
          <Picker.Item label="Unspecified" value="unspecified" />
          <Picker.Item label="Casual" value="casual" />
          <Picker.Item label="Formal" value="formal" />
          <Picker.Item label="Sporty" value="sporty" />
          <Picker.Item label="Street" value="street" />
        </Picker>
  
        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Upload</Text>
          )}
        </TouchableOpacity>
  
        <View style={styles.gallery}>
          {models.map((item, index) => (
            <TouchableOpacity
              key={item._id || index}
              onPress={() => setPreviewUri(item.imageUrl)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.galleryImage} />
            </TouchableOpacity>
          ))}
        </View>
  
      </ScrollView>
  
      <Modal visible={!!previewUri} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeArea} onPress={() => setPreviewUri(null)} />
          <Image source={{ uri: previewUri }} style={styles.fullImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setPreviewUri(null)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, backgroundColor: '#fff', flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,  },
  scrollContainer: {
    paddingHorizontal: 30,
    paddingBottom: 60,   
    paddingTop: 30,
    backgroundColor: '#fff',  
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  
  previewImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 20 },
  imageBox: { backgroundColor: '#eee', height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 10 },
  imageText: { color: '#888' },
  image: { width: '100%', height: '100%', borderRadius: 10 },
  scrollRow: { flexDirection: 'row', marginBottom: 20 },
  uploadButton: { backgroundColor: '#000', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16, },
  uploadText: { color: '#fff' },
  gallery: { gap: 10 },
  thumbnail: { width: 100, height: 100, borderRadius: 8, margin: 5 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', },
  fullImage: { width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 10, },
  closeButton: { position: 'absolute', top: 60, right: 30, backgroundColor: '#fff', borderRadius: 20, padding: 8, },
  closeText: { fontSize: 18 },
  closeArea: { ...StyleSheet.absoluteFillObject },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, },
  label: { marginTop: 20, marginBottom: 8, fontWeight: 'bold', fontSize: 16, },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20, },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  
});
