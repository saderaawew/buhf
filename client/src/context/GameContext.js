import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameProgress, setGameProgress] = useState({
    quests: [],
    locations: [],
    inventory: [],
    activeEvents: []
  });

  // Set axios auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Load user's characters when user auth changes
  useEffect(() => {
    if (user) {
      loadCharacters();
    } else {
      setCharacters([]);
      setCurrentCharacter(null);
      setGameProgress({
        quests: [],
        locations: [],
        inventory: [],
        activeEvents: []
      });
    }
  }, [user]);

  // Load character data when currentCharacter changes
  useEffect(() => {
    if (currentCharacter) {
      loadCharacterData();
    }
  }, [currentCharacter]);

  // Load user's characters
  const loadCharacters = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/characters');
      setCharacters(res.data);
      
      // If there's at least one character and none is selected, select the first one
      if (res.data.length > 0 && !currentCharacter) {
        setCurrentCharacter(res.data[0]);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load characters');
      setLoading(false);
    }
  };

  // Create a new character
  const createCharacter = async (characterData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/characters', characterData);
      setCharacters([...characters, res.data]);
      setCurrentCharacter(res.data);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create character');
      setLoading(false);
      return false;
    }
  };

  // Select a character
  const selectCharacter = (characterId) => {
    const character = characters.find(char => char._id === characterId);
    if (character) {
      setCurrentCharacter(character);
      return true;
    }
    return false;
  };

  // Load character data including quests, locations, inventory
  const loadCharacterData = async () => {
    if (!currentCharacter) return;
    
    setLoading(true);
    try {
      // Get character details
      const characterRes = await axios.get(`/api/characters/${currentCharacter._id}`);
      setCurrentCharacter(characterRes.data);
      
      // Load quests
      const questsRes = await axios.get('/api/quests');
      
      // Load available locations
      const locationsRes = await axios.get(`/api/locations/character/${currentCharacter._id}`);
      
      // Load active events
      const eventsRes = await axios.get('/api/events');
      
      setGameProgress({
        quests: questsRes.data,
        locations: locationsRes.data,
        inventory: characterRes.data.inventory,
        activeEvents: eventsRes.data
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load game data');
      setLoading(false);
    }
  };

  // Start a quest
  const startQuest = async (questId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/quests/${questId}/start`, {
        characterId: currentCharacter._id
      });
      
      // Update current character with the quest
      setCurrentCharacter(res.data);
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to start quest');
      setLoading(false);
      return false;
    }
  };

  // Update quest progress
  const updateQuestProgress = async (questId, objectiveIndex, completed = true) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/quests/${questId}/progress`, {
        characterId: currentCharacter._id,
        objectiveIndex,
        completed
      });
      
      // Update current character and refresh
      setCurrentCharacter(res.data.character);
      
      // Refresh game data if quest completed
      if (res.data.questCompleted) {
        await loadCharacterData();
      }
      
      setLoading(false);
      return {
        success: true,
        questCompleted: res.data.questCompleted
      };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update quest progress');
      setLoading(false);
      return { success: false };
    }
  };

  // Visit a location
  const visitLocation = async (locationId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/locations/${locationId}/visit`, {
        characterId: currentCharacter._id
      });
      
      // If visiting the location unlocked anything, refresh character data
      await loadCharacterData();
      
      setLoading(false);
      return {
        success: true,
        locationDetails: res.data.locationDetails,
        itemsFound: res.data.itemsFound
      };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to visit location');
      setLoading(false);
      return { success: false };
    }
  };

  // Participate in an event
  const participateInEvent = async (eventId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/events/${eventId}/participate`, {
        characterId: currentCharacter._id
      });
      
      // Update character if rewards were granted
      if (res.data.rewardsGranted) {
        await loadCharacterData();
      }
      
      setLoading(false);
      return {
        success: true,
        participation: res.data
      };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to participate in event');
      setLoading(false);
      return { success: false };
    }
  };

  // Add experience to character
  const addExperience = async (amount, source) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/characters/${currentCharacter._id}/addExperience`, {
        amount,
        source
      });
      
      setCurrentCharacter(res.data.character);
      
      setLoading(false);
      return {
        success: true,
        leveledUp: res.data.leveledUp
      };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add experience');
      setLoading(false);
      return { success: false };
    }
  };

  // Add item to inventory
  const addItemToInventory = async (itemId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/characters/${currentCharacter._id}/addItem`, {
        itemId,
        quantity
      });
      
      setCurrentCharacter(res.data);
      
      // Update inventory in game progress
      setGameProgress({
        ...gameProgress,
        inventory: res.data.inventory
      });
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add item');
      setLoading(false);
      return false;
    }
  };

  // Get leaderboard data
  const getLeaderboard = async (type = 'experience') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/leaderboard?type=${type}`);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load leaderboard');
      setLoading(false);
      return [];
    }
  };

  // Use an item from inventory
  const useItem = async (itemId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/characters/${currentCharacter._id}/useItem`, {
        itemId
      });
      
      setCurrentCharacter(res.data.character);
      
      // Update inventory in game progress
      setGameProgress({
        ...gameProgress,
        inventory: res.data.character.inventory
      });
      
      setLoading(false);
      return {
        success: true,
        effects: res.data.effects
      };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to use item');
      setLoading(false);
      return { success: false };
    }
  };

  // Equip an item
  const equipItem = async (itemId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/characters/${currentCharacter._id}/equipItem`, {
        itemId
      });
      
      setCurrentCharacter(res.data);
      
      // Update inventory in game progress
      setGameProgress({
        ...gameProgress,
        inventory: res.data.inventory
      });
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to equip item');
      setLoading(false);
      return { success: false };
    }
  };

  // Unequip an item
  const unequipItem = async (itemId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/characters/${currentCharacter._id}/unequipItem`, {
        itemId
      });
      
      setCurrentCharacter(res.data);
      
      // Update inventory in game progress
      setGameProgress({
        ...gameProgress,
        inventory: res.data.inventory
      });
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to unequip item');
      setLoading(false);
      return { success: false };
    }
  };

  // Abandon a quest
  const abandonQuest = async (questId) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/quests/${questId}/abandon`, {
        characterId: currentCharacter._id
      });
      
      // Update current character with the quest status change
      setCurrentCharacter(res.data.character);
      
      // Update quests in game progress
      const updatedQuests = gameProgress.quests.map(q => {
        if (q._id === questId) {
          return { ...q, status: 'available' };
        }
        return q;
      });
      
      setGameProgress({
        ...gameProgress,
        quests: updatedQuests
      });
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to abandon quest');
      setLoading(false);
      return { success: false };
    }
  };

  // Clear errors
  const clearErrors = () => setError(null);

  // Purchase item from shop
  const purchaseItem = async (itemId, price) => {
    setLoading(true);
    try {
      // Check if character has enough gold
      if (currentCharacter.gold < price) {
        setError('Недостаточно золота для покупки');
        setLoading(false);
        return { success: false, message: 'Недостаточно золота для покупки' };
      }

      // Deduct gold from character and add item to inventory (this would be a single API call in a real app)
      const res = await axios.post(`/api/characters/${currentCharacter._id}/purchase`, {
        itemId,
        price
      });
      
      // Update character data with new gold amount and inventory
      setCurrentCharacter(res.data);
      
      // Update inventory in game progress
      setGameProgress({
        ...gameProgress,
        inventory: res.data.inventory
      });
      
      setLoading(false);
      return { 
        success: true, 
        message: 'Предмет успешно приобретен',
        character: res.data
      };
    } catch (err) {
      setError(err.response?.data?.msg || 'Ошибка при покупке предмета');
      setLoading(false);
      return { success: false, message: 'Ошибка при покупке предмета' };
    }
  };

  return (
    <GameContext.Provider
      value={{
        characters,
        currentCharacter,
        gameProgress,
        loading,
        error,
        loadCharacters,
        createCharacter,
        selectCharacter,
        loadCharacterData,
        startQuest,
        updateQuestProgress,
        visitLocation,
        participateInEvent,
        addExperience,
        addItemToInventory,
        getLeaderboard,
        useItem,
        equipItem,
        unequipItem,
        abandonQuest,
        purchaseItem,
        clearErrors
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
