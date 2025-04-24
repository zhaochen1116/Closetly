// screens/ModelScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { fetchModelPhotos, deleteModelPhoto } from '../services/api';

export default function ModelScreen({ navigation }) {
  const [models, setModels] = useState([]);
  const [previewUri, setPreviewUri] = useState(null);
  const isFocused = useIsFocused(); // 👈 确保返回后刷新

  const loadModels = async () => {
    try {
      const data = await fetchModelPhotos();
      setModels(data);
    } catch (err) {
      console.error("❌ Failed to fetch models:", err);
    }
  };

  useEffect(() => {
    if (isFocused) loadModels();
  }, [isFocused]);

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

  const renderItem = ({ item }) => {
    let imageSrc = { uri: 'https://via.placeholder.com/100' };
  
    if (item.imageUrl) {
      imageSrc = { uri: item.imageUrl }; // 优先 Cloudinary URL
    } else if (item.imageBase64) {
      imageSrc = { uri: `data:image/jpeg;base64,${item.imageBase64}` }; // 回退 base64
    }
    print("📸 模特照片：", item.imageUrl); // Debugging log
  
    return (
      <TouchableOpacity
        onPress={() => setPreviewUri(imageSrc.uri)}
        onLongPress={() => handleDelete(item._id)}
        style={styles.modelCard}
      >
        <Image source={imageSrc} style={styles.thumbnail} />
        <Text style={styles.modelName}>{item.name || 'Unnamed Model'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧍 Model Gallery</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('UploadModel')}
      >
        <Text style={styles.addText}>＋</Text>
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  addButton: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
  addText: { fontSize: 30, fontWeight: 'bold', color: '#007AFF' },
  gallery: { paddingTop: 40 },
  thumbnail: { width: 100, height: 100, borderRadius: 8, margin: 5 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: { width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 10 },
  closeButton: { position: 'absolute', top: 60, right: 30, backgroundColor: '#fff', borderRadius: 20, padding: 8 },
  closeText: { fontSize: 18 },
  closeArea: { ...StyleSheet.absoluteFillObject },
  modelCard: {
    alignItems: 'center',
    margin: 5,
    width: 100,
  },
  
  modelName: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});
