import React from 'react';
import { motion } from 'framer-motion';
import './QuestDetailCard.css';

const QuestDetailCard = ({ quest, onClose, onStart, onAbandon, character }) => {
  // Функции для определения типа и сложности квеста
  const getQuestDifficultyLabel = (level) => {
    switch (level) {
      case 1: return 'Новичок';
      case 2: return 'Легкий';
      case 3: return 'Средний';
      case 4: return 'Сложный';
      case 5: return 'Эксперт';
      default: return 'Уровень ' + level;
    }
  };

  const getQuestTypeIcon = (type) => {
    switch (type) {
      case 'story': return 'fa-book';
      case 'daily': return 'fa-calendar-day';
      case 'collection': return 'fa-search';
      case 'challenge': return 'fa-trophy';
      case 'event': return 'fa-star';
      case 'intro': return 'fa-graduation-cap';
      case 'exploration': return 'fa-compass';
      case 'crafting': return 'fa-hammer';
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
      case 'intro': return 'Обучающий';
      case 'exploration': return 'Исследование';
      case 'crafting': return 'Крафтинг';
      default: return 'Стандартный';
    }
  };

  // Проверка доступности квеста по уровню персонажа
  const isQuestAvailable = () => {
    if (!character) return false;
    return character.level >= quest.level;
  };

  // Классы для отображения сложности квеста
  const getDifficultyClass = (level) => {
    switch (level) {
      case 1: return 'novice';
      case 2: return 'easy';
      case 3: return 'medium';
      case 4: return 'hard';
      case 5: return 'expert';
      default: return '';
    }
  };

  // Анимации для карточки квеста
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="quest-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="quest-detail-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="quest-detail-header">
          <h2>{quest.title}</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="quest-detail-content">
          <div className="quest-detail-banner">
            <img 
              src={`/assets/quests/${quest.image || 'default-quest.jpg'}`} 
              alt={quest.title} 
              onError={(e) => {e.target.src = '/assets/quests/default-quest.jpg'}}
            />
            <div className="quest-detail-badges">
              <span className={`quest-difficulty ${getDifficultyClass(quest.level)}`}>
                <i className="fas fa-signal"></i> {getQuestDifficultyLabel(quest.level)}
              </span>
              <span className="quest-type">
                <i className={`fas ${getQuestTypeIcon(quest.type)}`}></i> {getQuestTypeLabel(quest.type)}
              </span>
            </div>
          </div>
          
          <div className="quest-description">
            <p>{quest.description}</p>
          </div>
          
          <div className="quest-requirements">
            <h3>Требования</h3>
            <div className="requirement">
              <i className="fas fa-user-graduate"></i>
              <span>Минимальный уровень: {quest.level}</span>
              {character && character.level < quest.level && (
                <span className="requirement-missing">Ваш уровень: {character.level}</span>
              )}
            </div>
          </div>
          
          <div className="quest-objectives">
            <h3>Цели</h3>
            <ul>
              {quest.objectives.map((objective, index) => (
                <li key={index} className={objective.completed ? 'completed' : ''}>
                  <div className="objective-check">
                    {objective.completed ? (
                      <i className="fas fa-check-circle"></i>
                    ) : (
                      <i className="far fa-circle"></i>
                    )}
                  </div>
                  <div className="objective-content">
                    <span className="objective-description">{objective.description}</span>
                    {objective.progress && (
                      <div className="objective-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{width: `${(objective.progress.current / objective.progress.required) * 100}%`}}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {objective.progress.current}/{objective.progress.required}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="quest-rewards">
            <h3>Награды</h3>
            <div className="rewards-list">
              {quest.rewards.experience > 0 && (
                <div className="reward-item">
                  <div className="reward-icon xp">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="reward-info">
                    <span className="reward-name">Опыт</span>
                    <span className="reward-value">{quest.rewards.experience} XP</span>
                  </div>
                </div>
              )}
              
              {quest.rewards.gold > 0 && (
                <div className="reward-item">
                  <div className="reward-icon gold">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="reward-info">
                    <span className="reward-name">Золото</span>
                    <span className="reward-value">{quest.rewards.gold} G</span>
                  </div>
                </div>
              )}
              
              {quest.rewards.items && quest.rewards.items.length > 0 && (
                quest.rewards.items.map((itemId, index) => (
                  <div key={index} className="reward-item">
                    <div className="reward-icon item">
                      <i className="fas fa-box-open"></i>
                    </div>
                    <div className="reward-info">
                      <span className="reward-name">Предмет</span>
                      <span className="reward-value">{itemId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="quest-detail-actions">
          {quest.status === 'available' && (
            <button 
              className="btn btn-primary"
              onClick={() => onStart(quest._id)}
              disabled={!isQuestAvailable()}
            >
              <i className="fas fa-play"></i> 
              {isQuestAvailable() ? 'Начать квест' : 'Недостаточный уровень'}
            </button>
          )}
          
          {quest.status === 'active' && (
            <button 
              className="btn btn-danger"
              onClick={() => onAbandon(quest._id)}
            >
              <i className="fas fa-times"></i> Отказаться от квеста
            </button>
          )}
          
          {quest.status === 'completed' && (
            <div className="quest-completed-badge">
              <i className="fas fa-check-circle"></i> Квест выполнен
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestDetailCard;
