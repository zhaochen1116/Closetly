import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Picker, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { fetchItems, fetchModelPhotos } from '../services/api';
import { fetchItemsWithBase64, fetchModelPhotosWithBase64 } from '../services/api';
import { Alert } from 'react-native';


export default function TryOnScreen() {
  const [models, setModels] = useState([]);
  const [clothes, setClothes] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedClothing, setSelectedClothing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedImage, setGeneratedImage] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const modelData = await fetchModelPhotosWithBase64();
      const itemData = await fetchItemsWithBase64();
      setModels(modelData);
      setClothes(itemData);
      setLoading(false);
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
      // Step 1: 启动 Try-On 请求
      const response = await fetch(`http://192.168.40.9:9000/api/tryon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelBase64: selectedModel.imageBase64,      // ⬅️ 从模型中取出 base64
          clothingBase64: selectedClothing.imageBase64 // ⬅️ 从衣物中取出 base64
        }),
      });
  
      const result = await response.json();
      console.log("🎯 服务器响应：", result);
      const taskId = result.id; // 从后端响应中获取任务 ID
      if (!taskId) {
        throw new Error("No task ID returned");
      }
  
      // Step 2: 轮询状态
      let attempts = 0;
      const maxAttempts = 30;
  
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`http://192.168.40.9:9000/api/tryon/status/${taskId}`);
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
      }, 2000); // 每 2 秒轮询
  
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧍 Try On Clothes</Text>

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
      
      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
        <Text style={styles.generateButtonText}>✨ Generate Try-On</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>🎯 Try-On Preview:</Text>
      {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}
      {/* tryon展示 */}
      {generatedImage && (
        <View style={styles.previewBox}>
          <Image source={{ uri: generatedImage }} style={styles.resultImage} />
        </View>
      )}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  previewBox: {
    width: 300,
    height: 400,
    marginTop: 30,
    position: 'relative',
  },
  scrollRow: { flexDirection: 'row', marginBottom: 20 },
  thumbnail: { width: 80, height: 100, borderRadius: 8, marginRight: 10 },
  selected: { borderWidth: 2, borderColor: '#007AFF' },
  previewBox: { position: 'relative', width: '100%', height: 400, marginTop: 20, alignItems: 'center' },
//   modelImage: { width: 250, height: 400, resizeMode: 'contain', position: 'absolute' },
//   clothingImage: { width: 250, height: 400, resizeMode: 'contain', position: 'absolute', opacity: 0.9 },
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
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
