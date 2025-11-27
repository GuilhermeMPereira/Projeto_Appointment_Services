import { StyleSheet, Platform } from 'react-native';

export const loginStyles = StyleSheet.create({
  // Container principal que segura a imagem de fundo
  container: {
    flex: 1,
  },
  // A imagem ocupa todo o espaço disponível e é fixa
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Overlay escurece a imagem e centraliza o conteúdo
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(212, 237, 218, 0.85)', 
    width: '100%',
    height: '100%',
  },
  // O ScrollView cuida apenas de rolar o formulário se a tela for pequena
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  formContainer: {
    width: '100%', 
    maxWidth: 450, // Limite de largura para não esticar no PC
    backgroundColor: '#FFFFFF', 
    borderRadius: 20,
    padding: 35, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#343A40', 
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D', 
    textAlign: 'center',
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#343A40', 
  },
  input: {
    borderWidth: 2,
    borderColor: '#DEE2E6', 
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    // Propriedade específica para Web (remove borda azul do browser)
    ...Platform.select({
      web: { outlineStyle: 'none' }
    }),
  },
  inputFocused: {
    borderColor: '#0056B3', 
    backgroundColor: '#F8F9FA', 
  },
  
  errorText: {
    color: '#DC3545', 
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  button: {
    backgroundColor: '#0056B3', 
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#6C757D', 
  },
  buttonText: {
    color: '#FFFFFF', 
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  linkContainer: {
    marginTop: 25,
    alignItems: 'center',
    padding: 10, // Aumenta área de toque
  },
  linkText: {
    color: '#0056B3', 
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    
  },
});