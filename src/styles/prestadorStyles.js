import { StyleSheet, Platform } from 'react-native';

export const prestadorStyles = StyleSheet.create({
  // --- LAYOUT PRINCIPAL ---
  container: { 
    flex: 1, 
    flexDirection: 'row', // No Desktop é linha (Sidebar | Conteúdo)
  },
  backgroundImage: { 
    flex: 1, 
    width: '100%', // CORREÇÃO: Usa % em vez de pixels fixos
    height: '100%', 
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(212, 237, 218, 0.85)', 
    flexDirection: 'row', 
    width: '100%',
    height: '100%'
  },

  // --- RESPONSIVIDADE ---
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1024, // Limite para telas ultra-wide
    alignSelf: 'center',
  },
  
  // --- MENU MOBILE ---
  mobileNavContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  mobileScroll: { 
    paddingHorizontal: 10 
  },
  mobileNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileNavItemSelected: { 
    backgroundColor: '#0056B3', 
    borderColor: '#0056B3' 
  },
  mobileNavText: { 
    color: '#495057', 
    fontWeight: '600', 
    fontSize: 13 
  },
  mobileNavTextSelected: { 
    color: '#fff' 
  },

  // --- SIDEBAR (Lateral) ---
  sidebar: { 
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingTop: 60,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 86, 179, 0.1)',
    height: '100%', 
    zIndex: 10,
  },
  sidebarCollapsed: { width: 70 },
  sidebarExpanded: { width: 250 },
  
  sidebarHeader: { 
    paddingHorizontal: 15, 
    paddingBottom: 30, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0, 86, 179, 0.1)', 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  logoText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#0056B3', 
    marginBottom: 4 
  },
  logoSubtext: { 
    fontSize: 10, 
    color: '#6C757D', 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  
  menuContainer: { flex: 1 },
  
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 15, 
    marginHorizontal: 5, 
    borderRadius: 12, 
    marginBottom: 8 
  },
  menuItemSelected: { backgroundColor: '#0056B3' },
  menuIcon: { width: 24, height: 24, resizeMode: 'contain' },
  menuIconSelected: { tintColor: '#FFFFFF' },
  menuText: { fontSize: 14, fontWeight: '600', color: '#495057', marginLeft: 10 },
  menuTextSelected: { color: '#FFFFFF' },
  
  sidebarFooter: { 
    padding: 15, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(0, 86, 179, 0.1)', 
    alignItems: 'center' 
  },
  logoutButton: { 
    backgroundColor: '#DC3545', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    width: '100%' 
  },
  logoutButtonText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginLeft: 5 
  },
  
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
    zIndex: 1 
  },
  collapseButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  // --- CONTEÚDO ---
  content: { 
    flex: 1, 
    padding: 20, 
    width: '100%', // Ocupa o restante da tela
  },
  
  headerSection: { 
    marginBottom: 25, 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    padding: 20, 
    borderRadius: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#343A40', marginBottom: 8 },
  pageSubtitle: { fontSize: 16, color: '#6C757D' },

  // --- CARDS ---
  card: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 16, 
    borderLeftWidth: 5, 
    borderLeftColor: '#0056B3', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#343A40', marginBottom: 5 },
  cardSubtitle: { fontSize: 16, fontWeight: '600', color: '#0056B3', marginBottom: 10 },
  cardText: { fontSize: 14, color: '#6C757D', marginBottom: 4 },

  // --- BOTOES ---
  rowBtn: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  btnAccept: { backgroundColor: '#28A745', padding: 12, borderRadius: 10, flex: 1, marginRight: 5, alignItems: 'center', elevation: 2 },
  btnReject: { backgroundColor: '#DC3545', padding: 12, borderRadius: 10, flex: 1, marginLeft: 5, alignItems: 'center', elevation: 2 },
  
  btnChat: {
    backgroundColor: '#0056B3',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#0056B3',
    shadowOpacity: 0.3,
    elevation: 2
  },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // --- SCROLL INTERNO PARA SERVIÇOS (NOVO) ---
  servicesListScroll: {
    maxHeight: 300, 
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },

  // --- OUTROS ---
  agendaItemContainer: { 
    backgroundColor: '#FFFFFF', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    elevation: 2 
  },
  agendaTime: { fontWeight: 'bold', color: '#0056B3', fontSize: 16, marginRight: 15 },
  
  label: { fontSize: 14, color: '#495057', fontWeight: '600', marginTop: 15, marginBottom: 5 },
  input: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#CED4DA', 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    color: '#495057',
    ...Platform.select({ web: { outlineStyle: 'none' } }) 
  },
  addArea: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20, backgroundColor: '#E9ECEF', padding: 10, borderRadius: 12 },
  btnAdd: { backgroundColor: '#0056B3', width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center', marginLeft: 10, elevation: 3 },
  itemServico: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#FFFFFF', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E9ECEF' },
  btnSalvar: { backgroundColor: '#28A745', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 50, elevation: 4 }
});