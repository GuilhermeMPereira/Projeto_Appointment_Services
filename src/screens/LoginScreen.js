// src/screens/LoginScreen.js

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';

// Necessário para o useAuthRequest funcionar
WebBrowser.maybeCompleteAuthSession();

// Endpoint de descoberta do Google (são sempre os mesmos)
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function LoginScreen({ navigation }) {
  // Estado para mostrar o "Carregando..."
  const [isLoading, setIsLoading] = React.useState(false);

  // --- CONFIGURAÇÃO DO LOGIN ---
  const redirectUri = makeRedirectUri({
    useProxy: true,
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '227849659136-v3mjt6l7a1j19q9c8dbhhtte2g13vod2.apps.googleusercontent.com',
      scopes: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar' // A permissão principal
      ],
      redirectUri,
    },
    discovery
  );
  // --- FIM DA CONFIGURAÇÃO ---


  // Este useEffect roda quando o usuário volta do login do Google
  React.useEffect(() => {
    
    // Verifica se a resposta foi um SUCESSO
    if (response?.type === 'success') {
      const { access_token } = response.params;
      console.log('Login deu certo! Token:', access_token);
      
      // Para de carregar
      setIsLoading(false);

      // ⬇️ ESTA É A NAVEGAÇÃO CORRETA ⬇️
      // Reseta a navegação e envia o usuário para a tela 'Calendar',
      // passando o token de acesso como parâmetro.
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'Calendar', // O nome da rota que definimos no App.js
            params: { accessToken: access_token } // Passa o token para a tela de calendário
          }
        ],
      });
      // ⬆️ FIM DA NAVEGAÇÃO ⬆️

    } else if (response?.type === 'error' || response?.type === 'cancel') {
      // Se o usuário cancelar ou der erro, esconde o "Carregando..."
      setIsLoading(false);
      console.log('Login cancelado ou falhou:', response);
    }
  }, [response, navigation]); // Adicionamos 'navigation' aqui

  // Função que o botão vai chamar
  const handleLoginPress = () => {
    setIsLoading(true); // Mostra o "Carregando..."
    promptAsync({ useProxy: true }); // Chame o login
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quase lá!</Text>
        <Text style={styles.subtitle}>
          Para ver seus eventos, precisamos da sua permissão para acessar o Google Calendar.
        </Text>
        
        {/* Se estiver carregando, mostra o indicador, senão, mostra o botão */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLoginPress} 
            disabled={!request}
          >
            <Text style={styles.buttonText}>Login com Google</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// Estilos para ficar parecido com sua WelcomeScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA', // Um fundo similar
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#276eb1ff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#627D98',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});