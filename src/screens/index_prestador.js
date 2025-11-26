import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Alert, FlatList, ActivityIndicator 
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { auth, db } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { 
  doc, updateDoc, collection, query, where, onSnapshot, getDoc, setDoc 
} from 'firebase/firestore';

LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'br';

export default function PrestadorHomeScreen() {
  const [view, setView] = useState('Home');
  const user = auth.currentUser;

  const handleLogout = () => signOut(auth).catch(err => console.error(err));

  // --- 1. SOLICITAÇÕES ---
  const RenderSolicitacoes = () => {
    const [pedidos, setPedidos] = useState([]);
    
    useEffect(() => {
      const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', user.uid));
      const unsub = onSnapshot(q, (snap) => {
        const lista = [];
        snap.forEach(d => lista.push({id: d.id, ...d.data()}));
        setPedidos(lista.sort((a,b) => a.status === 'pendente' ? -1 : 1));
      });
      return () => unsub();
    }, []);

    const aceitarPedido = async (id) => {
      try {
        await updateDoc(doc(db, 'agendamentos', id), { status: 'confirmado' });
        Alert.alert("Sucesso", "Serviço confirmado!");
      } catch (error) {
        Alert.alert("Erro", "Falha ao aceitar.");
      }
    };

    const recusarPedido = async (id) => {
      await updateDoc(doc(db, 'agendamentos', id), { status: 'recusado' });
    };

    return (
      <View style={{flex:1}}>
        <Text style={styles.title}>Solicitações</Text>
        <FlatList 
          data={pedidos}
          keyExtractor={i => i.id}
          renderItem={({item}) => (
            <View style={[styles.card, item.status === 'confirmado' && {borderLeftColor: 'green', borderLeftWidth: 5}]}>
              <Text style={styles.cardTitle}>{item.clienteNome}</Text>
              <Text style={{fontWeight:'bold', color:'#0056B3'}}>{item.servicoNome}</Text>
              <Text>Dia: {item.dataString} às {item.horaString}</Text>
              <Text style={{marginTop:5}}>Status: {item.status.toUpperCase()}</Text>

              {item.status === 'pendente' && (
                <View style={styles.rowBtn}>
                  <TouchableOpacity style={styles.btnAccept} onPress={() => aceitarPedido(item.id)}>
                    <Text style={styles.btnText}>Aceitar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnReject} onPress={() => recusarPedido(item.id)}>
                    <Text style={styles.btnText}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </View>
    );
  };

  // --- 2. AGENDA VISUAL ---
  const RenderAgendaVisual = () => {
    const [marcados, setMarcados] = useState({});
    const [listaDia, setListaDia] = useState([]);
    const [diaSelecionado, setDiaSelecionado] = useState('');

    useEffect(() => {
      const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', user.uid), where('status', '==', 'confirmado'));
      const unsub = onSnapshot(q, (snap) => {
        const datas = {};
        snap.forEach(d => { datas[d.data().dataString] = { marked: true, dotColor: '#0056B3' }; });
        setMarcados(datas);
      });
      return () => unsub();
    }, []);

    const verDetalhesDia = (dateString) => {
      setDiaSelecionado(dateString);
      const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', user.uid), where('dataString', '==', dateString), where('status', '==', 'confirmado'));
      onSnapshot(q, (snap) => {
        const lista = [];
        snap.forEach(d => lista.push({id: d.id, ...d.data()}));
        setListaDia(lista.sort((a,b) => a.horaString.localeCompare(b.horaString)));
      });
    };

    return (
      <ScrollView>
        <Text style={styles.title}>Agenda Confirmada</Text>
        <Calendar markedDates={{...marcados, [diaSelecionado]: {selected: true, selectedColor: '#0056B3'}}} onDayPress={(day) => verDetalhesDia(day.dateString)} />
        {diaSelecionado && (
          <View style={{marginTop: 20}}>
            <Text style={{fontWeight:'bold'}}>Serviços em {diaSelecionado}:</Text>
            {listaDia.map(item => (
              <View key={item.id} style={styles.itemAgenda}>
                <Text style={{fontWeight:'bold', color:'#0056B3'}}>{item.horaString}</Text>
                <Text style={{marginLeft: 15}}>{item.clienteNome} - {item.servicoNome}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // --- 3. MEU SERVIÇO (AGORA COM LISTA) ---
  const RenderMeuServico = () => {
    const [nomeAnuncio, setNomeAnuncio] = useState(''); // Nome da Loja/Prestador
    const [descricao, setDescricao] = useState('');     // Descrição geral
    const [meusServicos, setMeusServicos] = useState([]); // Array de serviços

    // Inputs temporários para adicionar novo serviço
    const [novoServico, setNovoServico] = useState('');
    const [novoPreco, setNovoPreco] = useState('');

    useEffect(() => {
      getDoc(doc(db, 'prestadores', user.uid)).then(s => {
        if(s.exists()) {
          const d = s.data();
          setNomeAnuncio(d.nomeAnuncio || '');
          setDescricao(d.descricao || '');
          setMeusServicos(d.meusServicos || []);
        }
      });
    }, []);

    const adicionarServicoNaLista = () => {
      if (!novoServico.trim()) {
        Alert.alert("Erro", "Digite o nome do serviço");
        return;
      }
      const item = { nome: novoServico, preco: novoPreco };
      setMeusServicos([...meusServicos, item]);
      setNovoServico('');
      setNovoPreco('');
    };

    const removerServico = (index) => {
      const novaLista = [...meusServicos];
      novaLista.splice(index, 1);
      setMeusServicos(novaLista);
    };

    const salvarTudo = async () => {
      await setDoc(doc(db, 'prestadores', user.uid), {
        nomeAnuncio,
        descricao,
        meusServicos // Salva o array completo
      }, {merge: true});
      Alert.alert("Sucesso", "Serviços atualizados!");
    };

    return (
      <ScrollView>
        <Text style={styles.title}>Perfil do Negócio</Text>
        <Text style={styles.label}>Nome do Negócio/Profissional:</Text>
        <TextInput style={styles.input} value={nomeAnuncio} onChangeText={setNomeAnuncio} placeholder="Ex: Barbearia do Zé" />
        
        <Text style={styles.label}>Descrição Geral:</Text>
        <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="Ex: Especialista em cortes clássicos" />

        <Text style={[styles.title, {marginTop: 30}]}>Meus Serviços Oferecidos</Text>
        
        {/* FORMULÁRIO PARA ADICIONAR SERVIÇO */}
        <View style={styles.addArea}>
          <TextInput 
            style={[styles.input, {flex: 2, marginRight: 5}]} 
            placeholder="Nome (Ex: Corte de Cabelo)" 
            value={novoServico} 
            onChangeText={setNovoServico} 
          />
          <TextInput 
            style={[styles.input, {flex: 1, marginRight: 5}]} 
            placeholder="R$ 0,00" 
            value={novoPreco} 
            onChangeText={setNovoPreco} 
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.btnAdd} onPress={adicionarServicoNaLista}>
            <Text style={{color:'#FFF', fontWeight:'bold'}}>+</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE SERVIÇOS CADASTRADOS */}
        {meusServicos.map((item, index) => (
          <View key={index} style={styles.itemServico}>
            <View>
              <Text style={{fontWeight:'bold'}}>{item.nome}</Text>
              <Text style={{color:'green'}}>R$ {item.preco}</Text>
            </View>
            <TouchableOpacity onPress={() => removerServico(index)}>
              <Text style={{color:'red'}}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.btnSalvar} onPress={salvarTudo}>
          <Text style={styles.btnText}>Salvar Tudo</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const RenderPerfil = () => (
    <View style={{alignItems:'center', paddingTop:50}}><Text style={styles.title}>Perfil</Text><Text>{user.email}</Text><TouchableOpacity style={styles.btnReject} onPress={handleLogout}><Text style={styles.btnText}>Sair</Text></TouchableOpacity></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.logoText}>Prestador</Text>
        {['Home', 'Agenda', 'Serviço', 'Perfil'].map(i => (
          <TouchableOpacity key={i} style={[styles.menuItem, view===i && styles.selected]} onPress={()=>setView(i)}>
            <Text style={styles.menuText}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {view==='Home' && <RenderSolicitacoes />}
        {view==='Agenda' && <RenderAgendaVisual />}
        {view==='Serviço' && <RenderMeuServico />}
        {view==='Perfil' && <RenderPerfil />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: { width: '28%', backgroundColor: '#0056B3', paddingTop: 40, alignItems: 'center' },
  content: { flex: 1, padding: 15, backgroundColor: '#F8F9FA' },
  logoText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 30 },
  menuItem: { width: '100%', paddingVertical: 15, alignItems: 'center' },
  selected: { backgroundColor: '#004494', borderLeftWidth: 4, borderLeftColor: '#FFF' },
  menuText: { color: '#B0C4DE', fontSize: 13, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  label: { fontSize: 14, color: '#555', marginTop: 10 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, marginTop: 5 },
  btnSalvar: { backgroundColor: '#28A745', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 2 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  rowBtn: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  btnAccept: { backgroundColor: '#28A745', padding: 8, borderRadius: 5, width: '48%', alignItems: 'center' },
  btnReject: { backgroundColor: '#DC3545', padding: 8, borderRadius: 5, width: '48%', alignItems: 'center' },
  itemAgenda: { flexDirection: 'row', backgroundColor: '#E9ECEF', padding: 10, borderRadius: 5, marginBottom: 5, alignItems: 'center' },
  
  
  addArea: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  btnAdd: { backgroundColor: '#0056B3', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemServico: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#FFF', borderRadius: 8, marginBottom: 5, borderWidth: 1, borderColor: '#EEE' }
});