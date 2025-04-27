import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, Picker, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { fetchItemsWithBase64, fetchModelPhotosWithBase64 } from '../services/api';
import { Alert } from 'react-native';
import { BASE_URL } from '@env'; 

export default function TryOnScreen() {
  const [models, setModels] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedClothing, setSelectedClothing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedImage, setGeneratedImage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const modelData = await fetchModelPhotosWithBase64();
        const itemData = await fetchItemsWithBase64();
        setModels(modelData);
        setClothes(itemData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Please try again later.");
      } finally {
        setLoading(false);  
      }
    };
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedModel || !selectedClothing) {
      Alert.alert("Please select both a model and a clothing item");
      return;
    }
  
    setGeneratedImage(null);
    setLoading(true);
  
    try {
      // Step 1: initiate try-on request
      const response = await fetch(`${BASE_URL}/api/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelBase64: selectedModel.imageBase64,      //get model base64
          clothingBase64: selectedClothing.imageBase64 //get clothing base64
        }),
      });
  
      const result = await response.json();
      const taskId = result.id;
      if (!taskId) {
        throw new Error("No task ID returned");
      }
  
      // Step 2: start polling for status
      let attempts = 0;
      const maxAttempts = 30;
  
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${BASE_URL}/api/tryon/status/${taskId}`);
          const statusJson = await statusRes.json();
  
          if (statusJson.status === 'succeeded') {
            clearInterval(interval);
            setGeneratedImage(statusJson.output_url);
            setLoading(false);
          } else if (statusJson.status === 'failed' || attempts >= maxAttempts) {
            clearInterval(interval);
            setLoading(false);
            Alert.alert("❌ Try-on Failed");
          } else {
            attempts++;
          }
        } catch (err) {
          clearInterval(interval);
          setLoading(false);
          console.error("Status check failed:", err);
        }
      }, 2000); // poll every 2 seconds
  
    } catch (err) {
      console.error("❌ Try-on request failed:", err);
      setLoading(false);
      Alert.alert("Error generating try-on preview.");
    }
  };

  const renderSelectable = (list, selected, setSelected, title) => (
    <View style={styles.row}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.selectionRow}>
        {list.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => setSelected(item)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={[
                styles.thumbnail,
                selected?.imageUrl === item.imageUrl && styles.selected,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>👤 Select a Model:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        {models.map((model, idx) => (
          <TouchableOpacity key={idx} onPress={() => setSelectedModel(model)}>
            <Image
              source={{ uri: model.imageUrl }}
              style={[
                styles.thumbnail,
                selectedModel?.imageUrl === model.imageUrl && styles.selected,
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.subtitle}>👗 Select a Clothing Item:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
        {clothes.map((item, idx) => (
          <TouchableOpacity key={idx} onPress={() => setSelectedClothing(item)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={[
                styles.thumbnail,
                selectedClothing?.imageUrl === item.imageUrl && styles.selected,
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.subtitle}>🎯 Try-On Preview:</Text>
      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
        <Text style={styles.generateButtonText}>✨ Generate Try-On</Text>
      </TouchableOpacity>

      
      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}
      {/* tryon */}
      {generatedImage && (
        <View style={styles.previewBox}>
          <Image source={{ uri: generatedImage }} style={styles.resultImage} />
        </View>
      )}
      
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 0, marginBottom: 10 },
  previewBox: {
    width: 300,
    height: 400,
    marginTop: 30,
    position: 'relative',
  },
  scrollRow: { flexDirection: 'row', marginBottom: 20 },
  thumbnail: { width: 80, height: 100, borderRadius: 8, marginRight: 10 },
  selected: { borderWidth: 2, borderColor: '#007AFF' },
  resultImage: {
    width: 300,
    height: 400,
    resizeMode: 'contain',
    borderRadius: 12,
    marginTop: 20,
  },
  previewBox: { position: 'relative', width: '100%', height: 400, marginTop: 0, alignItems: 'center' },

  modelImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  itemImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: 0.9,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 0,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
