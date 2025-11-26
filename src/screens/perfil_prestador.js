import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { auth, db } from '../firebase/firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { profileStyles } from '../styles/ProfileStyles';

export default function PerfilPrestadorScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const user = auth.currentUser;

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
          }
        } catch (error) { console.error(error); } 
        finally { setInitialLoading(false); }
      }
    };
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    if (!nome || !email) { Alert.alert("Erro", "Preencha os campos."); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, "usuarios", user.uid), { nome, email });
      try { await updateDoc(doc(db, "prestadores", user.uid), { nomeAnuncio: nome }); } catch(e){}
      
      if (user.displayName !== nome) await updateProfile(user, { displayName: nome });
      if (user.email !== email) await updateEmail(user, email);
      
      if (novaSenha) {
        if (novaSenha.length < 6) { Alert.alert("Erro", "Senha curta."); setLoading(false); return; }
        await updatePassword(user, novaSenha);
      }
      Alert.alert("Sucesso", "Perfil atualizado!");
      setNovaSenha('');
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar.");
    } finally { setLoading(false); }
  };

  if (initialLoading) return <ActivityIndicator size="large" color="#0056B3" style={{marginTop:50}} />;

  return (
    <View style={profileStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={profileStyles.scrollContainer}>
          <View style={profileStyles.header}>
            <View style={[profileStyles.avatarContainer, { borderColor: '#28A745' }]}> 
              <Text style={[profileStyles.avatarText, { color: '#28A745' }]}>{nome.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={profileStyles.title}>Perfil Profissional</Text>
            <Text style={profileStyles.subtitle}>Prestador</Text>
          </View>

          <Text style={profileStyles.sectionTitle}>Dados</Text>
          <View style={profileStyles.inputGroup}>
            <Text style={profileStyles.label}>Nome</Text>
            <TextInput style={profileStyles.input} value={nome} onChangeText={setNome} />
          </View>
          <View style={profileStyles.inputGroup}>
            <Text style={profileStyles.label}>E-mail</Text>
            <TextInput style={profileStyles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
          </View>

          <Text style={profileStyles.sectionTitle}>Segurança</Text>
          <View style={profileStyles.inputGroup}>
            <Text style={profileStyles.label}>Nova Senha</Text>
            <TextInput style={profileStyles.input} value={novaSenha} onChangeText={setNovaSenha} secureTextEntry />
          </View>

          <TouchableOpacity style={[profileStyles.button, { backgroundColor: '#28A745' }]} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={profileStyles.buttonText}>Salvar Dados</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}