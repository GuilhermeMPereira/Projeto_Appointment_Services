import { StyleSheet, Platform } from 'react-native';

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Ajuste no ScrollView para permitir centralização
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center', // Centraliza o container responsivo horizontalmente
  },

  // --- NOVO: Container que limita a largura no PC ---
  responsiveContainer: {
    width: '100%',
    maxWidth: 600, // Largura máxima do "cartão" de perfil
    backgroundColor: '#FFFFFF', // Fundo branco para destacar no PC
    borderRadius: 16,
    padding: 25,
    // Sombra suave para dar destaque
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#0056B3',
  },
  avatarText: {
    fontSize: 40,
    color: '#0056B3',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343A40',
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343A40',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
    paddingBottom: 5,
    width: '100%',
  },
  
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#495057',
    // Remove borda azul nativa da web
    ...Platform.select({
      web: { outlineStyle: 'none' }
    }),
  },
  
  button: {
    backgroundColor: '#0056B3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  logoutButton: {
    backgroundColor: '#DC3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});