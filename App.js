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
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/registro';
import ClienteHomeScreen from './src/screens/index_cliente';
import PrestadorHomeScreen from './src/screens/index_prestador';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'cliente' ou 'prestador'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta mudanças na autenticação (Login/Logout)
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      
      if (authenticatedUser) {
        // Se logou, busca no banco se é cliente ou prestador
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
        // Se deslogou
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

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      
      {/* initialRouteName="Login": Define o ponto de partida padrão.
         A mágica acontece abaixo: Se 'user' existe, mostramos SÓ as telas de Home.
         Se 'user' não existe, mostramos SÓ as telas de Auth (Login/Registro).
      */}
      <Stack.Navigator initialRouteName="Login">
        
        {user && userRole ? (
          // --- USUÁRIO LOGADO ---
          userRole === 'prestador' ? (
             <Stack.Screen 
               name="HomePrestador" 
               component={PrestadorHomeScreen} 
               options={{ title: 'Painel do Prestador' }}
             />
          ) : (
             <Stack.Screen 
               name="HomeCliente" 
               component={ClienteHomeScreen} 
               options={{ title: 'Área do Cliente' }}
             />
          )
        ) : (
          // --- USUÁRIO DESLOGADO ---
          <>
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
                headerTransparent: true, // Seta flutuante
                headerTintColor: '#007bff'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}