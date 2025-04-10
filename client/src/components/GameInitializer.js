import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import axios from 'axios';

const GameInitializer = ({ children }) => {
  const { token, user, loadUser } = useAuth();
  const { loadCharacterData } = useGame();
  const [serverStatus, setServerStatus] = useState('checking');

  // Check server connection
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        await axios.get('/api/health');
        setServerStatus('connected');
      } catch (error) {
        console.error('Server connection error:', error);
        setServerStatus('disconnected');
      }
    };

    checkServerConnection();
  }, []);

  // Load user and character data when token is available
  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token, loadUser]);

  // Load character data when user is loaded
  useEffect(() => {
    if (user && serverStatus === 'connected') {
      loadCharacterData();
    }
  }, [user, serverStatus, loadCharacterData]);

  // Render loading state if checking server connection
  if (serverStatus === 'checking') {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Проверка соединения с сервером...</p>
      </div>
    );
  }

  // Render error if server is disconnected
  if (serverStatus === 'disconnected') {
    return (
      <div className="error-container">
        <h2>Ошибка соединения с сервером</h2>
        <p>Не удалось подключиться к серверу игры. Пожалуйста, проверьте подключение и попробуйте снова.</p>
        <button onClick={() => window.location.reload()}>Повторить попытку</button>
      </div>
    );
  }

  // Render children when everything is loaded
  return <>{children}</>;
};

export default GameInitializer;
