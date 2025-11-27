import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, ScrollView, ImageBackground,
  KeyboardAvoidingView, Platform, Alert, SafeAreaView
} from 'react-native';
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { registerStyles } from '../styles/RegisterScreenStyles';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [documento, setDocumento] = useState(''); 
  const [tipo, setTipo] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    setDocumento('');
    setErrors({});
  }, [tipo]);

  // Formatação CPF/CNPJ
  const handleDocumentChange = (text) => {
    let onlyNums = text.replace(/\D/g, "");
    if (tipo === 'cliente') {
      if (onlyNums.length > 11) onlyNums = onlyNums.slice(0, 11);
      onlyNums = onlyNums.replace(/(\d{3})(\d)/, "$1.$2");
      onlyNums = onlyNums.replace(/(\d{3})(\d)/, "$1.$2");
      onlyNums = onlyNums.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      if (onlyNums.length > 14) onlyNums = onlyNums.slice(0, 14);
      onlyNums = onlyNums.replace(/^(\d{2})(\d)/, "$1.$2");
      onlyNums = onlyNums.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      onlyNums = onlyNums.replace(/\.(\d{3})(\d)/, ".$1/$2");
      onlyNums = onlyNums.replace(/(\d{4})(\d)/, "$1-$2");
    }
    setDocumento(onlyNums);
  };

  // Validações
  const validate = () => {
    let currentErrors = {};
    let isValid = true;

    const hasNumber = /\d/;
    if (!nome) {
      currentErrors.nome = "Nome é obrigatório.";
      isValid = false;
    } else if (hasNumber.test(nome)) {
      currentErrors.nome = "Nome inválido (não deve conter números).";
      isValid = false;
    }

    if (!email || !email.includes('@')) {
      currentErrors.email = "E-mail inválido.";
      isValid = false;
    }

    const cleanDoc = documento.replace(/\D/g, "");
    if (tipo === 'cliente' && cleanDoc.length !== 11) {
      currentErrors.documento = "CPF incompleto.";
      isValid = false;
    } else if (tipo === 'prestador' && cleanDoc.length !== 14) {
      currentErrors.documento = "CNPJ incompleto.";
      isValid = false;
    }

    if (senha.length < 6) {
      currentErrors.senha = "A senha deve ter no mínimo 6 caracteres.";
      isValid = false;
    }

    setErrors(currentErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      // 1. Cria usuário
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // 2. Salva no banco
      const dadosUsuario = { nome, email, tipo, documento };
      await setDoc(doc(db, "usuarios", uid), dadosUsuario);

      if (tipo === 'prestador') {
        const dadosPrestador = {
          nomeAnuncio: nome, tipoServico: "", descricao: "", avaliacaoMedia: 0.0, portfolio: []
        };
        await setDoc(doc(db, "prestadores", uid), dadosPrestador);
      }

      // 3. Desloga para o usuário ir para a tela de Login
      await signOut(auth);
      
      if (Platform.OS === 'web') {
        alert("Sucesso: Conta criada! Faça login para continuar.");
        navigation.navigate('Login');
      } else {
        Alert.alert("Sucesso", "Conta criada! Faça login para continuar.", [
            { text: "OK", onPress: () => navigation.navigate('Login') }
        ]);
      }

    } catch (error) {
      console.error(error);
      let msg = "Erro ao criar conta.";
      if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
      setErrors({ ...errors, general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Fundo Fixo como Pai
    <ImageBackground 
      source={require('../../assets/fundoHome.png')} 
      style={registerStyles.backgroundImage}
      resizeMode="cover"
    >
      <View style={registerStyles.overlay}>
        
        <SafeAreaView style={registerStyles.container}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={registerStyles.container}
          >
            <ScrollView 
              contentContainerStyle={registerStyles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              
              {/* Container do Formulário (Max Width) */}
              <View style={registerStyles.formContainer}>
                
                <View style={registerStyles.header}>
                  <Text style={registerStyles.title}>Crie sua conta</Text>
                </View>

                {/* Seletor Cliente/Prestador */}
                <View style={registerStyles.typeContainer}>
                  <TouchableOpacity 
                    style={[
                      registerStyles.typeButton, 
                      tipo === 'cliente' && registerStyles.typeButtonSelected
                    ]} 
                    onPress={() => setTipo('cliente')}
                  >
                    <Text style={[
                      registerStyles.typeText, 
                      tipo === 'cliente' && registerStyles.typeTextSelected
                    ]}>
                      Sou Cliente
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      registerStyles.typeButton, 
                      tipo === 'prestador' && registerStyles.typeButtonSelected
                    ]} 
                    onPress={() => setTipo('prestador')}
                  >
                    <Text style={[
                      registerStyles.typeText, 
                      tipo === 'prestador' && registerStyles.typeTextSelected
                    ]}>
                      Sou Prestador
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Campos do Formulário */}
                <Text style={registerStyles.label}>Nome</Text>
                <TextInput
                  style={[
                    registerStyles.input,
                    focusedInput === 'nome' && registerStyles.inputFocused,
                    errors.nome && registerStyles.inputError
                  ]}
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() => setFocusedInput('nome')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Nome completo"
                  placeholderTextColor="#8a8a8a"
                />
                {errors.nome && <Text style={registerStyles.errorText}>{errors.nome}</Text>}

                <Text style={registerStyles.label}>E-mail</Text>
                <TextInput
                  style={[
                    registerStyles.input,
                    focusedInput === 'email' && registerStyles.inputFocused,
                    errors.email && registerStyles.inputError
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="email@exemplo.com"
                  placeholderTextColor="#8a8a8a"
                />
                {errors.email && <Text style={registerStyles.errorText}>{errors.email}</Text>}

                <Text style={registerStyles.label}>{tipo === 'cliente' ? 'CPF' : 'CNPJ'}</Text>
                <TextInput
                  style={[
                    registerStyles.input,
                    focusedInput === 'documento' && registerStyles.inputFocused,
                    errors.documento && registerStyles.inputError
                  ]}
                  value={documento}
                  onChangeText={handleDocumentChange}
                  onFocus={() => setFocusedInput('documento')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="numeric"
                  maxLength={18}
                  placeholder="Documento"
                  placeholderTextColor="#8a8a8a"
                />
                {errors.documento && <Text style={registerStyles.errorText}>{errors.documento}</Text>}

                <Text style={registerStyles.label}>Senha</Text>
                <TextInput
                  style={[
                    registerStyles.input,
                    focusedInput === 'senha' && registerStyles.inputFocused,
                    errors.senha && registerStyles.inputError
                  ]}
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => setFocusedInput('senha')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                  placeholder="******"
                  placeholderTextColor="#8a8a8a"
                />
                {errors.senha && <Text style={registerStyles.errorText}>{errors.senha}</Text>}

                {errors.general && <Text style={registerStyles.errorTextCenter}>{errors.general}</Text>}

                <TouchableOpacity 
                  style={[
                    registerStyles.button,
                    loading && registerStyles.buttonDisabled
                  ]} 
                  onPress={handleRegister} 
                  disabled={loading}
                >
                  {loading ? (
                    <View style={registerStyles.loadingContainer}>
                      <ActivityIndicator color="#FFF" />
                    </View>
                  ) : (
                    <Text style={registerStyles.buttonText}>Cadastrar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')} 
                  style={registerStyles.linkContainer}
                >
                  <Text style={registerStyles.linkText}>Já tem uma conta? Faça Login</Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

      </View>
    </ImageBackground>
  );
}