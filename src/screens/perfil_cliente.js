import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { auth, db } from '../firebase/firebase';
import { updateProfile, updateEmail, updatePassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore'; // <--- Adicionado collection, query...
import { useNavigation } from '@react-navigation/native'; // <--- Adicionado useNavigation
import { profileStyles } from '../styles/ProfileStyles';

export default function PerfilClienteScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  
  // Estados para o Chat
  const [chatsAtivos, setChatsAtivos] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const user = auth.currentUser;
  const navigation = useNavigation(); // Hook de navegação

  // Helper para exibir alertas na Web e no Celular
  const showAlert = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // 1. Buscar Dados do Usuário
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
  }, [user]);

  // 2. Buscar Agendamentos Confirmados (Para o Chat)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'agendamentos'), 
      where('clienteId', '==', user.uid),
      where('status', '==', 'confirmado') // Apenas confirmados
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatsAtivos(lista);
      setLoadingChats(false);
    }, (error) => {
      console.error("Erro ao buscar chats:", error);
      setLoadingChats(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Função de Atualizar Perfil
  const handleUpdate = async () => {
    if (!nome || !email) {
      showAlert("Atenção", "Nome e E-mail são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: nome,
        email: email
      }, { merge: true });

      if (user.displayName !== nome) {
        await updateProfile(user, { displayName: nome });
      }

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
          showAlert("Configuração Firebase", "A troca de e-mail está bloqueada no console.");
        } else {
          showAlert("Atenção", "Nome salvo, mas erro ao atualizar e-mail/senha: " + authError.message);
        }
      }

    } catch (error) {
      console.error("Erro Geral:", error);
      showAlert("Erro", "Não foi possível salvar os dados.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <ActivityIndicator size="large" color="#0056B3" style={{marginTop:50}} />;

  return (
    <View style={profileStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={profileStyles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* CONTAINER RESPONSIVO */}
          <View style={profileStyles.responsiveContainer}>
            
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

            {/* --- NOVA SEÇÃO: CHATS ATIVOS --- */}
            <Text style={[profileStyles.sectionTitle, { marginTop: 30 }]}>Serviços em Andamento</Text>
            
            {loadingChats ? (
              <ActivityIndicator color="#0056B3" />
            ) : chatsAtivos.length === 0 ? (
              <Text style={{color: '#6C757D', fontStyle: 'italic', textAlign: 'center', marginBottom: 20}}>
                Nenhum serviço confirmado no momento.
              </Text>
            ) : (
              chatsAtivos.map((chat) => (
                <TouchableOpacity 
                  key={chat.id}
                  style={{
                    backgroundColor: '#E8F5E9',
                    borderColor: '#28A745',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 15,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onPress={() => navigation.navigate('ChatScreen', { 
                    chatId: chat.id, 
                    title: chat.servicoNome 
                  })}
                >
                  <View style={{flex: 1}}>
                    <Text style={{fontWeight: 'bold', color: '#155724', fontSize: 16}}>
                      {chat.servicoNome}
                    </Text>
                    <Text style={{color: '#155724', fontSize: 12}}>
                      📅 {chat.dataString} às {chat.horaString}
                    </Text>
                  </View>
                  <View style={{backgroundColor: '#28A745', padding: 8, borderRadius: 20}}>
                     <Text style={{color: '#FFF', fontSize: 20}}>💬</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            {}

          </View>
          {/* FIM CONTAINER RESPONSIVO */}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}