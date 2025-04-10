import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Landing.css';

const Landing = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="landing-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="landing-overlay"></div>
      
      <div className="landing-content">
        <motion.div 
          className="landing-header"
          variants={itemVariants}
        >
          <h1>Hookah & Cigar RPG</h1>
          <p className="tagline">Погрузитесь в элитный мир кальянов и сигар</p>
        </motion.div>
        
        <motion.div 
          className="landing-description"
          variants={itemVariants}
        >
          <p>
            Добро пожаловать в эксклюзивный мир роскоши и изысканных вкусов.
            Создайте своего персонажа, развивайте навыки, исследуйте локации и
            станьте настоящим экспертом в мире кальянов и сигар.
          </p>
        </motion.div>
        
        <motion.div 
          className="feature-section"
          variants={itemVariants}
        >
          <div className="feature">
            <i className="feature-icon fas fa-user-alt"></i>
            <h3>Персонаж</h3>
            <p>Кастомизация и развитие уникального персонажа</p>
          </div>
          
          <div className="feature">
            <i className="feature-icon fas fa-map-marked-alt"></i>
            <h3>Карта</h3>
            <p>Исследуйте стильные локации с уникальными квестами</p>
          </div>
          
          <div className="feature">
            <i className="feature-icon fas fa-tasks"></i>
            <h3>Квесты</h3>
            <p>Выполняйте задания и получайте эксклюзивные награды</p>
          </div>
          
          <div className="feature">
            <i className="feature-icon fas fa-trophy"></i>
            <h3>События</h3>
            <p>Участвуйте в сезонных мероприятиях и займите место в топе</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="cta-buttons"
          variants={itemVariants}
        >
          <Link to="/register" className="btn btn-primary">
            Регистрация
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Вход
          </Link>
        </motion.div>
        
        <motion.div 
          className="landing-footer"
          variants={itemVariants}
        >
          <p>
            <i className="fas fa-info-circle"></i> Игра предназначена для аудитории 18+
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Landing;
