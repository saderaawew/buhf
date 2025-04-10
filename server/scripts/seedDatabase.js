const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import models
const Item = require('../models/Item');
const Location = require('../models/Location');
const Quest = require('../models/Quest');
const Event = require('../models/Event');

// Load environment variables
dotenv.config();

// Initial items data
const itemsData = [
  {
    name: 'Классический кальян',
    description: 'Базовый кальян для начинающих ценителей',
    type: 'hookah',
    price: 150,
    rarity: 'common',
    stats: { 
      aromaBonus: 5,
      mixingBonus: 0,
      prestigeValue: 1
    },
    imageUrl: '/images/items/basic-hookah.jpg',
    canBeEquipped: true,
    equipSlot: 'hookah'
  },
  {
    name: 'Кубинская сигара',
    description: 'Классическая кубинская сигара с насыщенным вкусом',
    type: 'cigar',
    price: 100,
    rarity: 'common',
    stats: { 
      flavor: 7,
      strength: 6,
      prestigeValue: 2
    },
    imageUrl: '/images/items/cuban-cigar.jpg',
    canBeEquipped: true,
    equipSlot: 'cigar'
  },
  {
    name: 'Золотой мундштук',
    description: 'Роскошный мундштук, инкрустированный золотом',
    type: 'accessory',
    price: 300,
    rarity: 'rare',
    stats: { 
      aromaBonus: 10,
      prestigeValue: 15
    },
    imageUrl: '/images/items/golden-tip.jpg',
    canBeEquipped: true,
    equipSlot: 'accessory'
  },
  {
    name: 'Премиальный табак',
    description: 'Ароматный табак высшего качества',
    type: 'tobacco',
    price: 80,
    rarity: 'uncommon',
    stats: { 
      flavor: 12,
      aromaBonus: 8
    },
    imageUrl: '/images/items/premium-tobacco.jpg',
    canBeEquipped: false
  }
];

// Initial locations data
const locationsData = [
  {
    name: 'Лаунж "Золотой дым"',
    description: 'Элитный лаунж-бар, специализирующийся на кальянах премиум-класса',
    type: 'lounge',
    imageUrl: '/images/locations/golden-smoke.jpg',
    requiredLevel: 1,
    requiredQuestIds: [],
    activities: [
      {
        name: 'Исследовать',
        description: 'Осмотреться и познакомиться с персоналом',
        rewardType: 'experience',
        rewardAmount: 10
      },
      {
        name: 'Общаться',
        description: 'Пообщаться с другими посетителями лаунжа',
        rewardType: 'knowledge',
        rewardAmount: 5
      }
    ],
    shopItems: ['Классический кальян', 'Премиальный табак']
  },
  {
    name: 'Сигарный клуб',
    description: 'Элитный клуб для ценителей качественных сигар',
    type: 'club',
    imageUrl: '/images/locations/cigar-club.jpg',
    requiredLevel: 2,
    requiredQuestIds: ['Знакомство с клубом'],
    activities: [
      {
        name: 'Дегустировать',
        description: 'Принять участие в дегустации редких сигар',
        rewardType: 'experience',
        rewardAmount: 15
      },
      {
        name: 'Общаться',
        description: 'Установить контакты с опытными коллекционерами',
        rewardType: 'knowledge',
        rewardAmount: 10
      }
    ],
    shopItems: ['Кубинская сигара']
  },
  {
    name: 'Рынок роскоши',
    description: 'Место, где можно найти редкие и экзотические товары',
    type: 'market',
    imageUrl: '/images/locations/luxury-market.jpg',
    requiredLevel: 1,
    requiredQuestIds: [],
    activities: [
      {
        name: 'Торговать',
        description: 'Купить или продать товары',
        rewardType: 'gold',
        rewardAmount: 20
      },
      {
        name: 'Изучать',
        description: 'Изучить новые товары и их особенности',
        rewardType: 'knowledge',
        rewardAmount: 8
      }
    ],
    shopItems: ['Золотой мундштук', 'Классический кальян', 'Кубинская сигара', 'Премиальный табак']
  }
];

// Initial quests data
const questsData = [
  {
    title: 'Знакомство с клубом',
    description: 'Посетите лаунж "Золотой дым" и познакомьтесь с персоналом',
    type: 'main',
    requiredLevel: 1,
    objectives: [
      {
        description: 'Посетить лаунж "Золотой дым"',
        type: 'visit_location',
        targetId: 'Лаунж "Золотой дым"',
        requiredAmount: 1
      }
    ],
    rewards: {
      experience: 50,
      gold: 100,
      items: ['Премиальный табак']
    },
    unlocks: ['Сигарный клуб']
  },
  {
    title: 'Первая покупка',
    description: 'Купите свой первый предмет в магазине',
    type: 'tutorial',
    requiredLevel: 1,
    objectives: [
      {
        description: 'Купить любой предмет в магазине',
        type: 'purchase_item',
        targetId: null,
        requiredAmount: 1
      }
    ],
    rewards: {
      experience: 30,
      gold: 50
    }
  },
  {
    title: 'Коллекционер сигар',
    description: 'Соберите коллекцию из трех различных сигар',
    type: 'collection',
    requiredLevel: 2,
    objectives: [
      {
        description: 'Собрать 3 разных сигары',
        type: 'collect_items',
        targetId: 'cigar',
        requiredAmount: 3
      }
    ],
    rewards: {
      experience: 100,
      gold: 200,
      items: ['Золотой мундштук']
    }
  }
];

// Initial events data
const eventsData = [
  {
    title: 'Фестиваль кальянной культуры',
    description: 'Ежегодный фестиваль, собирающий любителей кальянов со всего мира',
    type: 'festival',
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    requiredLevel: 1,
    rewards: {
      experience: 150,
      gold: 300,
      items: ['Премиальный табак']
    },
    activities: [
      {
        name: 'Мастер-класс',
        description: 'Научитесь создавать уникальные миксы',
        rewardType: 'skill',
        rewardAmount: 15
      },
      {
        name: 'Конкурс миксологов',
        description: 'Примите участие в конкурсе по созданию лучшего микса',
        rewardType: 'experience',
        rewardAmount: 50
      }
    ],
    imageUrl: '/images/events/hookah-festival.jpg'
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Clear database and seed with initial data
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Delete existing data
    console.log('Clearing existing data...');
    await Item.deleteMany({});
    await Location.deleteMany({});
    await Quest.deleteMany({});
    await Event.deleteMany({});
    
    // Insert items
    console.log('Inserting items...');
    const createdItems = await Item.insertMany(itemsData);
    console.log(`${createdItems.length} items inserted`);
    
    // Update location references to use actual item IDs
    const itemsMap = {};
    createdItems.forEach(item => {
      itemsMap[item.name] = item._id;
    });
    
    // Update locations to reference item IDs
    const updatedLocations = locationsData.map(location => {
      return {
        ...location,
        shopItems: location.shopItems.map(itemName => itemsMap[itemName])
      };
    });
    
    // Insert locations
    console.log('Inserting locations...');
    const createdLocations = await Location.insertMany(updatedLocations);
    console.log(`${createdLocations.length} locations inserted`);
    
    // Create map of location names to IDs
    const locationsMap = {};
    createdLocations.forEach(location => {
      locationsMap[location.name] = location._id;
    });
    
    // Update quests to reference location IDs and item IDs
    const updatedQuests = questsData.map(quest => {
      const updatedObjectives = quest.objectives.map(objective => {
        if (objective.type === 'visit_location' && objective.targetId) {
          return {
            ...objective,
            targetId: locationsMap[objective.targetId]
          };
        }
        return objective;
      });
      
      const updatedRewards = { ...quest.rewards };
      if (quest.rewards.items) {
        updatedRewards.items = quest.rewards.items.map(itemName => ({
          itemId: itemsMap[itemName],
          quantity: 1
        }));
      }
      
      const updatedUnlocks = quest.unlocks ? 
        quest.unlocks.map(locationName => locationsMap[locationName]) : 
        [];
      
      return {
        ...quest,
        objectives: updatedObjectives,
        rewards: updatedRewards,
        unlocks: updatedUnlocks
      };
    });
    
    // Insert quests
    console.log('Inserting quests...');
    const createdQuests = await Quest.insertMany(updatedQuests);
    console.log(`${createdQuests.length} quests inserted`);
    
    // Update events with item references
    const updatedEvents = eventsData.map(event => {
      const updatedRewards = { ...event.rewards };
      if (event.rewards.items) {
        updatedRewards.items = event.rewards.items.map(itemName => ({
          itemId: itemsMap[itemName],
          quantity: 1
        }));
      }
      
      return {
        ...event,
        rewards: updatedRewards
      };
    });
    
    // Insert events
    console.log('Inserting events...');
    const createdEvents = await Event.insertMany(updatedEvents);
    console.log(`${createdEvents.length} events inserted`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
