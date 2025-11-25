import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';

import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [documento, setDocumento] = useState(''); 
  const [tipo, setTipo] = useState('cliente');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      
      Alert.alert("Sucesso", "Conta criada! Faça login para continuar.");
      // O App.js detectará o logout e mostrará a tela de Login automaticamente.

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crie sua conta</Text>

        <View style={styles.typeContainer}>
          <TouchableOpacity style={[styles.typeButton, tipo === 'cliente' && styles.typeButtonSelected]} onPress={() => setTipo('cliente')}>
            <Text style={[styles.typeText, tipo === 'cliente' && styles.typeTextSelected]}>Sou Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeButton, tipo === 'prestador' && styles.typeButtonSelected]} onPress={() => setTipo('prestador')}>
            <Text style={[styles.typeText, tipo === 'prestador' && styles.typeTextSelected]}>Sou Prestador</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput style={[styles.input, errors.nome && styles.inputError]} value={nome} onChangeText={setNome} placeholder="Nome completo" />
        {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={[styles.input, errors.email && styles.inputError]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="email@exemplo.com" />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>{tipo === 'cliente' ? 'CPF' : 'CNPJ'}</Text>
        <TextInput style={[styles.input, errors.documento && styles.inputError]} value={documento} onChangeText={handleDocumentChange} keyboardType="numeric" maxLength={18} placeholder="Documento" />
        {errors.documento && <Text style={styles.errorText}>{errors.documento}</Text>}

        <Text style={styles.label}>Senha</Text>
        <TextInput style={[styles.input, errors.senha && styles.inputError]} value={senha} onChangeText={setSenha} secureTextEntry placeholder="******" />
        {errors.senha && <Text style={styles.errorText}>{errors.senha}</Text>}

        {errors.general && <Text style={styles.errorTextCenter}>{errors.general}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
            <Text style={styles.linkText}>Já tem uma conta? Faça Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  typeContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4 },
  typeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  typeButtonSelected: { backgroundColor: '#007bff' },
  typeText: { fontWeight: '600', color: '#666' },
  typeTextSelected: { color: '#fff' },
  label: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 5, fontSize: 16, backgroundColor: '#fafafa' },
  inputError: { borderColor: '#d9534f', borderWidth: 1.5 },
  errorText: { color: '#d9534f', fontSize: 12, marginBottom: 10 },
  errorTextCenter: { color: '#d9534f', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007bff', fontSize: 16 }
});