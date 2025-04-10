import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    currentCharacter, 
    gameProgress, 
    loadCharacterData, 
    characters, 
    loadCharacters,
    selectCharacter 
  } = useGame();
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      if (!characters || characters.length === 0) {
        await loadCharacters();
      }
      
      if (currentCharacter) {
        await loadCharacterData();
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [loadCharacters, loadCharacterData, characters, currentCharacter]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };
  
  // If user has no characters yet, prompt them to create one
  if ((!characters || characters.length === 0) && !loading) {
    return (
      <motion.div 
        className="dashboard no-character"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="no-character-container" variants={itemVariants}>
          <h2>Добро пожаловать в мир Hookah & Cigar RPG</h2>
          <p>Для начала приключения, создайте вашего первого персонажа</p>
          <Link to="/characters/create" className="btn btn-primary">
            Создать персонажа
          </Link>
        </motion.div>
      </motion.div>
    );
  }
  
  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {currentCharacter && (
        <>
          <div className="dashboard-header">
            <motion.div className="character-profile" variants={itemVariants}>
              <div className="character-avatar-large">
                <img 
                  src={currentCharacter.avatar || '/assets/default-avatar.png'} 
                  alt={currentCharacter.name} 
                />
              </div>
              
              <div className="character-details">
                <h1>{currentCharacter.name}</h1>
                <div className="character-stats">
                  <div className="stat">
                    <span className="stat-label">Уровень</span>
                    <span className="stat-value">{currentCharacter.level}</span>
                  </div>
                  
                  <div className="stat">
                    <span className="stat-label">Опыт</span>
                    <div className="experience-bar-large">
                      <div 
                        className="experience-progress"
                        style={{ 
                          width: `${(currentCharacter.experience % 100)}%` 
                        }}
                      ></div>
                      <span className="experience-text">
                        {currentCharacter.experience % 100}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="stat">
                    <span className="stat-label">Очки</span>
                    <span className="stat-value gold-text">
                      <i className="fas fa-coins"></i> {currentCharacter.points}
                    </span>
                  </div>
                  
                  <div className="stat">
                    <span className="stat-label">Жетоны</span>
                    <span className="stat-value gold-text">
                      <i className="fas fa-gem"></i> {currentCharacter.tokens}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="dashboard-content">
            <div className="dashboard-section">
              <motion.div className="section-header" variants={itemVariants}>
                <h2>Навыки</h2>
                <p>Ваши специализации в мире кальянов и сигар</p>
              </motion.div>
              
              <motion.div className="skills-grid" variants={itemVariants}>
                <div className="skill-card">
                  <div className="skill-icon">
                    <i className="fas fa-smoking"></i>
                  </div>
                  <div className="skill-info">
                    <h3>Знание табаков</h3>
                    <div className="skill-level">
                      <div className="skill-progress-bar">
                        <div 
                          className="skill-progress"
                          style={{ 
                            width: `${(currentCharacter.skills.tobaccoKnowledge)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="skill-value">{currentCharacter.skills.tobaccoKnowledge}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="skill-card">
                  <div className="skill-icon">
                    <i className="fas fa-wine-glass-alt"></i>
                  </div>
                  <div className="skill-info">
                    <h3>Ароматическая экспертиза</h3>
                    <div className="skill-level">
                      <div className="skill-progress-bar">
                        <div 
                          className="skill-progress"
                          style={{ 
                            width: `${(currentCharacter.skills.aromaExpertise)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="skill-value">{currentCharacter.skills.aromaExpertise}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="skill-card">
                  <div className="skill-icon">
                    <i className="fas fa-mortar-pestle"></i>
                  </div>
                  <div className="skill-info">
                    <h3>Мастерство миксов</h3>
                    <div className="skill-level">
                      <div className="skill-progress-bar">
                        <div 
                          className="skill-progress"
                          style={{ 
                            width: `${(currentCharacter.skills.mixingMastery)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="skill-value">{currentCharacter.skills.mixingMastery}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="skill-card">
                  <div className="skill-icon">
                    <i className="fas fa-fire-alt"></i>
                  </div>
                  <div className="skill-info">
                    <h3>Коллекционер сигар</h3>
                    <div className="skill-level">
                      <div className="skill-progress-bar">
                        <div 
                          className="skill-progress"
                          style={{ 
                            width: `${(currentCharacter.skills.cigarConnoisseur)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="skill-value">{currentCharacter.skills.cigarConnoisseur}/100</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="dashboard-row">
              <div className="dashboard-section quests-section">
                <motion.div className="section-header" variants={itemVariants}>
                  <h2>Активные квесты</h2>
                  <Link to="/map" className="view-all-link">Карта <i className="fas fa-arrow-right"></i></Link>
                </motion.div>
                
                <motion.div className="quest-list" variants={itemVariants}>
                  {currentCharacter.activeQuests && currentCharacter.activeQuests.length > 0 ? (
                    currentCharacter.activeQuests.map((quest, index) => (
                      <div className="quest-item" key={index}>
                        <div className="quest-icon">
                          <i className="fas fa-scroll"></i>
                        </div>
                        <div className="quest-details">
                          <h3>{quest.questId?.title || 'Квест'}</h3>
                          <div className="quest-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress"
                                style={{ width: `${quest.progress}%` }}
                              ></div>
                            </div>
                            <span>{quest.progress}%</span>
                          </div>
                        </div>
                        <Link to={`/quest/${quest.questId?._id}`} className="btn btn-small">
                          <i className="fas fa-chevron-right"></i>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>У вас пока нет активных квестов</p>
                      <Link to="/map" className="btn btn-secondary">
                        Найти квесты
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
              
              <div className="dashboard-section events-section">
                <motion.div className="section-header" variants={itemVariants}>
                  <h2>Текущие события</h2>
                  <Link to="/events" className="view-all-link">Все события <i className="fas fa-arrow-right"></i></Link>
                </motion.div>
                
                <motion.div className="event-list" variants={itemVariants}>
                  {gameProgress.activeEvents && gameProgress.activeEvents.length > 0 ? (
                    gameProgress.activeEvents.slice(0, 3).map((event, index) => (
                      <div className="event-item" key={index}>
                        <div className="event-icon">
                          {event.type === 'competition' && <i className="fas fa-trophy"></i>}
                          {event.type === 'special_offer' && <i className="fas fa-percentage"></i>}
                          {event.type === 'seasonal' && <i className="fas fa-calendar-alt"></i>}
                          {event.type === 'promotion' && <i className="fas fa-star"></i>}
                        </div>
                        <div className="event-details">
                          <div className="event-header">
                            <h3>{event.name}</h3>
                            <span className="event-type">
                              {event.type === 'competition' && 'Соревнование'}
                              {event.type === 'special_offer' && 'Спец. предложение'}
                              {event.type === 'seasonal' && 'Сезонное событие'}
                              {event.type === 'promotion' && 'Акция'}
                            </span>
                          </div>
                          <p className="event-desc">{event.description}</p>
                          <div className="event-time">
                            <i className="far fa-clock"></i>
                            <span>
                              {new Date(event.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link to={`/events/${event._id}`} className="btn btn-small">
                          <i className="fas fa-chevron-right"></i>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>Сейчас нет активных событий</p>
                      <Link to="/events" className="btn btn-secondary">
                        Просмотреть календарь
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
            
            <div className="dashboard-section inventory-preview">
              <motion.div className="section-header" variants={itemVariants}>
                <h2>Ваша коллекция</h2>
                <Link to="/inventory" className="view-all-link">Инвентарь <i className="fas fa-arrow-right"></i></Link>
              </motion.div>
              
              <motion.div className="inventory-grid" variants={itemVariants}>
                {currentCharacter.inventory && currentCharacter.inventory.length > 0 ? (
                  currentCharacter.inventory.slice(0, 4).map((item, index) => (
                    <div className={`inventory-item rarity-${item.itemId?.rarity || 'common'}`} key={index}>
                      <div className="item-image">
                        <img 
                          src={item.itemId?.image || '/assets/default-item.png'} 
                          alt={item.itemId?.name || 'Предмет'} 
                        />
                        {item.quantity > 1 && (
                          <span className="item-quantity">{item.quantity}</span>
                        )}
                      </div>
                      <div className="item-name">
                        {item.itemId?.name || 'Предмет'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-inventory">
                    <p>Ваша коллекция пуста</p>
                    <Link to="/map" className="btn btn-secondary btn-sm">
                      Исследовать локации
                    </Link>
                  </div>
                )}
                
                {currentCharacter.inventory && currentCharacter.inventory.length > 4 && (
                  <div className="inventory-more">
                    <Link to="/inventory" className="btn btn-small btn-dark">
                      Еще {currentCharacter.inventory.length - 4} предметов
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
