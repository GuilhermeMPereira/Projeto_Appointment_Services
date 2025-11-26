// src/screens/index_cliente.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  TextInput, Alert, FlatList, Modal, ActivityIndicator,
  ImageBackground, Image
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { auth, db } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, getDocs, addDoc, query, where, onSnapshot 
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import PerfilClienteScreen from './perfil_cliente';
import { clienteStyles } from '../styles/ClienteScreenStyles';

// Imagens
const lupaIcon = require('../../assets/lupa.jpg');
const pedidosIcon = require('../../assets/pedidos.png');
const avaliarIcon = require('../../assets/avaliar.jpg');
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

const HORARIOS_PADRAO = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function ClienteHomeScreen() {
  const navigation = useNavigation();
  const [view, setView] = useState('Busca');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const user = auth.currentUser;

  // --- LÓGICA DE LOGOUT BLINDADA DO CÓDIGO ORIGINAL ---
  const handleLogout = () => {
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
              console.log("Erro no Firebase (provavelmente AdBlock), mas vamos sair mesmo assim.");
            } finally {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          } 
        }
      ]
    );
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // --- BUSCA & AGENDAMENTO (COM FUNCIONALIDADES DO CÓDIGO ORIGINAL) ---
  const RenderBusca = () => {
    const [prestadores, setPrestadores] = useState([]);
    const [searchText, setSearchText] = useState('');
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
        const q = query(collection(db, 'agendamentos'), 
          where('prestadorId', '==', selectedPrestador.id), 
          where('dataString', '==', day.dateString), 
          where('status', '==', 'confirmado'));
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
          clienteNome: user.email?.split('@')[0] || "Cliente",
          prestadorId: selectedPrestador.id,
          servicoNome: selectedService.nome,
          servicoPreco: selectedService.preco,
          dataAgendamento: new Date(`${selectedDate}T${hora}:00`),
          dataString: selectedDate,
          horaString: hora,
          status: 'pendente'
        });
        Alert.alert("Sucesso", "Solicitação enviada! O prestador analisará seu pedido.");
        setModalVisible(false);
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Falha ao enviar solicitação.");
      }
    };

    const listaFiltrada = prestadores.filter(p => {
      const searchLower = searchText.toLowerCase();
      const nomeMatch = p.nomeAnuncio?.toLowerCase().includes(searchLower);
      const servicoMatch = p.meusServicos && p.meusServicos.some(s => s.nome.toLowerCase().includes(searchLower));
      return nomeMatch || servicoMatch;
    });

    return (
      <View style={{flex: 1}}>
        <View style={clienteStyles.headerSection}>
          <Text style={clienteStyles.welcomeTitle}>Encontre Profissionais</Text>
          <Text style={clienteStyles.welcomeSubtitle}>Agende serviços com os melhores especialistas</Text>
        </View>

        <View style={clienteStyles.searchContainer}>
          <View style={clienteStyles.searchInputContainer}>
            <Image source={lupaIcon} style={clienteStyles.searchIcon} />
            <TextInput 
              style={clienteStyles.searchInput}
              placeholder="Buscar prestador ou serviço..." 
              placeholderTextColor="#8a8a8a"
              value={searchText} 
              onChangeText={setSearchText} 
            />
          </View>
        </View>

        {listaFiltrada.length === 0 ? (
          <View style={clienteStyles.emptyState}>
            <Text style={clienteStyles.emptyStateText}>
              {searchText ? "Nenhum resultado encontrado" : "Carregando profissionais..."}
            </Text>
          </View>
        ) : (
          <FlatList 
            data={listaFiltrada}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={clienteStyles.listContainer}
            renderItem={({item}) => (
              <View style={clienteStyles.professionalCard}>
                <View style={clienteStyles.cardHeader}>
                  <Text style={clienteStyles.cardTitle}>{item.nomeAnuncio}</Text>
                  <View style={clienteStyles.ratingBadge}>
                    <Text style={clienteStyles.ratingText}>★ {item.avaliacaoMedia || '5.0'}</Text>
                  </View>
                </View>
                
                <Text style={clienteStyles.cardDescription}>{item.descricao || "Profissional qualificado"}</Text>
                
                <View style={clienteStyles.servicesContainer}>
                  {item.meusServicos?.slice(0,3).map((s,i) => (
                    <View key={i} style={clienteStyles.serviceTag}>
                      <Text style={clienteStyles.serviceTagText}>{s.nome}</Text>
                    </View>
                  ))}
                  {item.meusServicos?.length > 3 && (
                    <Text style={clienteStyles.moreServices}>+{item.meusServicos.length - 3}</Text>
                  )}
                </View>

                <TouchableOpacity 
                  style={clienteStyles.primaryButton} 
                  onPress={() => iniciarAgendamento(item)}
                >
                  <Text style={clienteStyles.primaryButtonText}>Ver Serviços</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
          <View style={clienteStyles.modalContainer}>
            <View style={clienteStyles.modalHeader}>
              <Text style={clienteStyles.modalTitle}>
                {step === 0 ? "Escolha o Serviço" : 
                 step === 1 ? "Selecione a Data" : 
                 "Escolha o Horário"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={clienteStyles.closeButton}>
                <Text style={clienteStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedPrestador && (
              <View style={clienteStyles.prestadorInfo}>
                <Text style={clienteStyles.prestadorName}>{selectedPrestador.nomeAnuncio}</Text>
                {selectedService && (
                  <Text style={clienteStyles.selectedService}>Serviço: {selectedService.nome}</Text>
                )}
              </View>
            )}

            <ScrollView style={clienteStyles.modalContent}>
              {step === 0 && (
                <View>
                  {!selectedPrestador?.meusServicos || selectedPrestador.meusServicos.length === 0 ? (
                    <View style={clienteStyles.emptyServices}>
                      <Text style={clienteStyles.emptyServicesText}>Este prestador ainda não cadastrou serviços.</Text>
                    </View>
                  ) : (
                    selectedPrestador.meusServicos.map((s, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={clienteStyles.serviceItem} 
                        onPress={() => escolherServico(s)}
                      >
                        <View style={clienteStyles.serviceInfo}>
                          <Text style={clienteStyles.serviceName}>{s.nome}</Text>
                          <Text style={clienteStyles.serviceDescription}>Serviço profissional</Text>
                        </View>
                        <View style={clienteStyles.servicePrice}>
                          <Text style={clienteStyles.priceText}>R$ {s.preco}</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {step === 1 && (
                <View>
                  <TouchableOpacity onPress={() => setStep(0)} style={clienteStyles.backButton}>
                    <Text style={clienteStyles.backButtonText}>← Voltar</Text>
                  </TouchableOpacity>
                  <Text style={clienteStyles.stepTitle}>Selecione uma data disponível</Text>
                  <Calendar 
                    onDayPress={onDayPress}
                    theme={{
                      selectedDayBackgroundColor: '#0056B3',
                      todayTextColor: '#0056B3',
                      arrowColor: '#0056B3',
                    }}
                  />
                  {loadingSlots && (
                    <View style={clienteStyles.loadingContainer}>
                      <ActivityIndicator size="large" color="#0056B3" />
                      <Text style={clienteStyles.loadingText}>Verificando disponibilidade...</Text>
                    </View>
                  )}
                </View>
              )}

              {step === 2 && (
                <View>
                  <TouchableOpacity onPress={() => setStep(1)} style={clienteStyles.backButton}>
                    <Text style={clienteStyles.backButtonText}>← Voltar</Text>
                  </TouchableOpacity>
                  <Text style={clienteStyles.stepTitle}>Horários disponíveis em {selectedDate}</Text>
                  {availableSlots.length === 0 ? (
                    <View style={clienteStyles.noSlots}>
                      <Text style={clienteStyles.noSlotsText}>Nenhum horário disponível para esta data.</Text>
                    </View>
                  ) : (
                    <View style={clienteStyles.timeGrid}>
                      {availableSlots.map((hora, idx) => (
                        <TouchableOpacity 
                          key={idx} 
                          style={clienteStyles.timeSlot} 
                          onPress={() => solicitarAgendamento(hora)}
                        >
                          <Text style={clienteStyles.timeSlotText}>{hora}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  };

  // --- MEUS PEDIDOS (COM FUNCIONALIDADES DO CÓDIGO ORIGINAL) ---
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

    const getStatusInfo = (status) => {
      switch(status) {
        case 'confirmado':
          return { color: '#D4EDDA', textColor: '#155724', label: '✓ Confirmado' };
        case 'pendente':
          return { color: '#FFF3CD', textColor: '#856404', label: '⏳ Pendente' };
        case 'recusado':
          return { color: '#F8D7DA', textColor: '#721C24', label: '❌ Recusado' };
        default:
          return { color: '#E2E3E5', textColor: '#383D41', label: status };
      }
    };

    return (
      <View style={{flex: 1}}>
        <View style={clienteStyles.headerSection}>
          <Text style={clienteStyles.welcomeTitle}>Minhas Reservas</Text>
          <Text style={clienteStyles.welcomeSubtitle}>Acompanhe seus agendamentos e status</Text>
        </View>

        {pedidos.length === 0 ? (
          <View style={clienteStyles.emptyState}>
            <Text style={clienteStyles.emptyStateText}>Nenhuma reserva encontrada</Text>
            <Text style={clienteStyles.emptyStateSubtext}>Suas reservas aparecerão aqui</Text>
          </View>
        ) : (
          <FlatList 
            data={pedidos}
            keyExtractor={i => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={clienteStyles.listContainer}
            renderItem={({item}) => {
              const statusInfo = getStatusInfo(item.status);
              return (
                <View style={[clienteStyles.appointmentCard, { borderLeftColor: statusInfo.textColor }]}>
                  <View style={clienteStyles.appointmentHeader}>
                    <Text style={clienteStyles.appointmentTitle}>{item.servicoNome}</Text>
                    <View style={[clienteStyles.statusBadge, { backgroundColor: statusInfo.color }]}>
                      <Text style={[clienteStyles.statusText, { color: statusInfo.textColor }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={clienteStyles.appointmentPrice}>R$ {item.servicoPreco}</Text>
                  
                  <View style={clienteStyles.appointmentDetails}>
                    <Text style={clienteStyles.detailText}>📅 {item.dataString}</Text>
                    <Text style={clienteStyles.detailText}>🕒 {item.horaString}</Text>
                  </View>
                  
                  <Text style={clienteStyles.providerText}>Profissional: {item.prestadorId}</Text>
                </View>
              );
            }}
          />
        )}
      </View>
    );
  };

  // --- AVALIAR ---
  const RenderAvaliar = () => (
    <View style={{flex: 1}}>
      <View style={clienteStyles.headerSection}>
        <Text style={clienteStyles.welcomeTitle}>Avaliações</Text>
        <Text style={clienteStyles.welcomeSubtitle}>Avalie os serviços contratados</Text>
      </View>
      <View style={clienteStyles.emptyState}>
        <Text style={clienteStyles.emptyStateText}>Disponível após conclusão dos serviços</Text>
        <Text style={clienteStyles.emptyStateSubtext}>Você poderá avaliar aqui</Text>
      </View>
    </View>
  );

  const menuItems = [
    { key: 'Busca', icon: lupaIcon, label: 'Buscar' },
    { key: 'Pedidos', icon: pedidosIcon, label: 'Minhas Reservas' },
    { key: 'Avaliar', icon: avaliarIcon, label: 'Avaliar' },
    { key: 'Perfil', icon: perfilIcon, label: 'Perfil' }
  ];

  return (
    <ImageBackground 
      source={require('../../assets/Fundo.png')} 
      style={clienteStyles.backgroundImage}
      resizeMode="cover"
    >
      <View style={clienteStyles.overlay}>
        {/* Sidebar Recolhível */}
        <View style={[
          clienteStyles.sidebar,
          isSidebarCollapsed ? clienteStyles.sidebarCollapsed : clienteStyles.sidebarExpanded
        ]}>
          <View style={clienteStyles.sidebarHeader}>
            {!isSidebarCollapsed ? (
              <>
                <Text style={clienteStyles.logoText}>AgendaPro</Text>
                <Text style={clienteStyles.logoSubtext}>Cliente</Text>
              </>
            ) : (
              <Text style={clienteStyles.logoText}>AP</Text>
            )}
          </View>
          
          <View style={clienteStyles.menuContainer}>
            {menuItems.map(item => (
              <TouchableOpacity 
                key={item.key} 
                style={[
                  clienteStyles.menuItem, 
                  view === item.key && clienteStyles.menuItemSelected
                ]} 
                onPress={() => setView(item.key)}
              >
                <Image 
                  source={item.icon} 
                  style={[
                    clienteStyles.menuIcon,
                    view === item.key && clienteStyles.menuIconSelected
                  ]} 
                />
                {!isSidebarCollapsed && (
                  <Text style={[
                    clienteStyles.menuText,
                    view === item.key && clienteStyles.menuTextSelected
                  ]}>
                    {item.label}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={clienteStyles.sidebarFooter}>
            {/* Botão de Logout com a lógica blindada */}
            <TouchableOpacity 
              style={clienteStyles.logoutButton} 
              onPress={handleLogout}
            >
              <Image source={sairIcon} style={clienteStyles.menuIcon} />
              {!isSidebarCollapsed && (
                <Text style={clienteStyles.logoutButtonText}>Sair</Text>
              )}
            </TouchableOpacity>
            
            {!isSidebarCollapsed ? (
              <Text style={clienteStyles.footerText}>AgendaPro v1.0</Text>
            ) : (
              <Text style={clienteStyles.footerText}>v1.0</Text>
            )}
          </View>

          {/* Botão para recolher/expandir */}
          <TouchableOpacity 
            style={clienteStyles.collapseButton} 
            onPress={toggleSidebar}
          >
            <Text style={clienteStyles.collapseButtonText}>
              {isSidebarCollapsed ? '>' : '<'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo Principal */}
        <View style={clienteStyles.content}>
          {view === 'Busca' && <RenderBusca />}
          {view === 'Pedidos' && <RenderMeusPedidos />}
          {view === 'Avaliar' && <RenderAvaliar />}
          {view === 'Perfil' && <PerfilClienteScreen />}
        </View>
      </View>
    </ImageBackground>
  );
}