import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { fetchItems } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';



const categories = ['tryon', 'All', 'top', 'pants', 'pajama', 't-shirt', 'jacket', 'dress', 'others', 'underwear', 'shoes', 'socks'];


const categoryIcons = {
  All: require('../assets/all.png'),
  top: require('../assets/top_1.png'),
  pants: require('../assets/pants.png'),
  pajama: require('../assets/pajama.avif'),
  't-shirt': require('../assets/t_shirt.png'),
  jacket: require('../assets/jacket.png'),
  dress: require('../assets/dress.png'),
  others: require('../assets/others.png'),
  tryon: require('../assets/tryon.png'),
  underwear: require('../assets/underwear.png'),
  shoes: require('../assets/shoes.png'),
  socks: require('../assets/socks.png'),
};

const MyClosetScreen = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const navigation = useNavigation();

  useEffect(() => {
    // default filter to 'All' when the component mounts
    setFilter('All');
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await fetchItems();
    setItems(data);
  };


  const filteredItems =
    filter === 'All' ? items : items.filter(item => item.type.toLowerCase().includes(filter.toLowerCase()));
    const renderItem = ({ item }) => {
      let imageSrc = { uri: 'https://via.placeholder.com/100' };
    
      if (item.imageUrl) {
        imageSrc = { uri: item.imageUrl };
      } else if (item.imageBase64) {
        imageSrc = { uri: `data:image/jpeg;base64,${item.imageBase64}` };
      }
    
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ItemDetail', { item })}
        >
          <Image source={imageSrc} style={styles.image} />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.type}</Text>
        </TouchableOpacity>
      );
    };

    return (
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <Button
            title="➕ Upload New Item"
            onPress={() => navigation.navigate('Upload')}
            color="#007AFF"  
          />
          </View>
          <View style={styles.grid}>
            {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.folder}
            onPress={() => navigation.navigate('ClosetCategory', { category })}
          >
            <Image source={categoryIcons[category]} style={styles.folderIcon} />
            <Text style={styles.folderName}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        </View>
      </ScrollView>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: '#fff', paddingHorizontal: 10 },
  headerRow: {
    flexDirection: 'row',            
    justifyContent: 'space-between', 
    alignItems: 'right',             
    marginBottom: 10,
  },
  
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  filterText: {
    marginRight: 12,
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeFilter: { color: '#000', fontWeight: 'bold', borderColor: '#000' },
  list: { paddingBottom: 30 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  image: { width: 100, height: 100, borderRadius: 6, marginBottom: 10 },
  name: { fontWeight: 'bold' },
  type: { color: '#777' },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  folder: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: '1.66%',
  },
  folderIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
    folderName: { marginTop: 10, fontSize: 14, fontWeight: '500' },
});

export default MyClosetScreen;
