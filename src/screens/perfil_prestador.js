import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { auth, db } from '../firebase/firebase';
import { updateProfile, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { profileStyles } from '../styles/ProfileStyles';

export default function PerfilPrestadorScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const user = auth.currentUser;

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
          console.error(error); 
        } finally { 
          setInitialLoading(false); 
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!nome || !email) { 
      showAlert("Erro", "Preencha todos os campos."); 
      return; 
    }
    setLoading(true);
    try {
      // 1. Salvar no Firestore
      await setDoc(doc(db, "usuarios", user.uid), { nome, email }, { merge: true });
      
      // Sincronizar com a coleção de prestadores
      try { 
        await setDoc(doc(db, "prestadores", user.uid), { nomeAnuncio: nome }, { merge: true }); 
      } catch(e) {
        console.log("Erro sync prestador:", e);
      }
      
      // 2. Atualizar Auth (Nome)
      if (user.displayName !== nome) await updateProfile(user, { displayName: nome });
      
      // 3. Atualizar Auth (E-mail/Senha)
      try {
        if (user.email !== email) await updateEmail(user, email);
        
        if (novaSenha && novaSenha.length >= 6) {
          await updatePassword(user, novaSenha);
        } else if (novaSenha) {
          showAlert("Aviso", "Senha muito curta ignorada.");
        }
        
        showAlert("Sucesso", "Perfil atualizado!");
        setNovaSenha('');
      } catch (authError) {
        console.error("Erro Auth:", authError);
        if (authError.code === 'auth/requires-recent-login') {
          showAlert("Segurança", "Para alterar dados sensíveis, saia e faça login novamente.");
        } else if (authError.code === 'auth/operation-not-allowed') {
          showAlert("Bloqueio Firebase", "Desative a 'Email enumeration protection' no Console do Firebase > Authentication > Settings.");
        } else {
          showAlert("Erro parcial", "Nome salvo, mas erro no email/senha: " + authError.message);
        }
      }

    } catch (error) {
      showAlert("Erro", "Falha ao atualizar dados.");
      console.error(error);
    } finally { 
      setLoading(false); 
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(err => console.error(err));
  };

  if (initialLoading) return <ActivityIndicator size="large" color="#0056B3" style={{marginTop:50}} />;

  return (
    <View style={profileStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={profileStyles.scrollContainer}>
          <View style={profileStyles.header}>
            <View style={[profileStyles.avatarContainer, { borderColor: '#28A745' }]}> 
              <Text style={[profileStyles.avatarText, { color: '#28A745' }]}>
                {nome ? nome.charAt(0).toUpperCase() : 'P'}
              </Text>
            </View>
            <Text style={profileStyles.title}>Perfil Profissional</Text>
            <Text style={profileStyles.subtitle}>Prestador</Text>
          </View>

          <Text style={profileStyles.sectionTitle}>Dados da Conta</Text>
          <View style={profileStyles.inputGroup}>
            <Text style={profileStyles.label}>Nome Comercial</Text>
            <TextInput 
              style={profileStyles.input} 
              value={nome} 
              onChangeText={setNome} 
              placeholder="Nome exibido aos clientes"
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
              placeholder="Mínimo 6 caracteres"
            />
          </View>

          <TouchableOpacity style={[profileStyles.button, { backgroundColor: '#28A745' }]} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={profileStyles.buttonText}>Salvar Dados</Text>}
          </TouchableOpacity>

         

        
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}