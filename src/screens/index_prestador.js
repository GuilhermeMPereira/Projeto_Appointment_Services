import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Alert, FlatList, ActivityIndicator, Platform // <--- Importado Platform
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { auth, db } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import PerfilPrestadorScreen from './perfil_prestador'; 

LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'br';

// --- COMPONENTES EXTRAÍDOS ---

const RenderSolicitacoes = ({ user }) => {
  const [pedidos, setPedidos] = useState([]);
  
  useEffect(() => { 
    const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', user.uid)); 
    const u = onSnapshot(q, (s) => { 
      const l=[]; 
      s.forEach(d=>l.push({id: d.id, ...d.data()})); 
      setPedidos(l.sort((a,b) => a.status === 'pendente' ? -1 : 1)); 
    }); 
    return ()=>u(); 
  }, [user]);

  const aceitar = async (id) => { 
    try { 
      await updateDoc(doc(db, 'agendamentos', id), { status: 'confirmado' }); 
      if (Platform.OS === 'web') window.alert("Sucesso: Confirmado!");
      else Alert.alert("Sucesso", "Confirmado!"); 
    } catch (e) { 
        if (Platform.OS === 'web') window.alert("Erro");
        else Alert.alert("Erro"); 
    } 
  };
  
  const recusar = async (id) => await updateDoc(doc(db, 'agendamentos', id), { status: 'recusado' });

  return (
    <View style={{flex:1}}>
      <Text style={styles.title}>Solicitações</Text>
      <FlatList 
        data={pedidos} 
        keyExtractor={i=>i.id} 
        renderItem={({item}) => (
          <View style={[styles.card, item.status==='confirmado'&&{borderLeftColor:'green', borderLeftWidth:5}]}>
            <Text style={styles.cardTitle}>{item.clienteNome}</Text>
            <Text style={{color:'#0056B3'}}>{item.servicoNome}</Text>
            <Text>{item.dataString} - {item.horaString}</Text>
            <Text>Status: {item.status.toUpperCase()}</Text>
            {item.status==='pendente'&&( 
              <View style={styles.rowBtn}>
                <TouchableOpacity style={styles.btnAccept} onPress={()=>aceitar(item.id)}>
                  <Text style={styles.btnText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnReject} onPress={()=>recusar(item.id)}>
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

const RenderAgendaVisual = ({ user }) => {
  const [marcados, setMarcados] = useState({}); 
  const [lista, setLista] = useState([]); 
  const [dia, setDia] = useState('');
  
  useEffect(() => { 
    const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', user.uid), where('status', '==', 'confirmado')); 
    const u = onSnapshot(q, (s) => { 
      const d={}; 
      s.forEach(x=>{d[x.data().dataString]={marked:true, dotColor:'#0056B3'}}); 
      setMarcados(d); 
    }); 
    return ()=>u(); 
  }, [user]);

  const verDia = (ds) => { 
    setDia(ds); 
    const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', user.uid), where('dataString', '==', ds), where('status', '==', 'confirmado')); 
    onSnapshot(q, (s)=>{ 
      const l=[]; 
      s.forEach(x=>l.push({id:x.id, ...x.data()})); 
      setLista(l.sort((a,b)=>a.horaString.localeCompare(b.horaString))); 
    }); 
  };

  return (
    <ScrollView>
      <Text style={styles.title}>Agenda</Text>
      <Calendar 
        markedDates={{...marcados, [dia]:{selected:true, selectedColor:'#0056B3'}}} 
        onDayPress={(d)=>verDia(d.dateString)} 
      />
      {dia && (
        <View style={{marginTop:20}}>
          <Text>Serviços em {dia}:</Text>
          {lista.map(i=>(
            <View key={i.id} style={styles.itemAgenda}>
              <Text style={{fontWeight:'bold', color:'#0056B3'}}>{i.horaString}</Text>
              <Text style={{marginLeft:10}}>{i.clienteNome} - {i.servicoNome}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const RenderMeuServico = ({ user }) => {
  const [nome, setNome] = useState(''); 
  const [desc, setDesc] = useState(''); 
  const [list, setList] = useState([]); 
  const [novo, setNovo] = useState(''); 
  const [preco, setPreco] = useState('');
  
  useEffect(()=>{ 
    getDoc(doc(db, 'prestadores', user.uid)).then(s=>{ 
      if(s.exists()){ 
        const d=s.data(); 
        setNome(d.nomeAnuncio||''); 
        setDesc(d.descricao||''); 
        setList(d.meusServicos||[]); 
      }
    }); 
  }, [user]);

  const add = () => { if(!novo) return; setList([...list, {nome:novo, preco}]); setNovo(''); setPreco(''); };
  const save = async () => { 
      await setDoc(doc(db, 'prestadores', user.uid), { nomeAnuncio:nome, descricao:desc, meusServicos:list }, {merge:true}); 
      if (Platform.OS === 'web') window.alert("Salvo!");
      else Alert.alert("Salvo!"); 
  };
  
  return (
    <ScrollView>
      <Text style={styles.title}>Serviços</Text>
      <Text style={styles.label}>Negócio:</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome}/>
      <Text style={styles.label}>Desc:</Text>
      <TextInput style={styles.input} value={desc} onChangeText={setDesc}/>
      <View style={styles.addArea}>
        <TextInput style={[styles.input, {flex:2}]} placeholder="Serviço" value={novo} onChangeText={setNovo}/>
        <TextInput style={[styles.input, {flex:1}]} placeholder="$" value={preco} onChangeText={setPreco}/>
        <TouchableOpacity style={styles.btnAdd} onPress={add}><Text style={{color:'#FFF'}}>+</Text></TouchableOpacity>
      </View>
      {list.map((l,i)=>(
        <View key={i} style={styles.itemServico}>
          <Text>{l.nome} - R$ {l.preco}</Text>
          <TouchableOpacity onPress={()=>{const n=[...list]; n.splice(i,1); setList(n)}}><Text style={{color:'red'}}>X</Text></TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.btnSalvar} onPress={save}><Text style={styles.btnText}>Salvar</Text></TouchableOpacity>
    </ScrollView>
  );
};

export default function PrestadorHomeScreen() {
  const navigation = useNavigation();
  const [view, setView] = useState('Home');
  const user = auth.currentUser;

  // --- LOGOUT HÍBRIDO ---
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Tem certeza que deseja sair?");
      if (confirmed) {
        try {
          await signOut(auth);
        } catch (error) {
          console.error("Erro ao sair:", error);
        }
      }
    } else {
      Alert.alert(
        "Sair", 
        "Tem certeza que deseja sair?", 
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Sair", 
            onPress: async () => {
              try {
                await signOut(auth);
              } catch (error) {
                console.log("Erro ao sair:", error);
              }
            } 
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={{width:'100%', alignItems:'center'}}>
          <Text style={styles.logoText}>Prestador</Text>
          {['Home', 'Agenda', 'Serviço', 'Perfil'].map(i => (
            <TouchableOpacity key={i} style={[styles.menuItem, view===i && styles.selected]} onPress={()=>setView(i)}>
              <Text style={styles.menuText}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity style={styles.menuLogout} onPress={handleLogout}>
          <Text style={styles.textLogout}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {view==='Home' && <RenderSolicitacoes user={user} />}
        {view==='Agenda' && <RenderAgendaVisual user={user} />}
        {view==='Serviço' && <RenderMeuServico user={user} />}
        {view==='Perfil' && <View style={{flex:1}}><PerfilPrestadorScreen /></View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: { width: '28%', backgroundColor: '#0056B3', paddingTop: 40, paddingBottom: 20, alignItems: 'center', justifyContent: 'space-between' },
  content: { flex: 1, padding: 15, backgroundColor: '#F8F9FA' },
  logoText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 30 },
  menuItem: { width: '100%', paddingVertical: 15, alignItems: 'center' },
  selected: { backgroundColor: '#004494', borderLeftWidth: 4, borderLeftColor: '#FFF' },
  menuText: { color: '#B0C4DE', fontSize: 13, textAlign: 'center' },
  menuLogout: { width: '100%', paddingVertical: 15, alignItems: 'center', backgroundColor: '#DC3545' },
  textLogout: { color: '#FFF', fontWeight: 'bold' },
  
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