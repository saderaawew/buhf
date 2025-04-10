import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import './Inventory.css';

const Inventory = () => {
  const { currentCharacter, useItem, equipItem, unequipItem } = useGame();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortOption, setSortOption] = useState('name');
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize inventory from character data
    if (currentCharacter && currentCharacter.inventory) {
      setInventory(currentCharacter.inventory);
      setEquipped(currentCharacter.equippedItems || []);
      setLoading(false);
    }
  }, [currentCharacter]);

  // Filter items by type
  const filteredItems = React.useMemo(() => {
    let filtered = [...inventory];

    // Filter by item type
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.type === activeTab);
    }

    // Sort items
    switch (sortOption) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rarity':
        filtered.sort((a, b) => b.rarity - a.rarity);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.acquiredAt) - new Date(a.acquiredAt));
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [inventory, activeTab, sortOption]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleUseItem = async (itemId) => {
    try {
      const result = await useItem(itemId);
      if (result.success) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error using item:', error);
    }
  };

  const handleEquipItem = async (itemId) => {
    try {
      const result = await equipItem(itemId);
      if (result.success) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const handleUnequipItem = async (itemId) => {
    try {
      const result = await unequipItem(itemId);
      if (result.success) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  const isItemEquipped = (itemId) => {
    return equipped.some(item => item._id === itemId);
  };

  // Get rarity color class
  const getRarityClass = (rarity) => {
    switch (rarity) {
      case 1: return 'common';
      case 2: return 'uncommon';
      case 3: return 'rare';
      case 4: return 'epic';
      case 5: return 'legendary';
      default: return 'common';
    }
  };

  // Get rarity display name
  const getRarityName = (rarity) => {
    switch (rarity) {
      case 1: return 'Обычный';
      case 2: return 'Необычный';
      case 3: return 'Редкий';
      case 4: return 'Эпический';
      case 5: return 'Легендарный';
      default: return 'Обычный';
    }
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

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="spinner-large"></div>
        <p>Загрузка инвентаря...</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="inventory-container">
        <div className="inventory-header">
          <h1>Инвентарь</h1>
          <div className="inventory-stats">
            <div className="stat">
              <i className="fas fa-archive"></i>
              <span>{inventory.length} / {currentCharacter.inventoryCapacity}</span>
            </div>
          </div>
        </div>

        <div className="inventory-content">
          <div className="inventory-sidebar">
            <div className="inventory-tabs">
              <button 
                className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveTab('all')}
              >
                <i className="fas fa-archive"></i> Все
              </button>
              <button 
                className={`tab-button ${activeTab === 'cigar' ? 'active' : ''}`} 
                onClick={() => setActiveTab('cigar')}
              >
                <i className="fas fa-smoking"></i> Сигары
              </button>
              <button 
                className={`tab-button ${activeTab === 'hookah' ? 'active' : ''}`} 
                onClick={() => setActiveTab('hookah')}
              >
                <i className="fas fa-wind"></i> Кальяны
              </button>
              <button 
                className={`tab-button ${activeTab === 'accessory' ? 'active' : ''}`} 
                onClick={() => setActiveTab('accessory')}
              >
                <i className="fas fa-cogs"></i> Аксессуары
              </button>
              <button 
                className={`tab-button ${activeTab === 'collectible' ? 'active' : ''}`} 
                onClick={() => setActiveTab('collectible')}
              >
                <i className="fas fa-gem"></i> Коллекционные
              </button>
              <button 
                className={`tab-button ${activeTab === 'consumable' ? 'active' : ''}`} 
                onClick={() => setActiveTab('consumable')}
              >
                <i className="fas fa-flask"></i> Расходные
              </button>
            </div>

            <div className="inventory-sort">
              <label>Сортировка:</label>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
              >
                <option value="name">По имени</option>
                <option value="rarity">По редкости</option>
                <option value="newest">Новые сначала</option>
              </select>
            </div>

            <div className="character-equipment">
              <h3>Экипировка</h3>
              <div className="equipment-slots">
                <div className="equipment-slot cigar-slot">
                  {equipped.find(item => item.type === 'cigar') ? (
                    <div 
                      className={`equipped-item ${getRarityClass(equipped.find(item => item.type === 'cigar').rarity)}`}
                      onClick={() => handleSelectItem(equipped.find(item => item.type === 'cigar'))}
                    >
                      <img src={`/assets/items/${equipped.find(item => item.type === 'cigar').image}`} alt="Cigar" />
                    </div>
                  ) : (
                    <div className="empty-slot">
                      <i className="fas fa-smoking"></i>
                    </div>
                  )}
                  <span>Сигара</span>
                </div>
                
                <div className="equipment-slot hookah-slot">
                  {equipped.find(item => item.type === 'hookah') ? (
                    <div 
                      className={`equipped-item ${getRarityClass(equipped.find(item => item.type === 'hookah').rarity)}`}
                      onClick={() => handleSelectItem(equipped.find(item => item.type === 'hookah'))}
                    >
                      <img src={`/assets/items/${equipped.find(item => item.type === 'hookah').image}`} alt="Hookah" />
                    </div>
                  ) : (
                    <div className="empty-slot">
                      <i className="fas fa-wind"></i>
                    </div>
                  )}
                  <span>Кальян</span>
                </div>
                
                <div className="equipment-slot accessory-slot">
                  {equipped.find(item => item.type === 'accessory') ? (
                    <div 
                      className={`equipped-item ${getRarityClass(equipped.find(item => item.type === 'accessory').rarity)}`}
                      onClick={() => handleSelectItem(equipped.find(item => item.type === 'accessory'))}
                    >
                      <img src={`/assets/items/${equipped.find(item => item.type === 'accessory').image}`} alt="Accessory" />
                    </div>
                  ) : (
                    <div className="empty-slot">
                      <i className="fas fa-cogs"></i>
                    </div>
                  )}
                  <span>Аксессуар</span>
                </div>
              </div>
            </div>
          </div>

          <div className="inventory-items-container">
            {filteredItems.length === 0 ? (
              <div className="empty-inventory">
                <i className="fas fa-box-open"></i>
                <p>Нет предметов в этой категории</p>
              </div>
            ) : (
              <motion.div 
                className="inventory-items-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredItems.map(item => (
                  <motion.div
                    key={item._id}
                    className={`inventory-item ${getRarityClass(item.rarity)} ${isItemEquipped(item._id) ? 'equipped' : ''}`}
                    onClick={() => handleSelectItem(item)}
                    variants={itemVariants}
                  >
                    <div className="item-image">
                      <img src={`/assets/items/${item.image}`} alt={item.name} />
                      {isItemEquipped(item._id) && (
                        <div className="equipped-badge">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                    <div className="item-name">
                      {item.name}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            className="item-details-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDetails}
          >
            <motion.div 
              className="item-details"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="item-details-header">
                <h2 className={getRarityClass(selectedItem.rarity)}>{selectedItem.name}</h2>
                <button className="close-btn" onClick={handleCloseDetails}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="item-details-content">
                <div className="item-details-image">
                  <img src={`/assets/items/${selectedItem.image}`} alt={selectedItem.name} />
                  <div className={`item-rarity ${getRarityClass(selectedItem.rarity)}`}>
                    {getRarityName(selectedItem.rarity)}
                  </div>
                </div>

                <div className="item-details-info">
                  <p className="item-description">{selectedItem.description}</p>
                  
                  <div className="item-attributes">
                    <div className="item-attribute">
                      <span>Тип:</span>
                      <span>
                        {selectedItem.type === 'cigar' && 'Сигара'}
                        {selectedItem.type === 'hookah' && 'Кальян'}
                        {selectedItem.type === 'accessory' && 'Аксессуар'}
                        {selectedItem.type === 'collectible' && 'Коллекционный'}
                        {selectedItem.type === 'consumable' && 'Расходный'}
                      </span>
                    </div>
                    
                    {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                      <>
                        <div className="item-attribute">
                          <span>Характеристики:</span>
                        </div>
                        {selectedItem.stats.prestige > 0 && (
                          <div className="item-attribute stat-boost">
                            <span><i className="fas fa-star"></i> Престиж</span>
                            <span>+{selectedItem.stats.prestige}</span>
                          </div>
                        )}
                        {selectedItem.stats.charisma > 0 && (
                          <div className="item-attribute stat-boost">
                            <span><i className="fas fa-comment"></i> Харизма</span>
                            <span>+{selectedItem.stats.charisma}</span>
                          </div>
                        )}
                        {selectedItem.stats.luck > 0 && (
                          <div className="item-attribute stat-boost">
                            <span><i className="fas fa-clover"></i> Удача</span>
                            <span>+{selectedItem.stats.luck}</span>
                          </div>
                        )}
                        {selectedItem.stats.knowledge > 0 && (
                          <div className="item-attribute stat-boost">
                            <span><i className="fas fa-book"></i> Знания</span>
                            <span>+{selectedItem.stats.knowledge}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {selectedItem.effects && selectedItem.effects.length > 0 && (
                      <div className="item-attribute">
                        <span>Эффекты:</span>
                        <ul className="effects-list">
                          {selectedItem.effects.map((effect, index) => (
                            <li key={index}>{effect}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedItem.source && (
                      <div className="item-attribute">
                        <span>Источник:</span>
                        <span>{selectedItem.source}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="item-details-actions">
                {selectedItem.type === 'consumable' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleUseItem(selectedItem._id)}
                  >
                    <i className="fas fa-hand-holding"></i> Использовать
                  </button>
                )}
                
                {(selectedItem.type === 'cigar' || selectedItem.type === 'hookah' || selectedItem.type === 'accessory') && (
                  isItemEquipped(selectedItem._id) ? (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleUnequipItem(selectedItem._id)}
                    >
                      <i className="fas fa-toggle-off"></i> Снять
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleEquipItem(selectedItem._id)}
                    >
                      <i className="fas fa-toggle-on"></i> Экипировать
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
