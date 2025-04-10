// Создание сервиса, имитирующего API-вызовы к серверу с использованием локальных JSON-файлов
import axios from 'axios';

// Временное хранилище для имитации состояния сервера
const mockState = {
  currentUser: {
    _id: 'user1',
    username: 'player',
    email: 'player@example.com',
    gold: 1000,
    level: 5
  },
  characters: [
    {
      _id: 'char1',
      name: 'Афисионадо',
      level: 3,
      experience: 320,
      gold: 750,
      stats: {
        prestige: 10,
        charisma: 8,
        luck: 6,
        satisfaction: 9
      },
      inventory: [
        {
          _id: 'item1',
          name: 'Кубинская сигара',
          quantity: 2,
          equipped: false
        },
        {
          _id: 'item4',
          name: 'Кальянная колба',
          quantity: 1,
          equipped: true
        }
      ],
      activeQuests: [],
      completedQuests: [],
      visitedLocations: ['loc1']
    }
  ]
};

// Функция для имитации задержки API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Имитация API для аутентификации
export const authAPI = {
  login: async (credentials) => {
    await delay(500);
    return {
      data: {
        token: 'mock-jwt-token',
        user: mockState.currentUser
      }
    };
  },
  register: async (userData) => {
    await delay(700);
    return {
      data: {
        token: 'mock-jwt-token',
        user: { ...mockState.currentUser, ...userData }
      }
    };
  },
  getProfile: async () => {
    await delay(300);
    return {
      data: mockState.currentUser
    };
  },
  updateProfile: async (userData) => {
    await delay(500);
    mockState.currentUser = { ...mockState.currentUser, ...userData };
    return {
      data: mockState.currentUser
    };
  }
};

// Имитация API для персонажей
export const characterAPI = {
  getAll: async () => {
    await delay(400);
    return {
      data: mockState.characters
    };
  },
  getById: async (id) => {
    await delay(300);
    const character = mockState.characters.find(char => char._id === id);
    return {
      data: character
    };
  },
  create: async (data) => {
    await delay(800);
    const newCharacter = {
      _id: `char${mockState.characters.length + 1}`,
      level: 1,
      experience: 0,
      gold: 100,
      stats: {
        prestige: 1,
        charisma: 1,
        luck: 1,
        satisfaction: 1
      },
      inventory: [],
      activeQuests: [],
      completedQuests: [],
      visitedLocations: [],
      ...data
    };
    mockState.characters.push(newCharacter);
    return {
      data: newCharacter
    };
  },
  update: async (id, data) => {
    await delay(500);
    const charIndex = mockState.characters.findIndex(char => char._id === id);
    if (charIndex !== -1) {
      mockState.characters[charIndex] = { ...mockState.characters[charIndex], ...data };
    }
    return {
      data: mockState.characters[charIndex]
    };
  },
  addExperience: async (id, amount) => {
    await delay(500);
    const charIndex = mockState.characters.findIndex(char => char._id === id);
    if (charIndex !== -1) {
      mockState.characters[charIndex].experience += amount;
      // Простая имитация повышения уровня
      const leveledUp = mockState.characters[charIndex].experience >= mockState.characters[charIndex].level * 100;
      if (leveledUp) {
        mockState.characters[charIndex].level += 1;
      }
      return {
        data: {
          character: mockState.characters[charIndex],
          leveledUp
        }
      };
    }
    throw new Error('Character not found');
  },
  addItem: async (id, itemId, quantity) => {
    await delay(500);
    const charIndex = mockState.characters.findIndex(char => char._id === id);
    if (charIndex !== -1) {
      const character = mockState.characters[charIndex];
      const itemIndex = character.inventory.findIndex(item => item._id === itemId);
      
      // Получаем информацию о предмете из storage
      const items = await itemAPI.getAll();
      const itemInfo = items.data.find(item => item._id === itemId);
      
      if (itemIndex !== -1) {
        character.inventory[itemIndex].quantity += quantity;
      } else {
        character.inventory.push({
          _id: itemId,
          name: itemInfo ? itemInfo.name : `Item ${itemId}`,
          quantity,
          equipped: false
        });
      }
      return {
        data: character
      };
    }
    throw new Error('Character not found');
  },
  purchase: async (id, itemId, price) => {
    await delay(700);
    const charIndex = mockState.characters.findIndex(char => char._id === id);
    if (charIndex !== -1) {
      const character = mockState.characters[charIndex];
      
      // Проверяем достаточно ли золота
      if (character.gold < price) {
        throw new Error('Insufficient gold');
      }
      
      // Вычитаем золото
      character.gold -= price;
      
      // Получаем информацию о предмете
      const items = await itemAPI.getAll();
      const itemInfo = items.data.find(item => item._id === itemId);
      
      // Добавляем предмет в инвентарь
      const itemIndex = character.inventory.findIndex(item => item._id === itemId);
      if (itemIndex !== -1) {
        character.inventory[itemIndex].quantity += 1;
      } else {
        character.inventory.push({
          _id: itemId,
          name: itemInfo ? itemInfo.name : `Item ${itemId}`,
          quantity: 1,
          equipped: false
        });
      }
      
      return {
        data: character
      };
    }
    throw new Error('Character not found');
  },
  useItem: async (id, itemId) => {
    await delay(500);
    const charIndex = mockState.characters.findIndex(char => char._id === id);
    if (charIndex !== -1) {
      const character = mockState.characters[charIndex];
      const itemIndex = character.inventory.findIndex(item => item._id === itemId);
      
      if (itemIndex !== -1 && character.inventory[itemIndex].quantity > 0) {
        character.inventory[itemIndex].quantity -= 1;
        
        // Если предметов больше нет, удаляем из инвентаря
        if (character.inventory[itemIndex].quantity <= 0) {
          character.inventory.splice(itemIndex, 1);
        }
        
        // Имитация эффектов использования предмета
        const effects = {
          stats: {
            satisfaction: 2
          },
          message: 'Вы использовали предмет и получили +2 к удовлетворению'
        };
        
        return {
          data: {
            character,
            effects
          }
        };
      }
      throw new Error('Item not found in inventory');
    }
    throw new Error('Character not found');
  },
  equipItem: async (id, itemId) => {
    await delay(400);
    const charIndex = mockState.characters.findIndex(char => char._id === id);
    if (charIndex !== -1) {
      const character = mockState.characters[charIndex];
      const itemIndex = character.inventory.findIndex(item => item._id === itemId);
      
      if (itemIndex !== -1) {
        character.inventory[itemIndex].equipped = true;
        return {
          data: character
        };
      }
      throw new Error('Item not found in inventory');
    }
    throw new Error('Character not found');
  },
  unequipItem: async (id, itemId) => {
    await delay(400);
    const charIndex = mockState.characters.findIndex(char => char._id === id);
    if (charIndex !== -1) {
      const character = mockState.characters[charIndex];
      const itemIndex = character.inventory.findIndex(item => item._id === itemId);
      
      if (itemIndex !== -1) {
        character.inventory[itemIndex].equipped = false;
        return {
          data: character
        };
      }
      throw new Error('Item not found in inventory');
    }
    throw new Error('Character not found');
  }
};

// Имитация API для заданий
export const questAPI = {
  getAll: async () => {
    await delay(500);
    return {
      data: [
        {
          _id: 'quest1',
          title: 'Первые шаги',
          description: 'Познакомьтесь с миром кальянов и сигар',
          level: 1,
          rewards: {
            experience: 100,
            gold: 50,
            items: []
          },
          objectives: [
            {
              description: 'Посетите Клуб Афисионадо',
              completed: true
            },
            {
              description: 'Купите свою первую сигару',
              completed: false
            }
          ],
          status: 'active'
        },
        {
          _id: 'quest2',
          title: 'Восточные тайны',
          description: 'Исследуйте восточные традиции курения кальяна',
          level: 2,
          rewards: {
            experience: 150,
            gold: 75,
            items: ['item3']
          },
          objectives: [
            {
              description: 'Посетите Восточный базар',
              completed: false
            },
            {
              description: 'Поговорите с продавцом кальянов',
              completed: false
            },
            {
              description: 'Попробуйте три разных вкуса табака',
              completed: false
            }
          ],
          status: 'available'
        }
      ]
    };
  },
  getById: async (id) => {
    const quests = await questAPI.getAll();
    return {
      data: quests.data.find(quest => quest._id === id)
    };
  },
  startQuest: async (id, characterId) => {
    await delay(600);
    const charIndex = mockState.characters.findIndex(char => char._id === characterId);
    if (charIndex !== -1) {
      // Здесь можно имитировать логику начала задания
      return {
        data: mockState.characters[charIndex]
      };
    }
    throw new Error('Character not found');
  },
  updateProgress: async (id, characterId, objectiveIndex, completed) => {
    await delay(500);
    // Имитация обновления прогресса задания
    return {
      data: {
        character: mockState.characters[0],
        questCompleted: false
      }
    };
  },
  abandonQuest: async (id, characterId) => {
    await delay(500);
    // Имитация отказа от задания
    return {
      data: {
        character: mockState.characters[0]
      }
    };
  }
};

// Имитация API для локаций
export const locationAPI = {
  getAll: async () => {
    await delay(500);
    const response = await fetch('/mock-api/locations.json');
    return {
      data: await response.json()
    };
  },
  getById: async (id) => {
    const locations = await locationAPI.getAll();
    return {
      data: locations.data.find(location => location._id === id)
    };
  },
  getForCharacter: async (characterId) => {
    await delay(400);
    const locations = await locationAPI.getAll();
    const character = mockState.characters.find(char => char._id === characterId);
    
    // Отмечаем какие локации посещены персонажем
    const locationsForCharacter = locations.data.map(location => {
      return {
        ...location,
        visited: character?.visitedLocations.includes(location._id) || false
      };
    });
    
    return {
      data: locationsForCharacter
    };
  },
  visit: async (id, characterId) => {
    await delay(600);
    const charIndex = mockState.characters.findIndex(char => char._id === characterId);
    if (charIndex !== -1) {
      const character = mockState.characters[charIndex];
      
      // Добавляем локацию в список посещенных, если её еще нет
      if (!character.visitedLocations.includes(id)) {
        character.visitedLocations.push(id);
      }
      
      const locations = await locationAPI.getAll();
      const locationDetails = locations.data.find(location => location._id === id);
      
      return {
        data: {
          character,
          locationDetails,
          itemsFound: []
        }
      };
    }
    throw new Error('Character not found');
  }
};

// Имитация API для предметов
export const itemAPI = {
  getAll: async () => {
    await delay(400);
    const response = await fetch('/mock-api/items.json');
    return {
      data: await response.json()
    };
  },
  getById: async (id) => {
    const items = await itemAPI.getAll();
    return {
      data: items.data.find(item => item._id === id)
    };
  },
  getByType: async (type) => {
    const items = await itemAPI.getAll();
    return {
      data: items.data.filter(item => item.type === type)
    };
  }
};

// Имитация API для событий
export const eventAPI = {
  getAll: async () => {
    await delay(500);
    return {
      data: [
        {
          _id: 'event1',
          title: 'Фестиваль сигар',
          description: 'Ежегодный фестиваль с дегустацией премиальных сигар',
          startDate: new Date(2025, 3, 15).toISOString(),
          endDate: new Date(2025, 3, 18).toISOString(),
          location: 'Клуб Афисионадо',
          rewards: {
            experience: 200,
            gold: 100,
            items: ['item1']
          },
          requirements: {
            level: 2
          },
          image: 'event-cigar-festival.jpg',
          active: true
        },
        {
          _id: 'event2',
          title: 'Мастер-класс по кальянам',
          description: 'Научитесь создавать идеальные миксы для кальяна',
          startDate: new Date(2025, 3, 20).toISOString(),
          endDate: new Date(2025, 3, 22).toISOString(),
          location: 'Восточный базар',
          rewards: {
            experience: 150,
            gold: 75,
            items: []
          },
          requirements: {
            level: 1
          },
          image: 'event-hookah-workshop.jpg',
          active: true
        }
      ]
    };
  },
  getActive: async () => {
    const events = await eventAPI.getAll();
    return {
      data: events.data.filter(event => event.active)
    };
  },
  getById: async (id) => {
    const events = await eventAPI.getAll();
    return {
      data: events.data.find(event => event._id === id)
    };
  },
  participate: async (id, characterId) => {
    await delay(700);
    // Имитация участия в событии
    const charIndex = mockState.characters.findIndex(char => char._id === characterId);
    const events = await eventAPI.getAll();
    const event = events.data.find(event => event._id === id);
    
    if (charIndex !== -1 && event) {
      // Выдаем награду персонажу
      mockState.characters[charIndex].experience += event.rewards.experience;
      mockState.characters[charIndex].gold += event.rewards.gold;
      
      return {
        data: {
          character: mockState.characters[charIndex],
          rewardsGranted: true,
          rewards: event.rewards
        }
      };
    }
    throw new Error('Character or event not found');
  }
};

// Имитация API для лидерборда
export const leaderboardAPI = {
  get: async (type = 'experience') => {
    await delay(600);
    // Генерация фейкового лидерборда
    return {
      data: [
        {
          _id: 'char1',
          name: 'Афисионадо',
          level: 3,
          experience: 320,
          gold: 750
        },
        {
          _id: 'char_other1',
          name: 'SmokeKing',
          level: 5,
          experience: 750,
          gold: 1200
        },
        {
          _id: 'char_other2',
          name: 'CloudMaster',
          level: 4,
          experience: 550,
          gold: 900
        },
        {
          _id: 'char_other3',
          name: 'HookahGuru',
          level: 6,
          experience: 980,
          gold: 1500
        }
      ].sort((a, b) => b[type] - a[type])
    };
  }
};

// Имитация API для проверки здоровья сервера
export const healthAPI = {
  check: async () => {
    await delay(200);
    return {
      data: {
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
      }
    };
  }
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
