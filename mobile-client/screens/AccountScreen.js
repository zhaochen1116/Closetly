import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';

export default function AccountScreen() {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => console.log('Logged out!') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* user avatar image */}
      <Image
        source={require('../assets/avatar.png')}  // default avatar image
        style={styles.avatar}
      />

      {/* username */}
      <Text style={styles.username}>Username</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingTop: 60 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
