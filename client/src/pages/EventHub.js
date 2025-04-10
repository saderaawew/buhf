import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import './EventHub.css';

const EventHub = () => {
  const { currentCharacter, gameProgress, participateInEvent } = useGame();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState({
    active: [],
    upcoming: [],
    completed: []
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [participationResult, setParticipationResult] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (gameProgress && gameProgress.activeEvents) {
      categorizeEvents();
      setLoading(false);
    }
  }, [gameProgress]);

  // Categorize events by status
  const categorizeEvents = () => {
    if (!gameProgress.activeEvents) return;

    const now = new Date();
    const active = [];
    const upcoming = [];
    const completed = [];

    gameProgress.activeEvents.forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (now < startDate) {
        upcoming.push(event);
      } else if (now > endDate) {
        if (currentCharacter.participatedEvents?.includes(event._id)) {
          completed.push({
            ...event,
            participated: true
          });
        } else {
          completed.push({
            ...event,
            participated: false
          });
        }
      } else {
        if (currentCharacter.participatedEvents?.includes(event._id)) {
          active.push({
            ...event,
            participated: true
          });
        } else {
          active.push({
            ...event,
            participated: false
          });
        }
      }
    });

    // Sort events by date
    active.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    completed.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

    setEvents({ active, upcoming, completed });
  };

  // Handle event selection
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setParticipationResult(null);
  };

  // Close event details
  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setParticipationResult(null);
  };

  // Participate in event
  const handleParticipate = async (eventId) => {
    setLoading(true);
    
    try {
      const result = await participateInEvent(eventId);
      
      if (result.success) {
        setParticipationResult(result.participation);
        
        // Update the event's participation status in the local state
        setEvents(prevEvents => {
          const updatedActive = prevEvents.active.map(event => {
            if (event._id === eventId) {
              return { ...event, participated: true };
            }
            return event;
          });
          
          return {
            ...prevEvents,
            active: updatedActive
          };
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error participating in event:', error);
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Get time remaining for active events
  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Завершено';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} д. ${hours} ч.`;
    } else if (hours > 0) {
      return `${hours} ч. ${minutes} мин.`;
    } else {
      return `${minutes} мин.`;
    }
  };

  // Get time until start for upcoming events
  const getTimeUntilStart = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start - now;
    
    if (diff <= 0) return 'Начинается...';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `через ${days} д. ${hours} ч.`;
    } else if (hours > 0) {
      return `через ${hours} ч. ${minutes} мин.`;
    } else {
      return `через ${minutes} мин.`;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  if (loading) {
    return (
      <div className="events-loading">
        <div className="spinner-large"></div>
        <p>Загрузка событий...</p>
      </div>
    );
  }

  return (
    <div className="event-hub-page">
      <div className="event-hub-container">
        <div className="event-hub-header">
          <h1>Календарь событий</h1>
          <div className="event-stats">
            <div className="stat">
              <i className="fas fa-calendar-day"></i>
              <span>{events.active.length} активно</span>
            </div>
            <div className="stat">
              <i className="fas fa-calendar-plus"></i>
              <span>{events.upcoming.length} предстоит</span>
            </div>
          </div>
        </div>

        <div className="event-tabs">
          <button 
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <i className="fas fa-calendar-alt"></i> Активные
            <span className="event-count">{events.active.length}</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <i className="fas fa-calendar-plus"></i> Предстоящие
            <span className="event-count">{events.upcoming.length}</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <i className="fas fa-calendar-check"></i> Завершенные
            <span className="event-count">{events.completed.length}</span>
          </button>
        </div>

        <div className="event-content">
          {events[activeTab].length === 0 ? (
            <div className="empty-events">
              {activeTab === 'active' && (
                <>
                  <i className="fas fa-calendar-times"></i>
                  <p>Нет активных событий</p>
                  <p className="empty-hint">Загляните позже или посмотрите на предстоящие события</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Посмотреть предстоящие события
                  </button>
                </>
              )}
              {activeTab === 'upcoming' && (
                <>
                  <i className="fas fa-calendar"></i>
                  <p>Нет предстоящих событий</p>
                  <p className="empty-hint">Новые события будут добавлены в ближайшее время</p>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <i className="fas fa-history"></i>
                  <p>Нет завершенных событий</p>
                  <p className="empty-hint">История событий будет доступна здесь</p>
                </>
              )}
            </div>
          ) : (
            <motion.div 
              className="events-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {events[activeTab].map((event) => (
                <motion.div 
                  key={event._id}
                  className={`event-item ${event.type} ${event.participated ? 'participated' : ''}`}
                  onClick={() => handleSelectEvent(event)}
                  variants={itemVariants}
                >
                  <div 
                    className="event-image"
                    style={{ backgroundImage: `url('/assets/events/${event.image || 'default-event.jpg'}')` }}
                  >
                    {event.promoted && (
                      <div className="promoted-badge">
                        <i className="fas fa-star"></i> Промо
                      </div>
                    )}
                    
                    {event.participated && (
                      <div className="participated-badge">
                        <i className="fas fa-check"></i> Участие принято
                      </div>
                    )}
                    
                    <div className="event-type-badge">
                      {event.type === 'contest' && 'Конкурс'}
                      {event.type === 'tasting' && 'Дегустация'}
                      {event.type === 'promotion' && 'Промо-акция'}
                      {event.type === 'limited' && 'Ограниченное предложение'}
                      {event.type === 'vip' && 'VIP-событие'}
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      {activeTab === 'active' && (
                        <div className="event-timer">
                          <i className="fas fa-clock"></i>
                          <span>{getTimeRemaining(event.endDate)}</span>
                        </div>
                      )}
                      {activeTab === 'upcoming' && (
                        <div className="event-timer upcoming">
                          <i className="fas fa-hourglass-start"></i>
                          <span>{getTimeUntilStart(event.startDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="event-description">{event.shortDescription}</p>
                    
                    <div className="event-footer">
                      <div className="event-dates">
                        <div className="event-date">
                          <i className="fas fa-calendar-day"></i>
                          <div className="date-info">
                            <span className="date-label">Начало:</span>
                            <span className="date-value">{formatDate(event.startDate)}</span>
                          </div>
                        </div>
                        <div className="event-date">
                          <i className="fas fa-calendar-times"></i>
                          <div className="date-info">
                            <span className="date-label">Окончание:</span>
                            <span className="date-value">{formatDate(event.endDate)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="event-rewards-preview">
                        {event.rewards.xp > 0 && <span className="reward xp">{event.rewards.xp} XP</span>}
                        {event.rewards.gold > 0 && <span className="reward gold">{event.rewards.gold} G</span>}
                        {event.rewards.items && event.rewards.items.length > 0 && (
                          <span className="reward items">
                            <i className="fas fa-box"></i> {event.rewards.items.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="event-arrow">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            className="event-details-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDetails}
          >
            <motion.div 
              className="event-details"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="event-details-header">
                <h2>{selectedEvent.title}</h2>
                <button className="close-btn" onClick={handleCloseDetails}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="event-details-banner" style={{backgroundImage: `url('/assets/events/${selectedEvent.image || 'default-event.jpg'}')`}}>
                <div className="event-type-badge large">
                  {selectedEvent.type === 'contest' && 'Конкурс'}
                  {selectedEvent.type === 'tasting' && 'Дегустация'}
                  {selectedEvent.type === 'promotion' && 'Промо-акция'}
                  {selectedEvent.type === 'limited' && 'Ограниченное предложение'}
                  {selectedEvent.type === 'vip' && 'VIP-событие'}
                </div>
                
                {activeTab === 'active' && (
                  <div className="event-timer-banner">
                    <i className="fas fa-clock"></i>
                    <span>Осталось: {getTimeRemaining(selectedEvent.endDate)}</span>
                  </div>
                )}
                
                {activeTab === 'upcoming' && (
                  <div className="event-timer-banner upcoming">
                    <i className="fas fa-hourglass-start"></i>
                    <span>Начало: {getTimeUntilStart(selectedEvent.startDate)}</span>
                  </div>
                )}
              </div>
              
              <div className="event-details-content">
                <div className="event-details-info">
                  <div className="event-description-full">
                    {selectedEvent.description}
                  </div>
                  
                  <div className="event-details-dates">
                    <div className="event-date">
                      <i className="fas fa-calendar-day"></i>
                      <div className="date-info">
                        <span className="date-label">Начало:</span>
                        <span className="date-value">{formatDate(selectedEvent.startDate)}</span>
                      </div>
                    </div>
                    <div className="event-date">
                      <i className="fas fa-calendar-times"></i>
                      <div className="date-info">
                        <span className="date-label">Окончание:</span>
                        <span className="date-value">{formatDate(selectedEvent.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEvent.requirements && (
                    <div className="event-requirements">
                      <h3>Требования для участия:</h3>
                      <ul>
                        {selectedEvent.requirements.level && (
                          <li className={currentCharacter.level >= selectedEvent.requirements.level ? 'met' : 'unmet'}>
                            <i className={`fas ${currentCharacter.level >= selectedEvent.requirements.level ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                            <span>Уровень персонажа: {selectedEvent.requirements.level}+</span>
                          </li>
                        )}
                        {selectedEvent.requirements.items && selectedEvent.requirements.items.map((item, index) => (
                          <li key={index} className={currentCharacter.inventory?.some(i => i._id === item._id) ? 'met' : 'unmet'}>
                            <i className={`fas ${currentCharacter.inventory?.some(i => i._id === item._id) ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                            <span>Предмет: {item.name}</span>
                          </li>
                        ))}
                        {selectedEvent.requirements.quests && selectedEvent.requirements.quests.map((quest, index) => (
                          <li key={index} className={currentCharacter.completedQuests?.includes(quest._id) ? 'met' : 'unmet'}>
                            <i className={`fas ${currentCharacter.completedQuests?.includes(quest._id) ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                            <span>Квест: {quest.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div className="event-location-info">
                      <h3>Локация события:</h3>
                      <div className="location-card">
                        <div className="location-image" style={{backgroundImage: `url('/assets/locations/${selectedEvent.location.image || 'default-location.jpg'}')`}}></div>
                        <div className="location-card-content">
                          <h4>{selectedEvent.location.name}</h4>
                          <p>{selectedEvent.location.shortDescription}</p>
                          <button 
                            className="btn btn-secondary btn-small"
                            onClick={() => navigate(`/map?highlight=${selectedEvent.location._id}`)}
                          >
                            <i className="fas fa-map-marked-alt"></i> На карте
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="event-details-sidebar">
                  <div className="event-rewards-card">
                    <h3>Награды за участие:</h3>
                    <div className="rewards-list">
                      {selectedEvent.rewards.xp > 0 && (
                        <div className="reward-item">
                          <div className="reward-icon xp">
                            <i className="fas fa-star"></i>
                          </div>
                          <div className="reward-info">
                            <span className="reward-name">Опыт</span>
                            <span className="reward-value">{selectedEvent.rewards.xp} XP</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.rewards.gold > 0 && (
                        <div className="reward-item">
                          <div className="reward-icon gold">
                            <i className="fas fa-coins"></i>
                          </div>
                          <div className="reward-info">
                            <span className="reward-name">Золото</span>
                            <span className="reward-value">{selectedEvent.rewards.gold} G</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.rewards.reputation > 0 && (
                        <div className="reward-item">
                          <div className="reward-icon reputation">
                            <i className="fas fa-handshake"></i>
                          </div>
                          <div className="reward-info">
                            <span className="reward-name">Репутация</span>
                            <span className="reward-value">+{selectedEvent.rewards.reputation}</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.rewards.items && selectedEvent.rewards.items.map((item, index) => (
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
                  
                  {selectedEvent.sponsors && selectedEvent.sponsors.length > 0 && (
                    <div className="event-sponsors-card">
                      <h3>Спонсоры события:</h3>
                      <div className="sponsors-list">
                        {selectedEvent.sponsors.map((sponsor, index) => (
                          <div key={index} className="sponsor-item">
                            <div className="sponsor-logo">
                              <img src={`/assets/sponsors/${sponsor.logo || 'default-sponsor.png'}`} alt={sponsor.name} />
                            </div>
                            <div className="sponsor-info">
                              <span className="sponsor-name">{sponsor.name}</span>
                              {sponsor.description && (
                                <span className="sponsor-description">{sponsor.description}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {participationResult && (
                    <div className="participation-result-card">
                      <h3>Результат участия:</h3>
                      <div className="participation-success">
                        <i className="fas fa-check-circle"></i>
                        <span>Вы успешно приняли участие в событии!</span>
                      </div>
                      
                      <div className="rewards-received">
                        <h4>Полученные награды:</h4>
                        <div className="rewards-list">
                          {participationResult.rewardsGranted.xp > 0 && (
                            <div className="reward-item">
                              <div className="reward-icon xp">
                                <i className="fas fa-star"></i>
                              </div>
                              <div className="reward-info">
                                <span className="reward-name">Опыт</span>
                                <span className="reward-value">+{participationResult.rewardsGranted.xp} XP</span>
                              </div>
                            </div>
                          )}
                          
                          {participationResult.rewardsGranted.gold > 0 && (
                            <div className="reward-item">
                              <div className="reward-icon gold">
                                <i className="fas fa-coins"></i>
                              </div>
                              <div className="reward-info">
                                <span className="reward-name">Золото</span>
                                <span className="reward-value">+{participationResult.rewardsGranted.gold} G</span>
                              </div>
                            </div>
                          )}
                          
                          {participationResult.itemsGranted && participationResult.itemsGranted.map((item, index) => (
                            <div key={index} className="reward-item">
                              <div className={`reward-icon item ${item.rarity}`}>
                                <img src={`/assets/items/${item.image}`} alt={item.name} />
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
                    </div>
                  )}
                </div>
              </div>
              
              <div className="event-details-actions">
                {activeTab === 'active' && !selectedEvent.participated && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleParticipate(selectedEvent._id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span> Обработка...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calendar-check"></i> Принять участие
                      </>
                    )}
                  </button>
                )}
                
                {activeTab === 'active' && selectedEvent.participated && !participationResult && (
                  <button className="btn btn-success" disabled>
                    <i className="fas fa-check"></i> Вы уже приняли участие
                  </button>
                )}
                
                {activeTab === 'upcoming' && (
                  <button className="btn btn-secondary" disabled>
                    <i className="fas fa-clock"></i> Событие еще не началось
                  </button>
                )}
                
                {activeTab === 'completed' && selectedEvent.participated && (
                  <button className="btn btn-gold">
                    <i className="fas fa-trophy"></i> Вы участвовали в этом событии
                  </button>
                )}
                
                {activeTab === 'completed' && !selectedEvent.participated && (
                  <button className="btn btn-secondary" disabled>
                    <i className="fas fa-times"></i> Вы пропустили это событие
                  </button>
                )}
                
                {selectedEvent.leaderboard && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/leaderboard?event=${selectedEvent._id}`)}
                  >
                    <i className="fas fa-list-ol"></i> Таблица лидеров
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventHub;
