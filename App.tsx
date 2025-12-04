import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddMahasiswaScreen from "./src/screens/AddMahasiswaScreen";
import EditMahasiswaScreen from "./src/screens/EditMahasiswaScreen";

import { getToken } from './src/storage/authStorage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const checkToken = async () => {
    const token = await getToken();
    setLoggedIn(!!token);
    setIsLoading(false);
  };

  // AsyncStorage untuk auto login
  useEffect(() => {
    checkToken();
    const interval = setInterval(checkToken, 300);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {loggedIn ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="AddMahasiswa" component={AddMahasiswaScreen} />
              <Stack.Screen name="EditMahasiswa" component={EditMahasiswaScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}