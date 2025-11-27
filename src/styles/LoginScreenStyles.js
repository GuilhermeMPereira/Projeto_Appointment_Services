// src/styles/LoginScreenStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(212, 237, 218, 0.85)', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  formContainer: {
    width: '95%', // AUMENTADO PARA 95%
    maxWidth: 450, // AUMENTADO LIMITE MÁXIMO (era 400)
    backgroundColor: '#FFFFFF', 
    borderRadius: 20,
    padding: 35, 
    marginBottom: 80, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
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
  },
  linkText: {
    color: '#0056B3', 
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 10,
  },
});