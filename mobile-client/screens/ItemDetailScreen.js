import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '@env';

export default function ItemDetailScreen({ route }) {
  const { item } = route.params;
  const navigation = useNavigation();

  const handleDelete = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/items/${item._id}`);
            Alert.alert('✅ Deleted successfully');
            navigation.goBack();
          } catch (error) {
            console.error('❌ Delete failed:', error);
            Alert.alert('❌ Delete failed');
          }
        }
      }
    ]);
  };

  const handleEdit = () => {
    navigation.navigate('EditItem', { item });
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.label}>Type:</Text>
      <Text style={styles.value}>{item.type}</Text>
      <Text style={styles.label}>Uploaded at:</Text>
      <Text style={styles.value}>{new Date(item.created_at).toLocaleString()}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.buttonText}>📝 Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  image: { width: '100%', height: 300, borderRadius: 10, marginBottom: 20 },
  label: { fontSize: 16, color: '#888', marginTop: 10 },
  value: { fontSize: 18 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  }
});
