// App.js

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importe suas telas
import WelcomeScreen from './src/screens/WelcomeScreen';


// Crie o navegador
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" /> 
      
      <Stack.Navigator initialRouteName="Welcome">
        {/* Tela 1: Boas-vindas */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }} 
        />
        
        {/* Tela 2: Login */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        
        {/* ⬇️ 2. Adicione a tela de Calendário */}
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ title: 'Meu Calendário' }} // Você pode estilizar o header aqui
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}