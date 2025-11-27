import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  TextInput, Alert, FlatList, Platform,
  ImageBackground, Image, useWindowDimensions 
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { auth, db } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import PerfilPrestadorScreen from './perfil_prestador'; 
import { prestadorStyles } from '../styles/prestadorStyles';

// Imagens
const homeIcon = require('../../assets/pedidos.png'); 
const agendaIcon = require('../../assets/lupa.jpg'); 
const servicoIcon = require('../../assets/avaliar.jpg'); 
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
  const navigation = useNavigation();
  
  useEffect(() => { 
    const q = query(collection(db, 'agendamentos'), where('prestadorId', '==', user.uid)); 
    const u = onSnapshot(q, (s) => { 
      const l=[]; 
      s.forEach(d=>l.push({id: d.id, ...d.data()})); 
      
      setPedidos(l.sort((a,b) => {
        const priority = ['pendente', 'aguardando_finalizacao'];
        const aPrio = priority.includes(a.status);
        const bPrio = priority.includes(b.status);
        if (aPrio && !bPrio) return -1;
        if (!aPrio && bPrio) return 1;
        return 0;
      })); 
    }); 
    return ()=>u(); 
  }, [user]);

  const aceitar = async (id) => { 
    try { 
      await updateDoc(doc(db, 'agendamentos', id), { status: 'confirmado' }); 
      if (Platform.OS === 'web') window.alert("Sucesso: Confirmado!");
      else Alert.alert("Sucesso", "Confirmado!"); 
    } catch (e) { 
        console.error(e);
        Alert.alert("Erro ao confirmar"); 
    } 
  };
  
  const recusar = async (id) => await updateDoc(doc(db, 'agendamentos', id), { status: 'recusado' });

  // --- CORREÇÃO AQUI: Lógica de alerta compatível com WEB ---
  const solicitarFinalizacao = async (id) => {
    try {
      await updateDoc(doc(db, 'agendamentos', id), { status: 'aguardando_finalizacao' });
      
      if (Platform.OS === 'web') {
        window.alert("Solicitação Enviada! O cliente foi notificado.");
      } else {
        Alert.alert("Solicitação Enviada", "O cliente foi notificado para confirmar a conclusão.");
      }
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') window.alert("Erro: Não foi possível enviar.");
      else Alert.alert("Erro", "Não foi possível enviar a solicitação.");
    }
  };

  const confirmarAcaoFinalizar = (id) => {
    if (Platform.OS === 'web') {
      // Lógica específica para WEB
      const confirmou = window.confirm("Finalizar Serviço: Deseja solicitar ao cliente a finalização deste serviço?");
      if (confirmou) {
        solicitarFinalizacao(id);
      }
    } else {
      // Lógica para CELULAR
      Alert.alert(
        "Finalizar Serviço",
        "Deseja solicitar ao cliente a finalização deste serviço?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim, finalizar", onPress: () => solicitarFinalizacao(id) }
        ]
      );
    }
  };

  const getBorderColor = (status) => {
      switch(status){
          case 'confirmado': return '#28A745';
          case 'aguardando_finalizacao': return '#17A2B8';
          case 'finalizado': return '#6C757D';
          case 'recusado': return '#DC3545';
          default: return '#FFC107'; 
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
                <Text style={{fontWeight:'bold', color: getBorderColor(item.status)}}>{item.status.toUpperCase().replace('_', ' ')}</Text>
            </View>
            <Text style={prestadorStyles.cardSubtitle}>{item.servicoNome}</Text>
            <Text style={prestadorStyles.cardText}>📅 {item.dataString}</Text>
            <Text style={prestadorStyles.cardText}>🕒 {item.horaString}</Text>
            
            {item.status === 'pendente' && ( 
              <View style={prestadorStyles.rowBtn}>
                <TouchableOpacity style={prestadorStyles.btnAccept} onPress={()=>aceitar(item.id)}>
                  <Text style={prestadorStyles.btnText}>✓ Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={prestadorStyles.btnReject} onPress={()=>recusar(item.id)}>
                  <Text style={prestadorStyles.btnText}>✕ Recusar</Text>
                </TouchableOpacity>
              </View> 
            )}

            {(item.status === 'confirmado' || item.status === 'aguardando_finalizacao') && (
              <View>
                <TouchableOpacity 
                  style={prestadorStyles.btnChat} 
                  onPress={() => navigation.navigate('ChatScreen', { chatId: item.id, title: item.clienteNome })}
                >
                  <Text style={prestadorStyles.btnText}>💬 Chat com Cliente</Text>
                </TouchableOpacity>

                {/* Botão Finalizar com a nova lógica de clique */}
                {item.status === 'confirmado' && (
                  <TouchableOpacity 
                    style={{
                      marginTop: 10, 
                      backgroundColor: '#17A2B8', 
                      padding: 12, 
                      borderRadius: 10, 
                      alignItems: 'center', 
                      elevation: 2
                    }} 
                    onPress={() => confirmarAcaoFinalizar(item.id)}
                  >
                    <Text style={prestadorStyles.btnText}>🏁 Finalizar Serviço</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'aguardando_finalizacao' && (
                  <Text style={{marginTop: 10, color: '#17A2B8', fontStyle: 'italic', textAlign: 'center'}}>
                    Aguardando confirmação do cliente...
                  </Text>
                )}
              </View>
            )}

            {item.status === 'finalizado' && (
               <Text style={{marginTop: 10, color: '#28A745', fontWeight: 'bold', textAlign: 'center'}}>
                 ✅ Serviço Concluído
               </Text>
            )}
          </View>
        )}
      />
    </View>
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

        {/* SCROLL INTERNO PARA A LISTA DE SERVIÇOS */}
        <ScrollView style={prestadorStyles.servicesListScroll} nestedScrollEnabled={true}>
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
        </ScrollView>
      </View>

      <TouchableOpacity style={prestadorStyles.btnSalvar} onPress={save}>
        <Text style={prestadorStyles.btnText}>SALVAR ALTERAÇÕES</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- TELA PRINCIPAL RESPONSIVA ---

export default function PrestadorHomeScreen() {
  const navigation = useNavigation();
  const [view, setView] = useState('Home');
  const { width } = useWindowDimensions();
  const isMobile = width < 768; 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  const user = auth.currentUser;

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Tem certeza que deseja sair?");
      if (confirmed) await signOut(auth);
    } else {
      Alert.alert("Sair", "Tem certeza que deseja sair?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", onPress: async () => await signOut(auth) }
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
            
            {/* SIDEBAR (Renderiza apenas se NÃO for Mobile) */}
            {!isMobile && (
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
                      <TouchableOpacity style={prestadorStyles.logoutButton} onPress={handleLogout}>
                        <Image source={sairIcon} style={[prestadorStyles.menuIcon, {tintColor: '#FFF'}]} />
                        {!isSidebarCollapsed && <Text style={prestadorStyles.logoutButtonText}>Sair</Text>}
                      </TouchableOpacity>
                      {!isSidebarCollapsed && <Text style={{fontSize: 10, color: '#6C757D', marginTop: 10}}>v1.0</Text>}
                  </View>

                  <TouchableOpacity style={prestadorStyles.collapseButton} onPress={toggleSidebar}>
                      <Text style={prestadorStyles.collapseButtonText}>{isSidebarCollapsed ? '>' : '<'}</Text>
                  </TouchableOpacity>
              </View>
            )}

            {/* CONTEUDO PRINCIPAL */}
            <View style={[prestadorStyles.content, { paddingHorizontal: isMobile ? 15 : 40 }]}>
                
                {/* MENU MOBILE (Renderiza apenas se FOR Mobile) */}
                {isMobile && (
                    <View style={prestadorStyles.mobileNavContainer}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={prestadorStyles.mobileScroll}>
                          {menuItems.map(item => (
                            <TouchableOpacity 
                              key={item.key}
                              onPress={() => setView(item.key)}
                              style={[
                                prestadorStyles.mobileNavItem,
                                view === item.key && prestadorStyles.mobileNavItemSelected
                              ]}
                            >
                              <Text style={[
                                prestadorStyles.mobileNavText,
                                view === item.key && prestadorStyles.mobileNavTextSelected
                              ]}>{item.label}</Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity onPress={handleLogout} style={[prestadorStyles.mobileNavItem, { borderColor: '#DC3545' }]}>
                              <Text style={{color: '#DC3545', fontWeight: 'bold'}}>Sair</Text>
                          </TouchableOpacity>
                      </ScrollView>
                    </View>
                )}

                {/* Container Responsivo (Centraliza e Limita Largura) */}
                <View style={prestadorStyles.responsiveContainer}>
                    {view==='Home' && <RenderSolicitacoes user={user} />}
                    {view==='Agenda' && <RenderAgendaVisual user={user} />}
                    {view==='Serviço' && <RenderMeuServico user={user} />}
                    {view==='Perfil' && <View style={{flex:1}}><PerfilPrestadorScreen /></View>}
                </View>
            </View>
        </View>
    </ImageBackground>
  );
}