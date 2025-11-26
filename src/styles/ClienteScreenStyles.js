// src/styles/ClienteScreenStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const clienteStyles = StyleSheet.create({
  // Layout Principal com Imagem de Fundo
  container: { 
    flex: 1, 
    flexDirection: 'row',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(212, 237, 218, 0.85)',
    flexDirection: 'row',
  },
  
  // Sidebar - Recolhível e Transparente
  sidebar: { 
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingTop: 60,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 86, 179, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sidebarCollapsed: {
    width: 70,
  },
  sidebarExpanded: {
    width: 250,
  },
  sidebarHeader: {
    paddingHorizontal: 15,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 86, 179, 0.1)',
    marginBottom: 20,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056B3',
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 10,
    color: '#6C757D',
    fontWeight: '500',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemSelected: {
    backgroundColor: '#0056B3',
  },
  // Estilos para ícones do menu (agora são imagens)
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuIconSelected: {
    tintColor: '#FFFFFF',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 10,
  },
  menuTextSelected: {
    color: '#FFFFFF',
  },
  menuTextCollapsed: {
    display: 'none',
  },
  sidebarFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 86, 179, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#6C757D',
    textAlign: 'center',
  },
  footerTextCollapsed: {
    display: 'none',
  },
  
  // Botão de Recolher/Expandir
  collapseButton: {
    position: 'absolute',
    top: 60,
    right: -12,
    backgroundColor: '#0056B3',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  collapseButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Conteúdo Principal
  content: { 
    flex: 1, 
    padding: 20,
    backgroundColor: 'transparent',
  },
  
  // Header Sections
  headerSection: {
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
  
  // Search com ícone de lupa
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#343A40',
  },
  
  // Cards de Profissionais
  professionalCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: '#343A40',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 15,
    lineHeight: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  serviceTag: {
    backgroundColor: 'rgba(0, 86, 179, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceTagText: {
    color: '#0056B3',
    fontSize: 12,
    fontWeight: '500',
  },
  moreServices: {
    color: '#6C757D',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    alignSelf: 'center',
  },
  
  // Cards de Agendamentos
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343A40',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 12,
  },
  appointmentDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6C757D',
    marginRight: 20,
  },
  providerText: {
    fontSize: 14,
    color: '#495057',
    fontStyle: 'italic',
  },
  
  // Botões
  primaryButton: {
    backgroundColor: '#0056B3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0056B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0056B3',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#0056B3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6C757D',
    fontWeight: 'bold',
  },
  prestadorInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  prestadorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 4,
  },
  selectedService: {
    fontSize: 14,
    color: '#0056B3',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#0056B3',
    fontSize: 16,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 20,
  },
  
  // Itens de Serviço
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
  servicePrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745',
  },
  
  // Horários
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  timeSlot: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    margin: 5,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0056B3',
  },
  
  // Perfil
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0056B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#0056B3',
    fontWeight: '500',
  },
  profileActions: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Estados Vazios
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    margin: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
  emptyServices: {
    padding: 40,
    alignItems: 'center',
  },
  emptyServicesText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  noSlots: {
    padding: 40,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  
  // Loading
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  
  // List Container
  listContainer: {
    paddingBottom: 20,
  },
});