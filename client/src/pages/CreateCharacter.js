import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import './CreateCharacter.css';

const CreateCharacter = () => {
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState({
    name: '',
    avatar: 'default-avatar.png',
    backstory: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { createCharacter } = useGame();
  const navigate = useNavigate();
  
  // Available character avatars
  const avatars = [
    'default-avatar.png',
    'avatar-1.png',
    'avatar-2.png',
    'avatar-3.png',
    'avatar-4.png',
    'avatar-5.png',
    'avatar-6.png',
    'avatar-7.png',
    'avatar-8.png'
  ];
  
  // Handle input change
  const handleChange = (e) => {
    setCharacter({
      ...character,
      [e.target.name]: e.target.value
    });
    setError(null);
  };
  
  // Handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setCharacter({
      ...character,
      avatar
    });
  };
  
  // Move to next step
  const nextStep = () => {
    if (step === 1 && !character.name.trim()) {
      setError('Имя персонажа обязательно');
      return;
    }
    
    setStep(step + 1);
  };
  
  // Move to previous step
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Create character
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!character.name.trim()) {
      setError('Имя персонажа обязательно');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await createCharacter(character);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Не удалось создать персонажа. Попробуйте еще раз.');
        setLoading(false);
      }
    } catch (err) {
      setError('Произошла ошибка при создании персонажа');
      setLoading(false);
    }
  };
  
  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      x: '100%'
    },
    in: {
      opacity: 1,
      x: 0
    },
    out: {
      opacity: 0,
      x: '-100%'
    }
  };
  
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };
  
  return (
    <div className="create-character-page">
      <div className="create-character-container">
        <div className="create-character-header">
          <h1>Создание персонажа</h1>
          <div className="steps-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Имя</p>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Внешность</p>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Завершение</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        <div className="create-character-content">
          {step === 1 && (
            <motion.div
              className="step-container"
              key="step1"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <h2>Как будут звать вашего персонажа?</h2>
              <p className="step-description">
                Выберите имя, которое соответствует атмосфере элитного мира кальянов и сигар.
              </p>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Имя персонажа
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Введите имя персонажа"
                  value={character.name}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>
              
              <div className="character-name-preview">
                <h3>{character.name || 'Ваш персонаж'}</h3>
                <p>Уровень 1 • Новичок</p>
              </div>
              
              <div className="step-buttons">
                <button
                  className="btn btn-primary"
                  onClick={nextStep}
                >
                  Далее <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              className="step-container"
              key="step2"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <h2>Выберите внешность персонажа</h2>
              <p className="step-description">
                Выберите аватар, который будет представлять вашего персонажа в игре.
              </p>
              
              <div className="avatars-grid">
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className={`avatar-option ${character.avatar === avatar ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <img src={`/assets/avatars/${avatar}`} alt={`Avatar ${index + 1}`} />
                    {character.avatar === avatar && (
                      <div className="avatar-selected">
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="step-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={prevStep}
                >
                  <i className="fas fa-arrow-left"></i> Назад
                </button>
                <button
                  className="btn btn-primary"
                  onClick={nextStep}
                >
                  Далее <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div
              className="step-container"
              key="step3"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <h2>Завершите создание персонажа</h2>
              <p className="step-description">
                Добавьте краткое описание истории вашего персонажа (опционально).
              </p>
              
              <div className="form-group">
                <label htmlFor="backstory" className="form-label">
                  История персонажа (опционально)
                </label>
                <textarea
                  id="backstory"
                  name="backstory"
                  className="form-input"
                  placeholder="Расскажите немного о вашем персонаже..."
                  value={character.backstory}
                  onChange={handleChange}
                  rows={4}
                ></textarea>
              </div>
              
              <div className="character-summary">
                <div className="summary-avatar">
                  <img src={`/assets/avatars/${character.avatar}`} alt="Character Avatar" />
                </div>
                <div className="summary-details">
                  <h3>{character.name}</h3>
                  <p>Уровень 1 • Новичок</p>
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <span className="stat-label">Опыт</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Очки</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Жетоны</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="step-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={prevStep}
                >
                  <i className="fas fa-arrow-left"></i> Назад
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Создание...
                    </>
                  ) : (
                    'Создать персонажа'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;
