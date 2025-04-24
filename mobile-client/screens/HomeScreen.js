// /screens/HomeScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function HomeScreen({ navigation }) {


  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/closetly_logo_10.png')} // 👈 你的Closetly logo图
        style={styles.logo}
      />
      <Text style={styles.title}>👋 Welcome to Closetly</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Upload')}
        >
          <Text style={styles.buttonText}>📤 Upload Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Closet')}
        >
          <Text style={styles.buttonText}>👚 My Closet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Model')}>
          <Text style={styles.buttonText}>👤 Model Folder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('TryOn')}
        >
          <Text style={styles.buttonText}>🎽 Outfit Ideas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditItem')}>
          <Text style={styles.buttonText}>📝 Edit Item</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 320, height: 320, resizeMode: 'contain', marginBottom: 10, },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20,},
  card: { width: 140, height: 100, backgroundColor: '#fefefe', borderColor: '#eee', borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    padding: 10, margin: 10, shadowColor: '#f88', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2, },
  icon: { width: 28, height: 28, tintColor: '#E91E63', // 粉色
    marginBottom: 8, },
  label: { fontSize: 14, color: '#333', fontWeight: '500', },
  button: { width: 150, height: 60, padding: 16, backgroundColor: '#000', borderRadius: 10, marginBottom: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16,  },
});
