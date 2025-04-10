import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import './GameMap.css';

const GameMap = () => {
  const { currentCharacter, gameProgress, visitLocation } = useGame();
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameProgress.locations && gameProgress.locations.length > 0) {
      setLoading(false);
    }
  }, [gameProgress.locations]);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleVisitLocation = async (locationId) => {
    setLoading(true);
    const result = await visitLocation(locationId);
    
    if (result.success) {
      navigate(`/location/${locationId}`);
    } else {
      setLoading(false);
    }
  };

  const closeLocationDetails = () => {
    setSelectedLocation(null);
  };

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

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner-large"></div>
        <p>Загрузка карты...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="game-map"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="map-header">
        <h1>Карта города</h1>
        <p>Исследуйте мир роскоши и изысканных вкусов</p>
      </div>

      <div className="map-container">
        <div className="map-background">
          <div className="map-locations">
            {gameProgress.locations && gameProgress.locations.map((location, index) => (
              <motion.div
                key={location._id}
                className={`map-location ${location.type} ${location.isAvailable ? 'available' : 'locked'}`}
                style={{
                  left: `${location.coordinates.x}%`,
                  top: `${location.coordinates.y}%`
                }}
                variants={itemVariants}
                onClick={() => handleLocationClick(location)}
                whileHover={{ scale: 1.1 }}
              >
                <div className="location-marker">
                  {location.type === 'lounge' && <i className="fas fa-couch"></i>}
                  {location.type === 'store' && <i className="fas fa-store"></i>}
                  {location.type === 'event_venue' && <i className="fas fa-calendar-check"></i>}
                  {location.type === 'quest_area' && <i className="fas fa-scroll"></i>}
                  {location.type === 'special' && <i className="fas fa-star"></i>}
                  
                  {!location.isAvailable && <div className="locked-overlay"><i className="fas fa-lock"></i></div>}
                </div>
                <span className="location-name">{location.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {selectedLocation && (
          <motion.div
            className="location-details"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="location-details-header">
              <h2>{selectedLocation.name}</h2>
              <button className="close-btn" onClick={closeLocationDetails}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="location-details-content">
              <div 
                className="location-image" 
                style={{ backgroundImage: `url('/assets/locations/${selectedLocation.image}')` }}
              ></div>
              
              <div className="location-info">
                <p className="location-description">{selectedLocation.description}</p>
                
                <div className="location-type-badge">
                  {selectedLocation.type === 'lounge' && 'Лаундж'}
                  {selectedLocation.type === 'store' && 'Магазин'}
                  {selectedLocation.type === 'event_venue' && 'Событие'}
                  {selectedLocation.type === 'quest_area' && 'Квестовая зона'}
                  {selectedLocation.type === 'special' && 'Особое место'}
                </div>
                
                {!selectedLocation.isAvailable ? (
                  <div className="location-locked-info">
                    <i className="fas fa-lock"></i>
                    <div className="lock-requirements">
                      <h3>Требования для разблокировки:</h3>
                      
                      {selectedLocation.unlockRequirements?.level && (
                        <p>
                          <i className="fas fa-arrow-up"></i> Уровень: {selectedLocation.unlockRequirements.level}
                          {currentCharacter.level >= selectedLocation.unlockRequirements.level && 
                            <span className="requirement-met"><i className="fas fa-check"></i></span>}
                        </p>
                      )}
                      
                      {selectedLocation.unlockRequirements?.quests && selectedLocation.unlockRequirements.quests.length > 0 && (
                        <p>
                          <i className="fas fa-scroll"></i> Квесты: необходимо выполнить определенные квесты
                        </p>
                      )}
                      
                      {selectedLocation.unlockRequirements?.items && selectedLocation.unlockRequirements.items.length > 0 && (
                        <p>
                          <i className="fas fa-key"></i> Предметы: требуются определенные предметы
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="location-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleVisitLocation(selectedLocation._id)}
                    >
                      <i className="fas fa-walking"></i> Посетить локацию
                    </button>
                    
                    {selectedLocation.availableQuests && selectedLocation.availableQuests.length > 0 && (
                      <div className="location-quests">
                        <h3><i className="fas fa-scroll"></i> Доступные квесты:</h3>
                        <ul>
                          {selectedLocation.availableQuests.map((quest, index) => (
                            <li key={index}>
                              <Link to={`/quest/${quest._id}`}>
                                {quest.title} <i className="fas fa-arrow-right"></i>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-icon lounge">
            <i className="fas fa-couch"></i>
          </div>
          <span>Лаундж</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-icon store">
            <i className="fas fa-store"></i>
          </div>
          <span>Магазин</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-icon event_venue">
            <i className="fas fa-calendar-check"></i>
          </div>
          <span>Событие</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-icon quest_area">
            <i className="fas fa-scroll"></i>
          </div>
          <span>Квесты</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-icon special">
            <i className="fas fa-star"></i>
          </div>
          <span>Особое место</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-icon locked">
            <i className="fas fa-lock"></i>
          </div>
          <span>Заблокировано</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GameMap;
