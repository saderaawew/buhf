import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { currentCharacter } = useGame();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Navbar animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.nav 
      className="navbar"
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Hookah & Cigar RPG
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          {user ? (
            <>
              {currentCharacter && (
                <li className="character-stats">
                  <div className="character-avatar">
                    <img 
                      src={currentCharacter.avatar || '/assets/default-avatar.png'} 
                      alt={currentCharacter.name} 
                    />
                  </div>
                  <div className="character-info">
                    <span className="character-name">{currentCharacter.name}</span>
                    <div className="character-level">
                      <span>Level {currentCharacter.level}</span>
                      <div className="experience-bar">
                        <div 
                          className="experience-progress"
                          style={{ 
                            width: `${(currentCharacter.experience % 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </li>
              )}
              
              <li className="nav-item">
                <Link to="/dashboard" className="nav-links">
                  Dashboard
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/map" className="nav-links">
                  Map
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/inventory" className="nav-links">
                  Inventory
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/events" className="nav-links">
                  Events
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/shop" className="nav-links">
                  Shop
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/leaderboard" className="nav-links">
                  Leaderboard
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/settings" className="nav-links">
                  Settings
                </Link>
              </li>
              
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-links logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-links">
                  Login
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/register" className="nav-links">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
        
        {user && currentCharacter && (
          <div className="currency-display">
            <div className="currency-item">
              <i className="fas fa-coins"></i>
              <span>{currentCharacter.points || 0}</span>
            </div>
            <div className="currency-item">
              <i className="fas fa-gem"></i>
              <span>{currentCharacter.tokens || 0}</span>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
