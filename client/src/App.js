import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import GameInitializer from './components/GameInitializer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CharacterSelect from './pages/CharacterSelect';
import CreateCharacter from './pages/CreateCharacter';
import GameMap from './pages/GameMap';
import Location from './pages/Location';
import Inventory from './pages/Inventory';
import Quest from './pages/Quest';
import Quests from './pages/Quests';
import Shop from './pages/Shop';
import EventHub from './pages/EventHub';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';

// Components
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/routing/PrivateRoute';

function App() {
  const { loading, user, checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>Hookah & Cigar RPG</h1>
          <div className="loading-spinner"></div>
          <p>Loading the luxury experience...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <GameInitializer>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
            
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/characters" 
              element={
                <PrivateRoute>
                  <CharacterSelect />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/characters/create" 
              element={
                <PrivateRoute>
                  <CreateCharacter />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/map" 
              element={
                <PrivateRoute>
                  <GameMap />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/location/:id" 
              element={
                <PrivateRoute>
                  <Location />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/inventory" 
              element={
                <PrivateRoute>
                  <Inventory />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/quest/:id" 
              element={
                <PrivateRoute>
                  <Quest />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/shop" 
              element={
                <PrivateRoute>
                  <Shop />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/events" 
              element={
                <PrivateRoute>
                  <EventHub />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/leaderboard" 
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } 
            />
            </Routes>
          </AnimatePresence>
        </GameInitializer>
      </div>
    </Router>
  );
}

export default App;
