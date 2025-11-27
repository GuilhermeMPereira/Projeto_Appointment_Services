import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { auth, db } from '../firebase/firebase';
import { updateProfile, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { profileStyles } from '../styles/ProfileStyles';

export default function PerfilClienteScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const user = auth.currentUser;

  // Helper para exibir alertas na Web e no Celular
  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setNome(data.nome || '');
            setEmail(user.email || ''); 
          } else {
            setNome(user.displayName || '');
            setEmail(user.email || '');
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error);
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!nome || !email) {
      showAlert("Atenção", "Nome e E-mail são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      // 1. Atualizar Firestore (Dados do banco)
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: nome,
        email: email
      }, { merge: true });

      // 2. Atualizar Auth (Nome de exibição)
      if (user.displayName !== nome) {
        await updateProfile(user, { displayName: nome });
      }

      // 3. Atualizar Auth (E-mail e Senha)
      // Essas operações são sensíveis e podem pedir login recente
      try {
        if (user.email !== email) {
          await updateEmail(user, email);
        }
        
        if (novaSenha && novaSenha.length >= 6) {
          await updatePassword(user, novaSenha);
        } else if (novaSenha) {
          showAlert("Aviso", "A nova senha foi ignorada pois é muito curta (mínimo 6 dígitos).");
        }

        showAlert("Sucesso", "Perfil atualizado com sucesso!");
        setNovaSenha('');

      } catch (authError) {
        console.error("Erro Auth Sensível:", authError);
        
        if (authError.code === 'auth/requires-recent-login') {
          showAlert("Segurança", "Para alterar E-mail ou Senha, você precisa sair e fazer login novamente.");
        } else if (authError.code === 'auth/operation-not-allowed') {
          showAlert("Configuração Firebase", "A troca de e-mail está bloqueada no console do Firebase. Desative a 'Email enumeration protection' nas configurações de Authentication.");
        } else {
          showAlert("Atenção", "Nome salvo, mas erro ao atualizar e-mail/senha: " + authError.message);
        }
      }

    } catch (error) {
      console.error("Erro Geral:", error);
      showAlert("Erro", "Não foi possível salvar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Lógica de logout simples
    signOut(auth).catch(err => console.error(err));
  };

  if (initialLoading) return <ActivityIndicator size="large" color="#0056B3" style={{marginTop:50}} />;

  return (
    <View style={profileStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={profileStyles.scrollContainer}>
          <View style={profileStyles.header}>
            <View style={profileStyles.avatarContainer}>
              <Text style={profileStyles.avatarText}>
                {nome ? nome.charAt(0).toUpperCase() : 'C'}
              </Text>
            </View>
            <Text style={profileStyles.title}>Meu Perfil</Text>
            <Text style={profileStyles.subtitle}>Cliente</Text>
          </View>

          <Text style={profileStyles.sectionTitle}>Dados Pessoais</Text>
          <View style={profileStyles.inputGroup}>
            <Text style={profileStyles.label}>Nome</Text>
            <TextInput 
              style={profileStyles.input} 
              value={nome} 
              onChangeText={setNome} 
              placeholder="Seu nome completo"
            />
          </View>
          <View style={profileStyles.inputGroup}>
            <Text style={profileStyles.label}>E-mail</Text>
            <TextInput 
              style={profileStyles.input} 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none" 
              keyboardType="email-address"
            />
          </View>

          <Text style={profileStyles.sectionTitle}>Segurança</Text>
          <View style={profileStyles.inputGroup}>
            <Text style={profileStyles.label}>Nova Senha</Text>
            <TextInput 
              style={profileStyles.input} 
              value={novaSenha} 
              onChangeText={setNovaSenha} 
              secureTextEntry 
              placeholder="Deixe em branco para manter a atual" 
            />
          </View>

          <TouchableOpacity style={profileStyles.button} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={profileStyles.buttonText}>Salvar Alterações</Text>}
          </TouchableOpacity>

        

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}