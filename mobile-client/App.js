import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './navigation/AppNavigator';
import ClosetScreen from './screens/ClosetScreen';
import UploadScreen from './screens/UploadScreen';
import EditItemScreen from './screens/EditItemScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import ClosetCategoryScreen from './screens/ClosetCategoryScreen';
import ModelScreen from './screens/ModelScreen';
import UploadModelScreen from './screens/UploadModelScreen';
import TryOnScreen from './screens/TryOnScreen';
import AccountScreen from './screens/AccountScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={AppNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Account" component={AccountScreen}/>
        <Stack.Screen name="Closet" component={ClosetScreen}/>
        <Stack.Screen name="Upload" component={UploadScreen}/>
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
        <Stack.Screen name="EditItem" component={EditItemScreen} />
        <Stack.Screen name="ClosetCategory" component={ClosetCategoryScreen} />
        <Stack.Screen name="Model" component={ModelScreen} />
        <Stack.Screen name="UploadModel" component={UploadModelScreen}/>
        <Stack.Screen name="TryOn" component={TryOnScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
