// screens/ModelScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Modal, Pressable, Button } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { fetchModelPhotos, deleteModelPhoto } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';



export default function ModelScreen({ navigation }) {
  const [models, setModels] = useState([]);
  const [previewUri, setPreviewUri] = useState(null);
  const isFocused = useIsFocused(); // to check if the screen is focused
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  console.log("✅ ModelScreen Loaded, Navigation:", navigation);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleSelectMode}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isSelecting]);

  const toggleSelectMode = () => {
    setIsSelecting(!isSelecting);
    if (isSelecting) {
      setSelectedModels([]); 
    }
  };

  const toggleItemSelection = (modelID) => {
    if (selectedModels.includes(modelID)) {
      setSelectedModels(selectedModels.filter(id => id !== modelID));
    } else {
      setSelectedModels([...selectedModels, modelID]);
    }
  };
  
  const handleDeleteModel = () => {
    if (selectedModels.length === 0) return;
  
    Alert.alert('Delete', `Are you sure you want to delete ${selectedModels.length} photos?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // delete selected models
            await Promise.all(
              selectedModels.map(id => deleteModelPhoto(id))
            );
  
            const newModels = models.filter(model => !selectedModels.includes(model._id));
            setModels(newModels);
            setSelectedModels([]);
            setIsSelecting(false);
  
          } catch (error) {
            Alert.alert("Delete failure", "Please check network or server!");
          }
        },
      },
    ]);
  };

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


  const renderItem = ({ item }) => {
    let imageSrc = { uri: 'https://via.placeholder.com/100' };
  
    if (item.imageUrl) {
      imageSrc = { uri: item.imageUrl };
    } else if (item.imageBase64) {
      imageSrc = { uri: `data:image/jpeg;base64,${item.imageBase64}` };
    }
  
    const isSelected = selectedModels.includes(item._id);
  
    return (
      <TouchableOpacity
        onPress={() => {
          if (isSelecting) {
            toggleItemSelection(item._id);
          } else {
            setPreviewUri(imageSrc.uri);
          }
        }}
        style={styles.modelCard}
      >
        <View style={{ position: 'relative' }}>
          <Image source={imageSrc} style={styles.thumbnail} />
          {isSelecting && (
            <View style={styles.checkBox}>
              {isSelected && <View style={styles.checkedBox} />}
            </View>
          )}
        </View>
        <Text style={styles.modelName}>{item.name || 'Unnamed Model'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <View style={styles.headerRow}>
      <Button
        title="➕ Upload A Model"
        onPress={() => navigation.navigate('UploadModel')}
        color="#007AFF"  
      />
    </View>

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
    <View/>
    {isSelecting && selectedModels.length > 0 && (
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteModel}>
        <Text style={styles.deleteButtonText}>Delete Selected</Text>
      </TouchableOpacity>
)}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',            
    justifyContent: 'space-between',
    alignItems: 'center',             
    marginBottom: 0,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  addButton: { position: 'absolute', top: 20, right: 20, zIndex: 10 },
  addText: { fontSize: 30, fontWeight: 'bold', color: '#007AFF' },
  gallery: { paddingTop: 10 },
  thumbnail: { width: 100, height: 160, borderRadius: 8, margin: 5 },
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
    width: 130,
  },
  
  modelName: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  checkBox: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    width: 10,
    height: 10,
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  deleteButton: { backgroundColor: 'red', padding: 14, alignItems: 'center', borderRadius: 10, margin: 20 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
