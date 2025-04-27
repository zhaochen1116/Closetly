import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { fetchItems } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { deleteItem } from '../services/api';
import { Alert } from 'react-native';
import { updateItemType } from '../services/api'; 



export default function ClosetCategoryScreen({ route }) {
  const { category } = route.params;
  const [items, setItems] = useState([]);
  const navigation = useNavigation();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);



  useEffect(() => {
    const loadItems = async () => {
      const all = await fetchItems();
      
      if (category === 'All') {
        setItems(all); // display all items
      } else {
        const filtered = all.filter(item =>
          item.type.toLowerCase() === category.toLowerCase()
        );
        setItems(filtered);
      }
    };
    loadItems();
  }, [category]);

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
      setSelectedItems([]); // exit select mode and clear selection
    }
  };

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };
  
  const handleDelete = async () => {
    if (selectedItems.length === 0) return;
  
  
    try {
      // delete selected items
      await Promise.all(
        selectedItems.map(id => deleteItem(id))
      );
  
      // mongoDB delete API
      const newItems = items.filter(item => !selectedItems.includes(item._id));
      setItems(newItems);
      setSelectedItems([]);
      setIsSelecting(false);
  
    } catch (error) {
      Alert.alert("delete failure", "please check network or server!");
    }
  };

  const handleMoveSelected = () => {
    if (selectedItems.length === 0) {
      Alert.alert("No items selected");
      return;
    }
  
    Alert.prompt(
      "Move to Category",
      "Enter the new category name (e.g., 'Tops', 'Jackets')",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Move",
          onPress: async (newType) => {
            try {
              // call API to update item type
              await Promise.all(
                selectedItems.map(id => updateItemType(id, newType))
              );
              setSelectedItems([]);
              setIsSelecting(false);
              // refresh items
              loadItems();
            } catch (error) {
              console.error("Move failure:", error);
            }
          }
        }
      ],
      "plain-text"
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>👚 {category}</Text>
      </View>
  
      <FlatList
        data={items}
        keyExtractor={(item, index) => (item.name ? String(item.name) : "item") + index}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            {isSelecting && (
              <TouchableOpacity
                style={styles.checkBox}
                onPress={() => toggleItemSelection(item._id)}
              >
                {selectedItems.includes(item._id) && (
                  <View style={styles.checkedBox} />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />


      {isSelecting && selectedItems.length > 0 && (
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.moveButton} onPress={handleMoveSelected}>
          <Text style={styles.ButtonText}>Move Selected</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.ButtonText}>Delete Selected</Text>
        </TouchableOpacity>
      </View>
)}
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  list: { paddingBottom: 30 },
  card: { flex: 1, margin: 8, backgroundColor: '#f8f8f8', borderRadius: 10, padding: 10, alignItems: 'center' },
  image: { width: 150, height: 320, borderRadius: 8, marginBottom: 10 },
  name: { fontWeight: 'bold' },
  checkBox: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderWidth: 2, borderColor: '#007AFF', borderRadius: 6, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center' },
  checkedBox: { width: 14, height: 14, backgroundColor: '#007AFF', borderRadius: 3 },
  buttonRow: {
    flexDirection: 'row',   
    justifyContent: 'space-between', 
    marginHorizontal: 20,
    marginVertical: 10,
  },
  moveButton: {
    width: 180,
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButton: {
    width: 180,
    backgroundColor: 'red',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
 
  ButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
