import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './src/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Telas
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/registro';
import ClienteHomeScreen from './src/screens/index_cliente';
import PrestadorHomeScreen from './src/screens/index_prestador';

// Telas de Perfil
import PerfilClienteScreen from './src/screens/perfil_cliente';
import PerfilPrestadorScreen from './src/screens/perfil_prestador';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        try {
          const docRef = doc(db, "usuarios", authenticatedUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserRole(docSnap.data().tipo); 
          }
          setUser(authenticatedUser);
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const initialRoute = user && userRole
    ? (userRole === 'prestador' ? 'HomePrestador' : 'HomeCliente')
    : 'Welcome';

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      
      <Stack.Navigator initialRouteName={initialRoute}>
        
        {user && userRole ? (
          // --- USUÁRIO LOGADO ---
          userRole === 'prestador' ? (
             <>
               <Stack.Screen 
                 name="HomePrestador" 
                 component={PrestadorHomeScreen} 
                 options={{ headerShown: false }} 
               />
               <Stack.Screen 
                 name="PerfilPrestador" 
                 component={PerfilPrestadorScreen} 
                 options={{ title: 'Meu Perfil', headerBackTitle: 'Voltar' }}
               />
             </>
          ) : (
             <>
               <Stack.Screen 
                 name="HomeCliente" 
                 component={ClienteHomeScreen} 
                 options={{ headerShown: false }} 
               />
               <Stack.Screen 
                 name="PerfilCliente" 
                 component={PerfilClienteScreen} 
                 options={{ title: 'Meu Perfil', headerBackTitle: 'Voltar' }}
               />
             </>
          )
        ) : (
          // --- USUÁRIO DESLOGADO ---
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ 
                title: '',
                headerTransparent: true,
                headerTintColor: '#007bff'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}