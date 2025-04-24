import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator,
  Alert, Pressable, FlatList, Modal, TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
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
    <View style={styles.container}>
      <Text style={styles.title}>🧍‍♂️ Model Photos</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadText}>Upload a Model Photo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Gender:</Text>
      <Picker selectedValue={gender} onValueChange={setGender}>
        <Picker.Item label="Unspecified" value="unspecified" />
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
      </Picker>

      <Text style={styles.label}>Style:</Text>
      <Picker selectedValue={style} onValueChange={setStyle}>
        <Picker.Item label="Unspecified" value="unspecified" />
        <Picker.Item label="Casual" value="casual" />
        <Picker.Item label="Formal" value="formal" />
        <Picker.Item label="Sporty" value="sporty" />
        <Picker.Item label="Street" value="street" />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleUpload}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload</Text>}
      </TouchableOpacity>

      <FlatList
        data={models}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.gallery}
      />

      <Modal visible={!!previewUri} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeArea} onPress={() => setPreviewUri(null)} />
          <Image source={{ uri: previewUri }} style={styles.fullImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setPreviewUri(null)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  uploadButton: {
    backgroundColor: '#000', padding: 12, borderRadius: 8,
    alignItems: 'center', marginBottom: 16,
  },
  uploadText: { color: '#fff' },
  gallery: { gap: 10 },
  thumbnail: { width: 100, height: 100, borderRadius: 8, margin: 5 },
  modalContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  fullImage: {
    width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 10,
  },
  closeButton: {
    position: 'absolute', top: 60, right: 30,
    backgroundColor: '#fff', borderRadius: 20, padding: 8,
  },
  closeText: { fontSize: 18 },
  closeArea: { ...StyleSheet.absoluteFillObject },
  input: {
    borderColor: '#ccc', borderWidth: 1, borderRadius: 8,
    padding: 10, marginBottom: 10,
  },
  label: { marginTop: 10, fontWeight: 'bold' },
  button: {
    backgroundColor: '#000', padding: 14,
    borderRadius: 10, alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
