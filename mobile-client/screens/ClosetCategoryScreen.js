import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { fetchItems } from '../services/api';

export default function ClosetCategoryScreen({ route }) {
  const { category } = route.params;
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👚 {category}</Text>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.name + index}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  list: { paddingBottom: 30 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  name: { fontWeight: 'bold' },
});
