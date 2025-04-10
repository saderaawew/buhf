import axios from 'axios';
// Импорт мок API для использования
import * as mockAPI from './mockApi';

// Флаг, определяющий должны ли мы использовать мок API вместо реального
const USE_MOCK_API = true; // Поменяйте на false, когда сервер будет готов

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api'
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API services grouped by resource
export const authAPI = USE_MOCK_API 
  ? mockAPI.authAPI 
  : {
    login: (credentials) => api.post('/users/login', credentials),
    register: (userData) => api.post('/users/register', userData),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData)
  };

export const characterAPI = USE_MOCK_API 
  ? mockAPI.characterAPI 
  : {
    getAll: () => api.get('/characters'),
    getById: (id) => api.get(`/characters/${id}`),
    create: (data) => api.post('/characters', data),
    update: (id, data) => api.put(`/characters/${id}`, data),
    addExperience: (id, amount, source) => api.post(`/characters/${id}/addExperience`, { amount, source }),
    addItem: (id, itemId, quantity) => api.post(`/characters/${id}/addItem`, { itemId, quantity }),
    purchase: (id, itemId, price) => api.post(`/characters/${id}/purchase`, { itemId, price }),
    useItem: (id, itemId) => api.post(`/characters/${id}/useItem`, { itemId }),
    equipItem: (id, itemId) => api.post(`/characters/${id}/equipItem`, { itemId }),
    unequipItem: (id, itemId) => api.post(`/characters/${id}/unequipItem`, { itemId })
  };

export const questAPI = USE_MOCK_API 
  ? mockAPI.questAPI 
  : {
    getAll: () => api.get('/quests'),
    getById: (id) => api.get(`/quests/${id}`),
    startQuest: (id, characterId) => api.post(`/quests/${id}/start`, { characterId }),
    updateProgress: (id, characterId, objectiveIndex, completed) => 
      api.post(`/quests/${id}/progress`, { characterId, objectiveIndex, completed }),
    abandonQuest: (id, characterId) => api.post(`/quests/${id}/abandon`, { characterId })
  };

export const locationAPI = USE_MOCK_API 
  ? mockAPI.locationAPI 
  : {
    getAll: () => api.get('/locations'),
    getById: (id) => api.get(`/locations/${id}`),
    getForCharacter: (characterId) => api.get(`/locations/character/${characterId}`),
    visit: (id, characterId) => api.post(`/locations/${id}/visit`, { characterId })
  };

export const itemAPI = USE_MOCK_API 
  ? mockAPI.itemAPI 
  : {
    getAll: () => api.get('/items'),
    getById: (id) => api.get(`/items/${id}`),
    getByType: (type) => api.get(`/items/type/${type}`)
  };

export const eventAPI = USE_MOCK_API 
  ? mockAPI.eventAPI 
  : {
    getAll: () => api.get('/events'),
    getActive: () => api.get('/events/active'),
    getById: (id) => api.get(`/events/${id}`),
    participate: (id, characterId) => api.post(`/events/${id}/participate`, { characterId })
  };

export const leaderboardAPI = USE_MOCK_API 
  ? mockAPI.leaderboardAPI 
  : {
    get: (type = 'experience') => api.get(`/leaderboard?type=${type}`)
  };

export const healthAPI = USE_MOCK_API 
  ? mockAPI.healthAPI 
  : {
    check: () => api.get('/health')
  };

export default {
  auth: authAPI,
  character: characterAPI,
  quest: questAPI,
  location: locationAPI,
  item: itemAPI,
  event: eventAPI,
  leaderboard: leaderboardAPI,
  health: healthAPI
};
