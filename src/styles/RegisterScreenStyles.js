// src/styles/RegisterScreenStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const registerStyles = StyleSheet.create({
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
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF', 
    borderRadius: 20,
    padding: 30,
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
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343A40', 
    textAlign: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    backgroundColor: '#F8F9FA', 
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#0056B3', 
  },
  typeText: {
    fontWeight: '600',
    color: '#6C757D', 
  },
  typeTextSelected: {
    color: '#FFFFFF', 
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
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#0056B3', 
    backgroundColor: '#F8F9FA', 
  },
  inputError: {
    borderColor: '#DC3545', 
    borderWidth: 2,
  },
  errorText: {
    color: '#DC3545', 
    fontSize: 12,
    marginBottom: 10,
  },
  errorTextCenter: {
    color: '#DC3545', 
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 14,
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
    marginTop: 20,
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