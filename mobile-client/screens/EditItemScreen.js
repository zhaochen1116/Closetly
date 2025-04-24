import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const BASE_URL = "http://192.168.40.9:9000"; // backend URL

export default function EditItemScreen({ route }) {
  const { item } = route.params;
  const navigation = useNavigation();

  const [name, setName] = useState(item.name);
  const [type, setType] = useState(item.type);

  const handleSave = async () => {
    try {
      await axios.put(`${BASE_URL}/api/items/${item._id}`, {
        name,
        type,
      });
      Alert.alert('✅ Updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error("❌ Update failed:", error);
      Alert.alert('❌ Failed to update item.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Type"
        value={type}
        onChangeText={setType}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>💾 Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
