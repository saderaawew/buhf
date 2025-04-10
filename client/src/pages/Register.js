import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    telegramId: '',
    language: 'RU'
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, error, clearErrors, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    
    if (error) {
      setErrorMessage(error);
      clearErrors();
    }
    // eslint-disable-next-line
  }, [user, error]);
  
  const { username, email, password, password2, telegramId, language } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    if (!username || !email || !password) {
      setErrorMessage('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }
    
    if (password !== password2) {
      setErrorMessage('Пароли не совпадают');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Пароль должен содержать не менее 6 символов');
      setLoading(false);
      return;
    }
    
    const success = await register({ 
      username, 
      email, 
      password,
      telegramId: telegramId || undefined,
      language
    });
    
    if (!success) {
      setLoading(false);
    }
  };
  
  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };
  
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };
  
  return (
    <motion.div 
      className="auth-page"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="auth-container">
        <div className="auth-header">
          <h1>Регистрация</h1>
          <p>Создайте аккаунт для начала вашего приключения</p>
        </div>
        
        {errorMessage && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {errorMessage}
          </div>
        )}
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Имя пользователя*
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              className="form-input"
              placeholder="Введите имя пользователя"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className="form-input"
              placeholder="Введите email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="telegramId" className="form-label">
              Telegram ID (опционально)
            </label>
            <input
              type="text"
              id="telegramId"
              name="telegramId"
              value={telegramId}
              onChange={onChange}
              className="form-input"
              placeholder="Введите Telegram ID для таблицы лидеров"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Пароль*
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-input"
              placeholder="Введите пароль (минимум 6 символов)"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password2" className="form-label">
              Подтверждение пароля*
            </label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              className="form-input"
              placeholder="Повторите пароль"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="language" className="form-label">
              Предпочитаемый язык
            </label>
            <select
              id="language"
              name="language"
              value={language}
              onChange={onChange}
              className="form-input"
            >
              <option value="RU">Русский</option>
              <option value="EN">English</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary full-width"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Регистрация...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>или</span>
        </div>
        
        <div className="social-login">
          <button className="btn social-btn social-google">
            <i className="fab fa-google"></i> Google
          </button>
          <button className="btn social-btn social-telegram">
            <i className="fab fa-telegram-plane"></i> Telegram
          </button>
        </div>
        
        <div className="auth-footer">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
