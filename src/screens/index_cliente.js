import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Alert, FlatList, Modal, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <--- 1. Importado para navegação
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { auth, db } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, getDocs, addDoc, query, where, onSnapshot 
} from 'firebase/firestore';

LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'br';

const HORARIOS_PADRAO = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function ClienteHomeScreen() {
  const [view, setView] = useState('Busca');
  const user = auth.currentUser;
  const navigation = useNavigation(); // <--- 2. Hook de navegação iniciado

  const handleLogout = () => signOut(auth).catch(err => console.error(err));

  // --- 1. BUSCA & AGENDAMENTO ---
  const RenderBusca = () => {
    const [prestadores, setPrestadores] = useState([]);
    const [searchText, setSearchText] = useState('');
    
    // Estados do Agendamento
    const [selectedPrestador, setSelectedPrestador] = useState(null);
    const [selectedService, setSelectedService] = useState(null); 
    const [modalVisible, setModalVisible] = useState(false);
    const [step, setStep] = useState(0); 
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
      getDocs(collection(db, 'prestadores')).then(snap => {
        const lista = [];
        snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
        setPrestadores(lista);
      });
    }, []);

    const iniciarAgendamento = (prestador) => {
      setSelectedPrestador(prestador);
      setStep(0); 
      setModalVisible(true);
      setSelectedService(null);
      setSelectedDate('');
      setAvailableSlots([]);
    };

    const escolherServico = (servico) => {
      setSelectedService(servico);
      setStep(1); 
    };

    const onDayPress = async (day) => {
      const dataSelecionada = new Date(day.timestamp);
      const agora = new Date();
      const dataMinima = new Date(agora.getTime() + (24 * 60 * 60 * 1000));
      dataMinima.setHours(0,0,0,0);
      dataSelecionada.setHours(0,0,0,0);

      if (dataSelecionada < dataMinima) {
        Alert.alert("Atenção", "Agendamentos apenas com 24h de antecedência.");
        return;
      }

      setSelectedDate(day.dateString);
      setLoadingSlots(true);

      try {
        const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', selectedPrestador.id), where('dataString', '==', day.dateString), where('status', '==', 'confirmado'));
        const snapshot = await getDocs(q);
        const horariosOcupados = snapshot.docs.map(doc => doc.data().horaString);
        const slotsLivres = HORARIOS_PADRAO.filter(hora => !horariosOcupados.includes(hora));
        
        setAvailableSlots(slotsLivres);
        setStep(2);
      } catch (error) {
        Alert.alert("Erro", "Erro ao verificar agenda.");
      } finally {
        setLoadingSlots(false);
      }
    };

    const solicitarAgendamento = async (hora) => {
      try {
        await addDoc(collection(db, 'agendamentos'), {
          clienteId: user.uid,
          clienteNome: "Cliente App", 
          prestadorId: selectedPrestador.id,
          servicoNome: selectedService.nome, 
          servicoPreco: selectedService.preco,
          dataAgendamento: new Date(`${selectedDate}T${hora}:00`), 
          dataString: selectedDate, 
          horaString: hora,         
          status: 'pendente'
        });
        Alert.alert("Solicitação Enviada!", "O prestador analisará seu pedido.");
        setModalVisible(false);
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Falha ao enviar.");
      }
    };

    const listaFiltrada = prestadores.filter(p => {
      const searchLower = searchText.toLowerCase();
      const nomeMatch = p.nomeAnuncio?.toLowerCase().includes(searchLower);
      const servicoMatch = p.meusServicos && p.meusServicos.some(s => s.nome.toLowerCase().includes(searchLower));
      return nomeMatch || servicoMatch;
    });

    return (
      <View style={{flex:1}}>
        <Text style={styles.title}>Encontrar Profissional</Text>
        <TextInput style={styles.input} placeholder="Buscar prestador ou serviço..." value={searchText} onChangeText={setSearchText} />
        
        <FlatList 
          data={listaFiltrada}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.nomeAnuncio}</Text>
              <Text style={{color:'#666', fontStyle:'italic'}}>{item.descricao}</Text>
              
              <View style={{marginTop:5, flexDirection:'row', flexWrap:'wrap'}}>
                {item.meusServicos?.slice(0,3).map((s,i) => (
                  <Text key={i} style={styles.tagServico}>{s.nome}</Text>
                ))}
                {item.meusServicos?.length > 3 && <Text style={{fontSize:10, color:'#999'}}>...</Text>}
              </View>

              <TouchableOpacity style={styles.btnAction} onPress={() => iniciarAgendamento(item)}>
                <Text style={styles.btnText}>Ver Serviços</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{selectedPrestador?.nomeAnuncio}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnClose}><Text style={{color:'red'}}>Fechar X</Text></TouchableOpacity>

            {step === 0 && (
              <View>
                <Text style={styles.label}>Escolha o serviço:</Text>
                {!selectedPrestador?.meusServicos || selectedPrestador.meusServicos.length === 0 ? (
                  <Text style={styles.textMsg}>Este prestador ainda não cadastrou serviços.</Text>
                ) : (
                  selectedPrestador.meusServicos.map((s, idx) => (
                    <TouchableOpacity key={idx} style={styles.itemServicoModal} onPress={() => escolherServico(s)}>
                      <Text style={{fontWeight:'bold', fontSize:16}}>{s.nome}</Text>
                      <Text style={{color:'green'}}>R$ {s.preco}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {step === 1 && (
              <View>
                <TouchableOpacity onPress={() => setStep(0)}><Text style={styles.colorBlue}>← Voltar</Text></TouchableOpacity>
                <Text style={styles.label}>Para: {selectedService?.nome}</Text>
                <Text style={styles.label}>Escolha a Data:</Text>
                <Calendar onDayPress={onDayPress} />
                {loadingSlots && <ActivityIndicator size="large" color="#0056B3" style={{marginTop:20}} />}
              </View>
            )}

            {step === 2 && (
              <View>
                <TouchableOpacity onPress={() => setStep(1)}><Text style={styles.colorBlue}>← Voltar</Text></TouchableOpacity>
                <Text style={styles.label}>Horários Livres em {selectedDate}:</Text>
                {availableSlots.length === 0 ? <Text style={styles.textMsg}>Agenda lotada.</Text> : (
                  <View style={styles.grid}>
                    {availableSlots.map((hora, idx) => (
                      <TouchableOpacity key={idx} style={styles.slotLivre} onPress={() => solicitarAgendamento(hora)}>
                        <Text style={{color:'green', fontWeight:'bold'}}>{hora}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </Modal>
      </View>
    );
  };

  // --- 2. PEDIDOS (COM CHAT) ---
  const RenderMeusPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    useEffect(() => {
      const q = query(collection(db, 'agendamentos'), where('clienteId', '==', user.uid));
      const unsub = onSnapshot(q, (snap) => {
        const lista = [];
        snap.forEach(d => lista.push({ id: d.id, ...d.data() }));
        setPedidos(lista);
      });
      return () => unsub();
    }, []);

    const getCor = (st) => (st==='confirmado' ? '#D4EDDA' : st==='pendente' ? '#FFF3CD' : '#F8D7DA');

    return (
      <View>
        <Text style={styles.title}>Meus Pedidos</Text>
        <FlatList 
          data={pedidos}
          keyExtractor={i => i.id}
          renderItem={({item}) => (
            <View style={[styles.card, {backgroundColor: getCor(item.status)}]}>
              <Text style={styles.cardTitle}>{item.servicoNome}</Text>
              <Text>R$ {item.servicoPreco}</Text>
              <Text>{item.dataString} às {item.horaString}</Text>
              <Text style={{fontWeight:'bold', marginTop:5}}>Status: {item.status.toUpperCase()}</Text>
              
              {/* --- 3. BOTÃO DE CHAT ADICIONADO --- */}
              <TouchableOpacity 
                style={styles.btnChat}
                onPress={() => navigation.navigate('Chat', { 
                  chatId: item.id, // ID único do agendamento
                  title: item.servicoNome // Título da conversa
                })}
              >
                <Text style={styles.btnText}>💬 Chat com Prestador</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };

  const RenderAvaliar = () => (
    <View><Text style={styles.title}>Avaliações</Text><Text style={styles.textMsg}>Disponível após conclusão.</Text></View>
  );

  const RenderPerfil = () => (
    <View><Text style={styles.title}>Perfil</Text><Text>{user.email}</Text><TouchableOpacity style={styles.btnDanger} onPress={handleLogout}><Text style={styles.btnText}>Sair</Text></TouchableOpacity></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.logoText}>App</Text>
        {['Busca', 'Pedidos', 'Avaliar', 'Perfil'].map(i => (
          <TouchableOpacity key={i} style={[styles.menuItem, view===i && styles.menuSelected]} onPress={()=>setView(i)}>
            <Text style={[styles.menuText, view===i && styles.textSelected]}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {view === 'Busca' && <RenderBusca />}
        {view === 'Pedidos' && <RenderMeusPedidos />}
        {view === 'Avaliar' && <RenderAvaliar />}
        {view === 'Perfil' && <RenderPerfil />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: { width: '25%', backgroundColor: '#6C757D', paddingTop: 40, alignItems: 'center' },
  content: { flex: 1, padding: 15, backgroundColor: '#FFF' },
  logoText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 30 },
  menuItem: { width: '100%', paddingVertical: 15, alignItems: 'center' },
  menuSelected: { backgroundColor: '#5a6268', borderLeftWidth: 4, borderLeftColor: '#FFF' },
  menuText: { color: '#DDD', fontSize: 12 },
  textSelected: { color: '#FFF', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginBottom: 15 },
  card: { padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#FFF', elevation: 2 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  btnAction: { backgroundColor: '#0056B3', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  
  // --- 4. ESTILO NOVO PARA O CHAT ---
  btnChat: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  colorBlue: { color: 'blue', marginBottom: 15 },

  btnText: { color: '#FFF', fontWeight: 'bold' },
  btnDanger: { backgroundColor: '#DC3545', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  modalContainer: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#FFF' },
  btnClose: { alignSelf: 'flex-end', padding: 10, marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  slotLivre: { backgroundColor: '#D4EDDA', padding: 15, margin: 5, borderRadius: 5, borderWidth: 1, borderColor: 'green' },
  textMsg: { color: '#888', fontStyle: 'italic', marginTop: 10 },
  tagServico: { fontSize:10, backgroundColor:'#EEE', paddingHorizontal:6, paddingVertical:2, borderRadius:4, marginRight:4, marginBottom:4, color:'#555' },
  itemServicoModal: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', justifyContent: 'space-between' }
});