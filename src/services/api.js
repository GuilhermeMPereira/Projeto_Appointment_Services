// api.js
import axios from 'axios';

// Criamos a instância do axios para a API do Google Calendar.
const googleCalendarApi = axios.create({
  baseURL: 'https://www.googleapis.com/calendar/v3',
});

/**
 * Busca os eventos do calendário principal do usuário.
 * 'primary' é um atalho para o calendário principal do usuário logado.
 * @param {string} accessToken - O Token de Acesso obtido do login OAuth 2.0.
 * @returns {Promise}
 */
export const getCalendarEvents = (accessToken) => {
  return googleCalendarApi.get('/calendars/primary/events', {
    headers: {
      'Authorization': `Bearer ${accessToken}` // O token é passado no cabeçalho
    }
  });
};

/**
 * Cria um novo evento no calendário do usuário.
 * @param {string} accessToken - O Token de Acesso obtido do login OAuth 2.0.
 * @param {object} eventData - O objeto do evento a ser criado (veja exemplo na outra resposta).
 * @returns {Promise}
 */
export const createCalendarEvent = (accessToken, eventData) => {
  return googleCalendarApi.post(
    '/calendars/primary/events',
    eventData, // O objeto do evento vai no corpo (body) do POST
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
};

/**
 * Atualiza um evento existente.
 * @param {string} accessToken - O Token de Acesso OAuth 2.0.
 * @param {string} eventId - O ID do evento que você quer atualizar.
 * @param {object} updatedEventData - O objeto com os dados atualizados.
 * @returns {Promise}
 */
export const updateCalendarEvent = (accessToken, eventId, updatedEventData) => {
  return googleCalendarApi.put(
    `/calendars/primary/events/${eventId}`,
    updatedEventData, // O objeto atualizado vai no corpo do PUT
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
};

/**
 * Deleta um evento.
 * @param {string} accessToken - O Token de Acesso OAuth 2.0.
 * @param {string} eventId - O ID do evento a ser deletado.
 * @returns {Promise}
 */
export const deleteCalendarEvent = (accessToken, eventId) => {
  return googleCalendarApi.delete(
    `/calendars/primary/events/${eventId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
};