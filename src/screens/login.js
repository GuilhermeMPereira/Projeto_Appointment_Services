// src/screens/loogin.js
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, ScrollView, ImageBackground,
  KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { loginStyles } from '../styles/LoginScreenStyles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    
    if (!email || !senha) {
      setErrorMsg("Por favor, preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // O App.js detectará o login e mudará a tela automaticamente.
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') setErrorMsg("E-mail ou senha incorretos.");
      else if (error.code === 'auth/user-not-found') setErrorMsg("Usuário não encontrado.");
      else if (error.code === 'auth/wrong-password') setErrorMsg("Senha incorreta.");
      else if (error.code === 'auth/too-many-requests') setErrorMsg("Muitas tentativas. Tente mais tarde.");
      else setErrorMsg("Ocorreu um erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={loginStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={loginStyles.container}
      >
        <ScrollView 
          style={loginStyles.container}
          contentContainerStyle={loginStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground 
            source={require('../../assets/fundoHome.png')} 
            style={loginStyles.backgroundImage}
            resizeMode="cover"
          >
            <View style={loginStyles.overlay}>
              <View style={loginStyles.formContainer}>
                <View style={loginStyles.header}>
                  <Text style={loginStyles.title}>Acessar</Text>
                  <Text style={loginStyles.subtitle}>Entre na sua conta para continuar</Text>
                </View>
                
                <Text style={loginStyles.label}>E-mail</Text>
                <TextInput
                  style={[
                    loginStyles.input,
                    focusedInput === 'email' && loginStyles.inputFocused
                  ]}
                  placeholder="seu@email.com"
                  placeholderTextColor="#8a8a8a"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={loginStyles.label}>Senha</Text>
                <TextInput
                  style={[
                    loginStyles.input,
                    focusedInput === 'senha' && loginStyles.inputFocused
                  ]}
                  placeholder="******"
                  placeholderTextColor="#8a8a8a"
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setFocusedInput('senha')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                />

                {errorMsg && <Text style={loginStyles.errorText}>{errorMsg}</Text>}

                <TouchableOpacity 
                  style={[
                    loginStyles.button,
                    loading && loginStyles.buttonDisabled
                  ]} 
                  onPress={handleLogin} 
                  disabled={loading}
                >
                  {loading ? (
                    <View style={loginStyles.loadingContainer}>
                      <ActivityIndicator color="#FFF" />
                    </View>
                  ) : (
                    <Text style={loginStyles.buttonText}>Entrar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => navigation.navigate('Register')} 
                  style={loginStyles.linkContainer}
                >
                  <Text style={loginStyles.linkText}>Não tem conta? Crie aqui</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}