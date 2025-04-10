import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login, error, clearErrors, user } = useAuth();
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
  
  const { email, password } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    if (!email || !password) {
      setErrorMessage('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }
    
    const success = await login({ email, password });
    
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
          <h1>Вход в игру</h1>
          <p>Погрузитесь в мир роскоши и изысканных вкусов</p>
        </div>
        
        {errorMessage && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {errorMessage}
          </div>
        )}
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
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
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-input"
              placeholder="Введите пароль"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary full-width"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Вход...
              </>
            ) : (
              'Войти'
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
            Еще нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
