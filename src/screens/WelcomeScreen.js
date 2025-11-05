// src/screens/WelcomeScreen.js

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- MUDANÇA AQUI

export default function WelcomeScreen({ navigation }) {

const goToLoginScreen = () => {
  navigation.navigate('Login'); // <-- CORRIGIDO
};

  const cloudsBackground = { uri: 'https://i.pinimg.com/736x/e2/29/94/e2299480579cedc702576002d063f029.jpg' }; // Substitua por sua imagem real

  return (
    <SafeAreaView style={styles.container}>
      {/* Usamos ImageBackground aqui */}
      <ImageBackground source={cloudsBackground} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.content}>
          <Text style={styles.title}>WeatherPos</Text>
          <Text style={styles.subtitle}>
            Encontre informações de endereço e clima a partir de um CEP.
          </Text>
          <TouchableOpacity style={styles.button} onPress={goToLoginScreen}>
            <Text style={styles.buttonText}>Começar</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    // backgroundColor: '#E0F7FA', /
  },
  backgroundImage: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#276eb1ff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
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