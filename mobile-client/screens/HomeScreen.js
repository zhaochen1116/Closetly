// /screens/HomeScreen.js

import React, { useEffect, useState, useRef  } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, View, Text, Image, StyleSheet, ScrollView, Animated } from 'react-native';
import { WEATHER_API_KEY } from '@env';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '@env';



const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState(null);
  const [city, setCity] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 1000);
    });
  }, []);

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        const locationRes = await fetch('https://ipapi.co/json/');
        const locationData = await locationRes.json();
        const userCity = locationData.city || 'Toronto';
        setCity(userCity);

        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(userCity)}&appid=${WEATHER_API_KEY}&units=metric`);
        const weatherData = await weatherRes.json();
        const temp = weatherData.main.temp;
        const weatherDesc = weatherData.weather[0].main.toLowerCase();

        setTemperature(temp);
        setWeather(weatherDesc);

        const recommendRes = await fetch(`${BASE_URL}/api/recommend-by-weather?temp=${temp}&weather=${weatherDesc}`);
        const recommendData = await recommendRes.json();
        setRecommendations(recommendData.recommendations || []);

      } catch (err) {
        console.error('❌ Error fetching location/weather/recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndWeather();
  }, []);

  function getWeatherGif() {
    if (weather.includes('rain')) return require('../assets/rain.gif');
    if (weather.includes('snow')) return require('../assets/snow.gif');
    if (weather.includes('cloud')) return require('../assets/clouds.gif');
    return require('../assets/sunny.gif');
  }

  if (showSplash) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Image
            source={require('../assets/closetly_logo_10.png')}
            style={{ width: 180, height: 180, resizeMode: 'contain' }}
          />
          <Text style={styles.title}>👋 Welcome to Closetly</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
<SafeAreaView>
  <ScrollView>
    
    {/* 天气区 */}
    <View style={styles.weatherSection}>
      <Image source={getWeatherGif()} style={styles.weatherGif} />
      <Text style={styles.weatherText}>
        {city}: {temperature}°C, {weather}
      </Text>
    </View>

   {/* 推荐区 */}
<View style={styles.recommendSection}>
  {/* 上衣推荐 */}
  <Text style={styles.subtitle}>👕 Recommended Tops</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {recommendations
      .filter(item => {
        const type = (item.type || '').toLowerCase();
        return ['top', 'jacket', 't-shirt'].includes(type);  // filter for tops
      })
      .map((item) => (
        <View key={item._id} style={styles.recommendCard}>
          <Image source={{ uri: item.imageUrl }} style={styles.recommendImage} />
          <Text style={styles.recommendName}>{item.name}</Text>
        </View>
    ))}
  </ScrollView>

  {/* 裤子推荐 */}
  <Text style={styles.subtitle}>👖 Recommended Bottoms</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {recommendations
      .filter(item => {
        const type = (item.type || '').toLowerCase();
        return ['bottom', 'pants', 'skirt', 'shorts'].includes(type);  // filter for bottoms
      })
      .map((item) => (
        <View key={item._id} style={styles.recommendCard}>
          <Image source={{ uri: item.imageUrl }} style={styles.recommendImage} />
          <Text style={styles.recommendName}>{item.name}</Text>
        </View>
    ))}
  </ScrollView>
</View>

  </ScrollView>
</SafeAreaView>

  );
}


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  gif: { width: 300, height: 400, resizeMode: 'cover', borderRadius: 16, marginBottom: 20,},

  weatherText: { fontSize: 16, marginBottom: 20 },
  subtitle: { fontSize: 20, fontWeight: '600', marginVertical: 10 },
  weatherGif: { width: '20%', height: 60, resizeMode: 'cover', borderRadius: 20, marginBottom: 20, },
  recommendRow: { flexDirection: 'row', paddingHorizontal: 10 },
  recommendCard: { marginRight: 20, alignItems: 'center' },
  recommendImage: { width: 120, height: 160, borderRadius: 12, marginBottom: 8 },
  recommendName: { fontSize: 14, textAlign: 'center', paddingTop: 20 },
  weatherSection: { flexDirection: 'row', justifyContent: 'space-between',   alignItems: 'center', width: '100%', paddingHorizontal: 20, marginTop: 20, marginBottom: 30, },
  weatherGif: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0', },
  weatherText: { fontSize: 18, fontWeight: '500', color: '#333', marginLeft: 10, flexShrink: 1, textAlign: 'right',},
  recommendSection: {paddingHorizontal: 10, marginTop: 10, },
  subtitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20,
    paddingTop: 30,
  },
  recommendCard: { backgroundColor: '#fafafa', borderRadius: 12, marginRight: 16, padding: 10, alignItems: 'center', shadowColor: '#ccc', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  recommendImage: {
    width: 120,
    height: 160,
    borderRadius: 10,
    marginBottom: 8,
  },
  recommendName: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  
});
