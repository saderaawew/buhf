import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { itemAPI } from '../services/api';
import './Shop.css';

const Shop = () => {
  const { currentCharacter, gameProgress, purchaseItem } = useGame();
  const [loading, setLoading] = useState(true);
  const [shopItems, setShopItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [purchaseResult, setPurchaseResult] = useState(null);
  
  // Load shop items from API
  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        setLoading(true);
        // Get items available in the shop
        const response = await itemAPI.getAll();
        
        // Transform API response to match our UI needs
        const items = response.data.map(item => ({
          _id: item._id,
          name: item.name,
          description: item.description,
          type: item.type,
          price: item.price || 100, // Default price if not specified
          image: item.imageUrl || `${item.type}-default.png`,
          rarity: item.rarity || 'common',
          stats: item.stats || {},
          brand: item.brand || 'Неизвестно',
          origin: item.origin || 'Неизвестно',
          limited: item.isLimited || false,
          stock: item.stock || 10
        }));
        
        setShopItems(items);
      } catch (error) {
        console.error('Error fetching shop items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopItems();
  }, []);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return shopItems.filter(item => {
      // Filter by search query
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
      
      // Filter by limited status if required
      const matchesLimited = activeCategory !== 'limited' || item.limited;
      
      return matchesSearch && matchesCategory && matchesLimited;
    }).sort((a, b) => {
      // Sort items
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rarity':
          return getRarityValue(b.rarity) - getRarityValue(a.rarity);
        default:
          return 0;
      }
    });
  }, [shopItems, searchQuery, activeCategory, sortBy]);

  // Function to get numeric value for rarity (for sorting)
  const getRarityValue = (rarity) => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 2;
      case 'rare': return 3;
      case 'epic': return 4;
      case 'legendary': return 5;
      default: return 0;
    }
  };

  // Handle item selection
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setPurchaseResult(null);
  };

  // Close item details
  const handleCloseDetails = () => {
    setSelectedItem(null);
    setPurchaseResult(null);
  };

  // Purchase item
  const handlePurchaseItem = async (itemId) => {
    setLoading(true);
    
    try {
      const itemToPurchase = shopItems.find(item => item._id === itemId);
      
      // Call the purchaseItem method from GameContext
      const result = await purchaseItem(itemId, itemToPurchase.price);
      
      if (result.success) {
        // Update shop items (decrease stock)
        setShopItems(prevItems => {
          return prevItems.map(item => {
            if (item._id === itemId) {
              return {
                ...item,
                stock: Math.max(0, item.stock - 1)
              };
            }
            return item;
          });
        });
        
        setPurchaseResult({
          success: true,
          message: `Вы успешно приобрели ${itemToPurchase.name}!`,
          item: itemToPurchase
        });
      } else {
        setPurchaseResult({
          success: false,
          message: result.message || 'Произошла ошибка при покупке предмета'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error purchasing item:', error);
      setPurchaseResult({
        success: false,
        message: 'Произошла ошибка при покупке предмета'
      });
      setLoading(false);
    }
  };

  // Get display name for rarity
  const getRarityDisplayName = (rarity) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'uncommon': return 'Необычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      case 'legendary': return 'Легендарный';
      default: return 'Неизвестно';
    }
  };

  // Get class name for rarity
  const getRarityClassName = (rarity) => {
    return rarity || 'common';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  if (loading && shopItems.length === 0) {
    return (
      <div className="shop-loading">
        <div className="spinner-large"></div>
        <p>Загрузка товаров...</p>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        <div className="shop-header">
          <h1>Магазин</h1>
          <div className="shop-player-stats">
            <div className="player-gold">
              <i className="fas fa-coins"></i>
              <span>{currentCharacter?.gold || 0} G</span>
            </div>
          </div>
        </div>

        <div className="shop-controls">
          <div className="shop-search">
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="shop-filters">
            <div className="shop-categories">
              <button
                className={`category-button ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                <i className="fas fa-store"></i> Все
              </button>
              <button
                className={`category-button ${activeCategory === 'cigar' ? 'active' : ''}`}
                onClick={() => setActiveCategory('cigar')}
              >
                <i className="fas fa-smoking"></i> Сигары
              </button>
              <button
                className={`category-button ${activeCategory === 'hookah' ? 'active' : ''}`}
                onClick={() => setActiveCategory('hookah')}
              >
                <i className="fas fa-wind"></i> Кальяны
              </button>
              <button
                className={`category-button ${activeCategory === 'accessory' ? 'active' : ''}`}
                onClick={() => setActiveCategory('accessory')}
              >
                <i className="fas fa-cogs"></i> Аксессуары
              </button>
              <button
                className={`category-button ${activeCategory === 'limited' ? 'active' : ''}`}
                onClick={() => setActiveCategory('limited')}
              >
                <i className="fas fa-gem"></i> Лимитированные
              </button>
            </div>

            <div className="shop-sort">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">По названию</option>
                <option value="price-low">Цена (по возрастанию)</option>
                <option value="price-high">Цена (по убыванию)</option>
                <option value="rarity">По редкости</option>
              </select>
              <i className="fas fa-sort"></i>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="shop-empty">
            <i className="fas fa-search-minus"></i>
            <p>Товаров не найдено</p>
            <button 
              className="reset-button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <motion.div 
            className="shop-items-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredItems.map(item => (
              <motion.div 
                key={item._id} 
                className={`shop-item ${getRarityClassName(item.rarity)}`}
                onClick={() => handleSelectItem(item)}
                variants={itemVariants}
              >
                <div className="shop-item-image">
                  <img src={`/images/items/${item.image}`} alt={item.name} />
                  {item.limited && <span className="limited-badge">Лимитед</span>}
                </div>
                <div className="shop-item-info">
                  <h3>{item.name}</h3>
                  <div className="shop-item-price">
                    <i className="fas fa-coins"></i>
                    <span>{item.price} G</span>
                  </div>
                  <div className="shop-item-rarity">
                    {getRarityDisplayName(item.rarity)}
                  </div>
                  <div className="shop-item-type">
                    {item.type === 'cigar' && <i className="fas fa-smoking"></i>}
                    {item.type === 'hookah' && <i className="fas fa-wind"></i>}
                    {item.type === 'accessory' && <i className="fas fa-cogs"></i>}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            className="item-details-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="item-details-container"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                className="close-button"
                onClick={handleCloseDetails}
              >
                <i className="fas fa-times"></i>
              </button>
              
              <div className={`item-details ${getRarityClassName(selectedItem.rarity)}`}>
                <div className="item-details-header">
                  <h2>{selectedItem.name}</h2>
                  <div className="item-details-price">
                    <i className="fas fa-coins"></i>
                    <span>{selectedItem.price} G</span>
                  </div>
                </div>
                
                <div className="item-details-content">
                  <div className="item-details-image">
                    <img 
                      src={`/images/items/${selectedItem.image}`} 
                      alt={selectedItem.name} 
                    />
                    {selectedItem.limited && (
                      <span className="limited-badge-large">Лимитированный предмет</span>
                    )}
                  </div>
                  
                  <div className="item-details-info">
                    <div className="item-info-row rarity">
                      <span className="info-label">Редкость:</span>
                      <span className={`info-value ${getRarityClassName(selectedItem.rarity)}`}>
                        {getRarityDisplayName(selectedItem.rarity)}
                      </span>
                    </div>
                    
                    <div className="item-info-row">
                      <span className="info-label">Тип:</span>
                      <span className="info-value">
                        {selectedItem.type === 'cigar' && <><i className="fas fa-smoking"></i> Сигара</>}
                        {selectedItem.type === 'hookah' && <><i className="fas fa-wind"></i> Кальян</>}
                        {selectedItem.type === 'accessory' && <><i className="fas fa-cogs"></i> Аксессуар</>}
                      </span>
                    </div>
                    
                    <div className="item-info-row">
                      <span className="info-label">Бренд:</span>
                      <span className="info-value">{selectedItem.brand}</span>
                    </div>
                    
                    <div className="item-info-row">
                      <span className="info-label">Происхождение:</span>
                      <span className="info-value">{selectedItem.origin}</span>
                    </div>
                    
                    <div className="item-info-row">
                      <span className="info-label">В наличии:</span>
                      <span className={`info-value ${selectedItem.stock < 3 ? 'low-stock' : ''}`}>
                        {selectedItem.stock} шт.
                      </span>
                    </div>
                    
                    {Object.keys(selectedItem.stats).length > 0 && (
                      <div className="item-stats">
                        <h4>Характеристики</h4>
                        <div className="stats-grid">
                          {Object.entries(selectedItem.stats).map(([stat, value]) => (
                            <div key={stat} className="stat-row">
                              <span className="stat-name">
                                {stat === 'prestige' && <><i className="fas fa-crown"></i> Престиж</>}
                                {stat === 'charisma' && <><i className="fas fa-comment"></i> Харизма</>}
                                {stat === 'luck' && <><i className="fas fa-dice"></i> Удача</>}
                                {stat === 'satisfaction' && <><i className="fas fa-smile"></i> Удовлетворение</>}
                              </span>
                              <span className="stat-value">+{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="item-description">
                      <p>{selectedItem.description}</p>
                    </div>
                  </div>
                </div>
                
                {purchaseResult && (
                  <div className={`purchase-result ${purchaseResult.success ? 'success' : 'error'}`}>
                    <i className={`fas ${purchaseResult.success ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    <p>{purchaseResult.message}</p>
                  </div>
                )}
                
                <div className="item-actions">
                  <button 
                    className="buy-button"
                    onClick={() => handlePurchaseItem(selectedItem._id)}
                    disabled={loading || selectedItem.stock < 1 || (currentCharacter?.gold || 0) < selectedItem.price}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-small"></div>
                        Обработка...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart"></i>
                        Купить за {selectedItem.price} G
                      </>
                    )}
                  </button>
                  
                  {(currentCharacter?.gold || 0) < selectedItem.price && (
                    <div className="insufficient-funds">
                      <i className="fas fa-coins"></i>
                      <span>Недостаточно золота</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
