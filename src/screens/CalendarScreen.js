// src/screens/CalendarScreen.js

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { getCalendarEvents } from '../services/api'; // Importe sua API (confirme o caminho)

// Usamos 'route' para receber os parâmetros passados pela navegação
export default function CalendarScreen({ route }) {
  // Pega o 'accessToken' que o LoginScreen enviou
  const { accessToken } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  // Este useEffect roda assim que a tela carrega
  useEffect(() => {
    if (!accessToken) {
      setError('Erro: Token de acesso não fornecido.');
      setIsLoading(false);
      return;
    }

    // Chama a função da sua API usando o token
    getCalendarEvents(accessToken)
      .then(response => {
        // 'response.data.items' é a lista de eventos
        setEvents(response.data.items);
      })
      .catch(err => {
        console.error('Erro ao buscar eventos:', err);
        setError('Falha ao carregar eventos do calendário.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken]); // Roda sempre que o accessToken mudar (só deve ser 1 vez)

  // Função para renderizar cada item da lista
  const renderEvent = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventSummary}>{item.summary}</Text>
      {item.start?.dateTime && (
        <Text style={styles.eventDate}>
          {new Date(item.start.dateTime).toLocaleString('pt-BR')}
        </Text>
      )}
    </View>
  );

  // Mostra um indicador de carregamento
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Carregando eventos...</Text>
      </View>
    );
  }

  // Mostra mensagem de erro
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Mostra a lista de eventos
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento encontrado.</Text>}
        ListHeaderComponent={<Text style={styles.headerTitle}>Seus Próximos Eventos</Text>}
      />
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    textAlign: 'center',
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventSummary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#276eb1ff',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  }
});