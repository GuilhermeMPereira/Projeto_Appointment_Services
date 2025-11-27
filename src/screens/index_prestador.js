import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  TextInput, Alert, FlatList, ActivityIndicator, Platform,
  ImageBackground, Image 
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { auth, db } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import PerfilPrestadorScreen from './perfil_prestador'; 
import { prestadorStyles } from '../styles/prestadorStyles'; // <--- NOVO IMPORT

// Importação de imagens (Usando as mesmas do cliente onde possível ou placeholders)
// Certifique-se de que essas imagens existem na pasta assets
const homeIcon = require('../../assets/pedidos.png'); // Reutilizando pedidosIcon para Home
const agendaIcon = require('../../assets/lupa.jpg'); // Reutilizando lupa para Agenda
const servicoIcon = require('../../assets/avaliar.jpg'); // Reutilizando avaliar para Serviço
const perfilIcon = require('../../assets/perfil.png');
const sairIcon = require('../../assets/sair.png');

LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'br';

// --- COMPONENTES ---

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

  const getBorderColor = (status) => {
      switch(status){
          case 'confirmado': return '#28A745';
          case 'recusado': return '#DC3545';
          default: return '#FFC107'; // Pendente (Amarelo)
      }
  };

  return (
    <View style={{flex:1}}>
      <View style={prestadorStyles.headerSection}>
        <Text style={prestadorStyles.pageTitle}>Solicitações</Text>
        <Text style={prestadorStyles.pageSubtitle}>Gerencie seus pedidos de agendamento</Text>
      </View>
      
      <FlatList 
        data={pedidos} 
        keyExtractor={i=>i.id} 
        contentContainerStyle={{paddingBottom: 20}}
        renderItem={({item}) => (
          <View style={[prestadorStyles.card, {borderLeftColor: getBorderColor(item.status)}]}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={prestadorStyles.cardTitle}>{item.clienteNome}</Text>
                <Text style={{fontWeight:'bold', color: getBorderColor(item.status)}}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={prestadorStyles.cardSubtitle}>{item.servicoNome}</Text>
            <Text style={prestadorStyles.cardText}>📅 {item.dataString}</Text>
            <Text style={prestadorStyles.cardText}>🕒 {item.horaString}</Text>
            
            {item.status==='pendente'&&( 
              <View style={prestadorStyles.rowBtn}>
                <TouchableOpacity style={prestadorStyles.btnAccept} onPress={()=>aceitar(item.id)}>
                  <Text style={prestadorStyles.btnText}>✓ Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={prestadorStyles.btnReject} onPress={()=>recusar(item.id)}>
                  <Text style={prestadorStyles.btnText}>✕ Recusar</Text>
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
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={prestadorStyles.headerSection}>
        <Text style={prestadorStyles.pageTitle}>Agenda</Text>
        <Text style={prestadorStyles.pageSubtitle}>Visualize seus compromissos confirmados</Text>
      </View>

      <View style={{backgroundColor: '#FFF', borderRadius: 16, padding: 10, elevation: 4}}>
          <Calendar 
            markedDates={{...marcados, [dia]:{selected:true, selectedColor:'#0056B3'}}} 
            onDayPress={(d)=>verDia(d.dateString)} 
            theme={{
                todayTextColor: '#0056B3',
                arrowColor: '#0056B3',
                selectedDayBackgroundColor: '#0056B3'
            }}
          />
      </View>

      {dia && (
        <View style={{marginTop:20}}>
          <Text style={[prestadorStyles.cardTitle, {marginBottom: 15}]}>Compromissos em {dia}:</Text>
          {lista.length === 0 ? (
              <Text style={{color:'#6C757D', fontStyle:'italic'}}>Nenhum serviço confirmado para hoje.</Text>
          ) : (
            lista.map(i=>(
                <View key={i.id} style={prestadorStyles.agendaItemContainer}>
                <Text style={prestadorStyles.agendaTime}>{i.horaString}</Text>
                <View>
                    <Text style={{fontWeight:'bold', color:'#343A40'}}>{i.clienteNome}</Text>
                    <Text style={{color:'#6C757D'}}>{i.servicoNome}</Text>
                </View>
                </View>
            ))
          )}
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
      if (Platform.OS === 'web') window.alert("Dados salvos com sucesso!");
      else Alert.alert("Salvo", "Seus serviços foram atualizados."); 
  };
  
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={prestadorStyles.headerSection}>
        <Text style={prestadorStyles.pageTitle}>Meus Serviços</Text>
        <Text style={prestadorStyles.pageSubtitle}>Configure seu perfil e lista de preços</Text>
      </View>

      <View style={prestadorStyles.card}>
        <Text style={[prestadorStyles.cardTitle, {marginBottom: 15}]}>Informações do Negócio</Text>
        
        <Text style={prestadorStyles.label}>Nome do Profissional / Empresa:</Text>
        <TextInput style={prestadorStyles.input} value={nome} onChangeText={setNome} placeholder="Ex: João Eletricista"/>
        
        <Text style={prestadorStyles.label}>Descrição / Bio:</Text>
        <TextInput style={[prestadorStyles.input, {height: 80, textAlignVertical: 'top'}]} multiline value={desc} onChangeText={setDesc} placeholder="Conte um pouco sobre sua experiência..."/>
      </View>

      <View style={prestadorStyles.card}>
        <Text style={[prestadorStyles.cardTitle]}>Catálogo de Serviços</Text>
        
        <View style={prestadorStyles.addArea}>
            <View style={{flex: 1}}>
                <TextInput style={[prestadorStyles.input, {marginBottom: 5}]} placeholder="Nome do Serviço" value={novo} onChangeText={setNovo}/>
                <TextInput style={prestadorStyles.input} placeholder="Preço (R$)" value={preco} onChangeText={setPreco} keyboardType="numeric"/>
            </View>
            <TouchableOpacity style={prestadorStyles.btnAdd} onPress={add}>
                <Text style={{color:'#FFF', fontSize: 24, fontWeight: 'bold'}}>+</Text>
            </TouchableOpacity>
        </View>

        {list.map((l,i)=>(
            <View key={i} style={prestadorStyles.itemServico}>
            <View>
                <Text style={{fontWeight: 'bold', fontSize: 16, color: '#343A40'}}>{l.nome}</Text>
                <Text style={{color: '#28A745', fontWeight: 'bold'}}>R$ {l.preco}</Text>
            </View>
            <TouchableOpacity onPress={()=>{const n=[...list]; n.splice(i,1); setList(n)}}>
                <Text style={{color:'#DC3545', fontWeight:'bold', fontSize: 12}}>REMOVER</Text>
            </TouchableOpacity>
            </View>
        ))}
      </View>

      <TouchableOpacity style={prestadorStyles.btnSalvar} onPress={save}>
        <Text style={prestadorStyles.btnText}>SALVAR ALTERAÇÕES</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default function PrestadorHomeScreen() {
  const navigation = useNavigation();
  const [view, setView] = useState('Home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Estado para sidebar retrátil
  const user = auth.currentUser;

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Tem certeza que deseja sair?");
      if (confirmed) {
        try { await signOut(auth); } catch (error) { console.error("Erro ao sair:", error); }
      }
    } else {
      Alert.alert("Sair", "Tem certeza que deseja sair?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: async () => { try { await signOut(auth); } catch (error) { console.log("Erro ao sair:", error); } } }
      ]);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const menuItems = [
    { key: 'Home', icon: homeIcon, label: 'Solicitações' },
    { key: 'Agenda', icon: agendaIcon, label: 'Agenda' },
    { key: 'Serviço', icon: servicoIcon, label: 'Serviços' },
    { key: 'Perfil', icon: perfilIcon, label: 'Perfil' }
  ];

  return (
    <ImageBackground 
      source={require('../../assets/Fundo.png')} 
      style={prestadorStyles.backgroundImage}
      resizeMode="cover"
    >
        <View style={prestadorStyles.overlay}>
            {/* SIDEBAR */}
            <View style={[
                prestadorStyles.sidebar,
                isSidebarCollapsed ? prestadorStyles.sidebarCollapsed : prestadorStyles.sidebarExpanded
            ]}>
                <View style={prestadorStyles.sidebarHeader}>
                    {!isSidebarCollapsed ? (
                    <>
                        <Text style={prestadorStyles.logoText}>AgendaPro</Text>
                        <Text style={prestadorStyles.logoSubtext}>Prestador</Text>
                    </>
                    ) : (
                    <Text style={prestadorStyles.logoText}>AP</Text>
                    )}
                </View>
                
                <View style={prestadorStyles.menuContainer}>
                    {menuItems.map(item => (
                    <TouchableOpacity 
                        key={item.key} 
                        style={[
                        prestadorStyles.menuItem, 
                        view === item.key && prestadorStyles.menuItemSelected
                        ]} 
                        onPress={() => setView(item.key)}
                    >
                        <Image 
                        source={item.icon} 
                        style={[
                            prestadorStyles.menuIcon,
                            view === item.key && prestadorStyles.menuIconSelected
                        ]} 
                        />
                        {!isSidebarCollapsed && (
                        <Text style={[
                            prestadorStyles.menuText,
                            view === item.key && prestadorStyles.menuTextSelected
                        ]}>
                            {item.label}
                        </Text>
                        )}
                    </TouchableOpacity>
                    ))}
                </View>
                
                <View style={prestadorStyles.sidebarFooter}>
                    <TouchableOpacity 
                    style={prestadorStyles.logoutButton} 
                    onPress={handleLogout}
                    >
                    <Image source={sairIcon} style={[prestadorStyles.menuIcon, {tintColor: '#FFF'}]} />
                    {!isSidebarCollapsed && (
                        <Text style={prestadorStyles.logoutButtonText}>Sair</Text>
                    )}
                    </TouchableOpacity>
                    
                    {!isSidebarCollapsed ? (
                    <Text style={{fontSize: 10, color: '#6C757D', marginTop: 10}}>v1.0</Text>
                    ) : null}
                </View>

                <TouchableOpacity 
                    style={prestadorStyles.collapseButton} 
                    onPress={toggleSidebar}
                >
                    <Text style={prestadorStyles.collapseButtonText}>
                    {isSidebarCollapsed ? '>' : '<'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* CONTEUDO */}
            <View style={prestadorStyles.content}>
                {view==='Home' && <RenderSolicitacoes user={user} />}
                {view==='Agenda' && <RenderAgendaVisual user={user} />}
                {view==='Serviço' && <RenderMeuServico user={user} />}
                {view==='Perfil' && <View style={{flex:1}}><PerfilPrestadorScreen /></View>}
            </View>
        </View>
    </ImageBackground>
  );
}