import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import QuestDetailCard from '../components/QuestDetailCard';
import { questAPI } from '../services/api';
import './Quests.css';

const Quests = () => {
  const { currentCharacter, gameProgress, startQuest, abandonQuest } = useGame();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [error, setError] = useState(null);
  const [quests, setQuests] = useState({
    active: [],
    available: [],
    completed: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setLoading(true);
        // Получаем данные квестов из API
        const response = await questAPI.getAll();
        const allQuests = response.data;

        // Организуем квесты по их статусу
        // В реальном приложении статус будет определяться для каждого персонажа
        if (allQuests && allQuests.quests) {
          const activeQuests = allQuests.quests.filter(q => 
            currentCharacter?.activeQuests?.includes(q._id) || q.status === 'active'
          );
          
          const completedQuests = allQuests.quests.filter(q => 
            currentCharacter?.completedQuests?.includes(q._id) || q.status === 'completed'
          );
          
          const availableQuests = allQuests.quests.filter(q => 
            !activeQuests.find(aq => aq._id === q._id) && 
            !completedQuests.find(cq => cq._id === q._id)
          );

          setQuests({
            active: activeQuests.map(q => ({ ...q, status: 'active' })),
            available: availableQuests.map(q => ({ ...q, status: 'available' })),
            completed: completedQuests.map(q => ({ ...q, status: 'completed' }))
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке квестов:', err);
        setError('Не удалось загрузить квесты. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };

    fetchQuests();
  }, [currentCharacter]);

  const handleQuestSelect = (quest) => {
    setSelectedQuest(quest);
  };

  const handleCloseDetails = () => {
    setSelectedQuest(null);
  };

  const handleStartQuest = async (questId) => {
    try {
      setLoading(true);
      const result = await startQuest(questId);
      
      if (result.success) {
        // Navigate to quest detail page/active quest
        navigate(`/quest/${questId}`);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error starting quest:', error);
      setLoading(false);
    }
  };

  const handleAbandonQuest = async (questId) => {
    try {
      setLoading(true);
      const result = await abandonQuest(questId);
      
      if (result.success) {
        setSelectedQuest(null);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error abandoning quest:', error);
      setLoading(false);
    }
  };

  const getQuestDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 1: return 'Новичок';
      case 2: return 'Легкий';
      case 3: return 'Средний';
      case 4: return 'Сложный';
      case 5: return 'Эксперт';
      default: return 'Неизвестно';
    }
  };

  const getQuestDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 1: return 'novice';
      case 2: return 'easy';
      case 3: return 'medium';
      case 4: return 'hard';
      case 5: return 'expert';
      default: return 'novice';
    }
  };

  const getQuestTypeIcon = (type) => {
    switch (type) {
      case 'story': return 'fa-book';
      case 'daily': return 'fa-calendar-day';
      case 'collection': return 'fa-search';
      case 'challenge': return 'fa-trophy';
      case 'event': return 'fa-star';
      default: return 'fa-scroll';
    }
  };

  const getQuestTypeLabel = (type) => {
    switch (type) {
      case 'story': return 'Сюжетный';
      case 'daily': return 'Ежедневный';
      case 'collection': return 'Коллекционный';
      case 'challenge': return 'Испытание';
      case 'event': return 'Событие';
      default: return 'Стандартный';
    }
  };

  // Calculate progress percentage for active quests
  const calculateQuestProgress = (quest) => {
    if (!quest.objectives || quest.objectives.length === 0) return 0;
    
    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    return Math.round((completedObjectives / quest.objectives.length) * 100);
  };

  // Функция для запуска квеста
  const handleStartQuestClick = async (questId) => {
    try {
      setLoading(true);
      const result = await startQuest(questId);
      
      if (result) {
        // Перезагружаем квесты для обновления их статусов
        const response = await questAPI.getAll();
        const allQuests = response.data;
        
        if (allQuests && allQuests.quests) {
          // Обновляем статус квеста на активный
          const updatedQuests = { ...quests };
          
          // Находим квест в доступных и перемещаем его в активные
          const questToMove = updatedQuests.available.find(q => q._id === questId);
          if (questToMove) {
            questToMove.status = 'active';
            updatedQuests.available = updatedQuests.available.filter(q => q._id !== questId);
            updatedQuests.active = [...updatedQuests.active, questToMove];
            setQuests(updatedQuests);
          }
          
          setSelectedQuest(null);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при запуске квеста:', error);
      setError('Не удалось начать квест. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Функция для отказа от квеста
  const handleAbandonQuestClick = async (questId) => {
    try {
      setLoading(true);
      const result = await abandonQuest(questId);
      
      if (result.success) {
        // Перезагружаем квесты для обновления их статусов
        const response = await questAPI.getAll();
        const allQuests = response.data;
        
        if (allQuests && allQuests.quests) {
          // Обновляем статус квеста на доступный
          const updatedQuests = { ...quests };
          
          // Находим квест в активных и перемещаем его в доступные
          const questToMove = updatedQuests.active.find(q => q._id === questId);
          if (questToMove) {
            questToMove.status = 'available';
            updatedQuests.active = updatedQuests.active.filter(q => q._id !== questId);
            updatedQuests.available = [...updatedQuests.available, questToMove];
            setQuests(updatedQuests);
          }
          
          setSelectedQuest(null);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при отказе от квеста:', error);
      setError('Не удалось отказаться от квеста. Пожалуйста, попробуйте позже.');
      setLoading(false);
    }
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const questVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="quests-loading">
        <div className="spinner-large"></div>
        <p>Загрузка квестов...</p>
      </div>
    );
  }

  return (
    <div className="quests-page">
      <div className="quests-container">
        <div className="quests-header">
          <h1>Журнал квестов</h1>
          <div className="quests-stats">
            <div className="stat">
              <i className="fas fa-check"></i>
              <span>{quests.completed.length} завершено</span>
            </div>
            <div className="stat">
              <i className="fas fa-spinner"></i>
              <span>{quests.active.length} активно</span>
            </div>
          </div>
        </div>

        <div className="quests-tabs">
          <button 
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <i className="fas fa-play-circle"></i> Активные
            <span className="quest-count">{quests.active.length}</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            <i className="fas fa-scroll"></i> Доступные
            <span className="quest-count">{quests.available.length}</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <i className="fas fa-check-circle"></i> Завершенные
            <span className="quest-count">{quests.completed.length}</span>
          </button>
        </div>

        <div className="quests-content">
          <div className="quests-list-container">
            {quests[activeTab].length === 0 ? (
              <div className="empty-quests">
                {activeTab === 'active' && (
                  <>
                    <i className="fas fa-hourglass-start"></i>
                    <p>У вас нет активных квестов</p>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setActiveTab('available')}
                    >
                      Посмотреть доступные квесты
                    </button>
                  </>
                )}
                {activeTab === 'available' && (
                  <>
                    <i className="fas fa-map-marked"></i>
                    <p>Нет доступных квестов</p>
                    <p className="empty-hint">Исследуйте новые локации, чтобы найти квесты</p>
                  </>
                )}
                {activeTab === 'completed' && (
                  <>
                    <i className="fas fa-award"></i>
                    <p>У вас нет завершенных квестов</p>
                    <p className="empty-hint">Выполняйте квесты, чтобы повысить свой статус и получить награды</p>
                  </>
                )}
              </div>
            ) : (
              <motion.div 
                className="quests-list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {quests[activeTab].map((quest) => (
                  <motion.div 
                    key={quest._id}
                    className={`quest-item ${quest.status} ${quest.isNew ? 'new' : ''}`}
                    onClick={() => handleQuestSelect(quest)}
                    variants={questVariants}
                  >
                    <div className="quest-icon">
                      <i className={`fas ${getQuestTypeIcon(quest.type)}`}></i>
                    </div>
                    
                    <div className="quest-content">
                      <div className="quest-header">
                        <h3>{quest.title}</h3>
                        <div className={`quest-difficulty ${getQuestDifficultyClass(quest.difficulty)}`}>
                          {getQuestDifficultyLabel(quest.difficulty)}
                        </div>
                      </div>
                      
                      <p className="quest-description">{quest.shortDescription}</p>
                      
                      {quest.status === 'active' && (
                        <div className="quest-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${calculateQuestProgress(quest)}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{calculateQuestProgress(quest)}%</span>
                        </div>
                      )}
                      
                      <div className="quest-footer">
                        <div className="quest-location">
                          {quest.location && (
                            <>
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{quest.location.name}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="quest-rewards">
                          {quest.rewards.xp > 0 && <span className="reward xp">{quest.rewards.xp} XP</span>}
                          {quest.rewards.gold > 0 && <span className="reward gold">{quest.rewards.gold} G</span>}
                          {quest.rewards.items && quest.rewards.items.length > 0 && <span className="reward items"><i className="fas fa-box"></i> {quest.rewards.items.length}</span>}
                        </div>
                      </div>
                    </div>
                    
                    {quest.isNew && <div className="new-badge">НОВЫЙ</div>}
                    
                    <div className="quest-arrow">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
          
          <AnimatePresence>
            {selectedQuest && (
              <motion.div 
                className="quest-details-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseDetails}
              >
                <motion.div 
                  className="quest-details"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="quest-details-header">
                    <h2>{selectedQuest.title}</h2>
                    <button className="close-btn" onClick={handleCloseDetails}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="quest-details-content">
                    <div className="quest-details-main">
                      <div className="quest-details-banner" style={{backgroundImage: `url('/assets/quests/${selectedQuest.image || 'default-quest.jpg'}')`}}>
                        <div className="quest-type-badge">
                          <i className={`fas ${getQuestTypeIcon(selectedQuest.type)}`}></i>
                          <span>{getQuestTypeLabel(selectedQuest.type)}</span>
                        </div>
                        <div className={`quest-difficulty-badge ${getQuestDifficultyClass(selectedQuest.difficulty)}`}>
                          {getQuestDifficultyLabel(selectedQuest.difficulty)}
                        </div>
                      </div>
                      
                      <div className="quest-details-description">
                        <p>{selectedQuest.description}</p>
                      </div>
                      
                      {selectedQuest.objectives && selectedQuest.objectives.length > 0 && (
                        <div className="quest-objectives">
                          <h3>Цели</h3>
                          <ul>
                            {selectedQuest.objectives.map((objective, index) => (
                              <li key={index} className={objective.completed ? 'completed' : ''}>
                                <div className="objective-check">
                                  {objective.completed ? (
                                    <i className="fas fa-check-circle"></i>
                                  ) : (
                                    <i className="far fa-circle"></i>
                                  )}
                                </div>
                                <span className="objective-text">{objective.description}</span>
                                {objective.progress && (
                                  <span className="objective-progress">
                                    {objective.current}/{objective.target}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {selectedQuest.location && (
                        <div className="quest-location-info">
                          <h3>Локация</h3>
                          <div className="location-card">
                            <div className="location-image" style={{backgroundImage: `url('/assets/locations/${selectedQuest.location.image || 'default-location.jpg'}')`}}></div>
                            <div className="location-card-content">
                              <h4>{selectedQuest.location.name}</h4>
                              <p>{selectedQuest.location.shortDescription}</p>
                              <button className="btn btn-secondary btn-small">
                                <i className="fas fa-map-marked-alt"></i> На карте
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="quest-details-sidebar">
                      {selectedQuest.status === 'active' && (
                        <div className="quest-progress-card">
                          <h3>Прогресс квеста</h3>
                          <div className="circular-progress">
                            <div className="progress-circle">
                              <div className="progress-circle-fill" style={{ 
                                background: `conic-gradient(var(--gold-primary) ${calculateQuestProgress(selectedQuest) * 3.6}deg, transparent 0deg)` 
                              }}></div>
                              <div className="progress-circle-value">{calculateQuestProgress(selectedQuest)}%</div>
                            </div>
                          </div>
                          
                          <div className="progress-status">
                            <span>Выполнено {selectedQuest.objectives.filter(obj => obj.completed).length} из {selectedQuest.objectives.length} целей</span>
                          </div>
                          
                          {selectedQuest.timeLimit && (
                            <div className="time-limit">
                              <i className="fas fa-clock"></i>
                              <span>Осталось: {selectedQuest.timeRemaining}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="quest-rewards-card">
                        <h3>Награды</h3>
                        <div className="rewards-list">
                          {selectedQuest.rewards.xp > 0 && (
                            <div className="reward-item">
                              <div className="reward-icon xp">
                                <i className="fas fa-star"></i>
                              </div>
                              <div className="reward-info">
                                <span className="reward-name">Опыт</span>
                                <span className="reward-value">{selectedQuest.rewards.xp} XP</span>
                              </div>
                            </div>
                          )}
                          
                          {selectedQuest.rewards.gold > 0 && (
                            <div className="reward-item">
                              <div className="reward-icon gold">
                                <i className="fas fa-coins"></i>
                              </div>
                              <div className="reward-info">
                                <span className="reward-name">Золото</span>
                                <span className="reward-value">{selectedQuest.rewards.gold} G</span>
                              </div>
                            </div>
                          )}
                          
                          {selectedQuest.rewards.items && selectedQuest.rewards.items.map((item, index) => (
                            <div key={index} className="reward-item">
                              <div className={`reward-icon item ${item.rarity}`}>
                                <img src={`/assets/items/${item.image || 'default-item.png'}`} alt={item.name} />
                              </div>
                              <div className="reward-info">
                                <span className="reward-name">{item.name}</span>
                                <span className={`reward-rarity ${item.rarity}`}>
                                  {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {selectedQuest.giver && (
                        <div className="quest-giver-card">
                          <h3>Заказчик</h3>
                          <div className="quest-giver">
                            <div className="giver-avatar">
                              <img src={`/assets/npcs/${selectedQuest.giver.avatar || 'default-npc.png'}`} alt={selectedQuest.giver.name} />
                            </div>
                            <div className="giver-info">
                              <h4>{selectedQuest.giver.name}</h4>
                              <p>{selectedQuest.giver.title}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="quest-details-actions">
                    {selectedQuest.status === 'available' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleStartQuest(selectedQuest._id)}
                      >
                        <i className="fas fa-play"></i> Начать квест
                      </button>
                    )}
                    
                    {selectedQuest.status === 'active' && (
                      <>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => navigate(`/quest/${selectedQuest._id}`)}
                        >
                          <i className="fas fa-map-marked-alt"></i> Перейти к квесту
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleAbandonQuest(selectedQuest._id)}
                        >
                          <i className="fas fa-times"></i> Отказаться от квеста
                        </button>
                      </>
                    )}
                    
                    {selectedQuest.status === 'completed' && (
                      <button className="btn btn-gold">
                        <i className="fas fa-check"></i> Квест завершен
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Quests;
