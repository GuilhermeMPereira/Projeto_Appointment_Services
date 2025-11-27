import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, KeyboardAvoidingView, StyleSheet, Alert } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase'; 

export default function ChatScreen({ route, navigation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');

  // Recebe o ID do chat. Se não vier, usa um fixo (pode ser a causa se estiver usando ids diferentes)
  const { chatId = 'teste-geral', title = 'Chat' } = route.params || {};

  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  // --- 1. DEBUG: VERIFICA ID NO CONSOLE ---
  useEffect(() => {
    console.log(`📢 Entrou no Chat: ${chatId}`);
  }, [chatId]);

  // --- CARREGAMENTO DAS MENSAGENS ---
  useEffect(() => {
    const collectionRef = collection(db, 'chats', chatId, 'messages');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`📥 Recebeu ${querySnapshot.docs.length} mensagens do banco.`);
      
      setMessages(
        querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
            user: data.user,
          };
        })
      );
      setLoading(false);
    }, (error) => {
      console.error("❌ Erro ao ler mensagens:", error);
      Alert.alert("Erro de Conexão", "Não foi possível carregar as mensagens.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // --- ENVIO DE MENSAGEM ---
  const onSend = useCallback(async (textoParaEnviar) => {
    if (!textoParaEnviar || textoParaEnviar.trim().length === 0) return;

    const userAuth = auth.currentUser;
    
    // Objeto da mensagem
    const novaMensagem = {
      _id: Math.random().toString(),
      text: textoParaEnviar,
      createdAt: new Date(),
      user: {
        _id: userAuth?.uid || 'anonimo',
        name: userAuth?.displayName || 'Usuário',
      }
    };

    // 1. Mostra na tela imediatamente (Otimista)
    setMessages(previousMessages => GiftedChat.append(previousMessages, [novaMensagem]));

    try {
      // 2. Tenta salvar no banco
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        _id: novaMensagem._id,
        createdAt: serverTimestamp(),
        text: novaMensagem.text,
        user: novaMensagem.user
      });
      console.log("✅ Mensagem salva com sucesso no Firestore!");
    } catch (err) {
      console.error("❌ Erro ao salvar mensagem:", err);
      Alert.alert("Erro", "Sua mensagem não foi salva. Verifique sua internet ou permissões.");
    }
  }, [chatId]);

  const handleSendPress = () => {
    onSend(inputText);
    setInputText('');
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: '#007bff' },
          left: { backgroundColor: '#e5e5ea' }
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
         <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#007bff" />
         </View>
      ) : (
        <View style={{flex: 1}}>
          <GiftedChat
            messages={messages}
            user={{ _id: auth?.currentUser?.uid }}
            renderBubble={renderBubble}
            renderInputToolbar={() => null}
            minInputToolbarHeight={0}
            locale="pt-br"
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite uma mensagem..."
              placeholderTextColor="#999"
              onSubmitEditing={handleSendPress}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={handleSendPress} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingCenter: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      }
    })
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});