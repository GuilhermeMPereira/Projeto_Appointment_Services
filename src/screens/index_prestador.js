import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';

export default function PrestadorHomeScreen() {
  const handleLogout = () => {
    signOut(auth).catch(err => console.error(err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Prestador</Text>
      <Text style={styles.subtitle}>Gerencie sua agenda e perfil.</Text>
      
      <View style={{ marginTop: 50 }}>
        <Button title="Sair (Logout)" onPress={handleLogout} color="#d9534f" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' }
});