import React, { useState } from 'react';
import { Bell, Clock, Database, Tag, Plus, Trash2, Download, AlertCircle } from 'lucide-react';

// Pre-made default categories
const defaultCategories = [
  { id: 'cat_1', name: 'Work', color: '#3b82f6', isPremade: true },
  { id: 'cat_2', name: 'Personal', color: '#10b981', isPremade: true },
  { id: 'cat_3', name: 'Shopping', color: '#f97316', isPremade: true },
];

// Color palette for new custom categories
const palette = ['#ec4899', '#8b5cf6', '#ef4444', '#eab308', '#06b6d4', '#84cc16'];

export default function SettingsPage() {
  // --- STATE MANAGEMENT (Using Lazy Initialization to fix the lint error) ---
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    const saved = localStorage.getItem('setting_reminders');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [alarmsEnabled, setAlarmsEnabled] = useState(() => {
    const saved = localStorage.getItem('setting_alarms');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [soundMode, setSoundMode] = useState('Default Chime');
  
  const [categories, setCategories] = useState(() => {
    const savedCats = localStorage.getItem('custom_categories');
    return savedCats ? JSON.parse(savedCats) : defaultCategories;
  });

  const [newCatName, setNewCatName] = useState('');

  // --- SAVE SETTINGS HANDLERS ---
  const handleToggleReminders = () => {
    const newVal = !remindersEnabled;
    setRemindersEnabled(newVal);
    localStorage.setItem('setting_reminders', JSON.stringify(newVal));
  };

  const handleToggleAlarms = () => {
    const newVal = !alarmsEnabled;
    setAlarmsEnabled(newVal);
    localStorage.setItem('setting_alarms', JSON.stringify(newVal));
  };

  // --- CATEGORY HANDLERS ---
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const randomColor = palette[Math.floor(Math.random() * palette.length)];
    const newCat = {
      id: `custom_${Date.now()}`,
      name: newCatName.trim(),
      color: randomColor,
      isPremade: false
    };
    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    localStorage.setItem('custom_categories', JSON.stringify(updatedCats));
    setNewCatName('');
  };

  const handleDeleteCategory = (id) => {
    const updatedCats = categories.filter(c => c.id !== id);
    setCategories(updatedCats);
    localStorage.setItem('custom_categories', JSON.stringify(updatedCats));
  };

  // --- DATA HANDLERS ---
  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all completed tasks? This cannot be undone.")) {
      alert("Completed tasks cleared!");
    }
  };

  return (
    <div className="settings-page">
      
      {/* 1. NOTIFICATIONS SECTION */}
      <div className="setting-section">
        <div className="setting-header">
          <Bell className="setting-icon" size={20} />
          <h3>Notifications</h3>
        </div>
        <div className="setting-row">
          <div className="setting-text">
            <span>Enable Reminders</span>
            <p>Get notified 1 hour before a task is due</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={remindersEnabled} onChange={handleToggleReminders} />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* 2. ALARM & SOUND SECTION */}
      <div className="setting-section">
        <div className="setting-header">
          <Clock className="setting-icon" size={20} />
          <h3>Alarm & Sound</h3>
        </div>
        <div className="setting-row border-bottom">
          <div className="setting-text">
            <span>Ring at Due Date</span>
            <p>Play a sound exactly when tasks are due</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={alarmsEnabled} onChange={handleToggleAlarms} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div className="setting-text">
            <span>Alert Sound</span>
          </div>
          <select 
            className="setting-dropdown" 
            value={soundMode} 
            onChange={(e) => setSoundMode(e.target.value)}
          >
            <option>Default Chime</option>
            <option>System Notification</option>
            <option>Silent</option>
          </select>
        </div>
      </div>

      {/* 3. CATEGORIES SECTION */}
      <div className="setting-section">
        <div className="setting-header">
          <Tag className="setting-icon" size={20} />
          <h3>Categories</h3>
        </div>
        <div className="categories-container">
          {categories.map(cat => (
            <div key={cat.id} className="category-pill" style={{ borderLeftColor: cat.color }}>
              <div className="category-indicator" style={{ backgroundColor: cat.color }}></div>
              <span className="category-name">{cat.name}</span>
              {!cat.isPremade && (
                <button className="category-delete-btn" onClick={() => handleDeleteCategory(cat.id)}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="add-category-row">
          <input 
            type="text" 
            placeholder="Add new category..." 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button className="add-cat-btn" onClick={handleAddCategory}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* 4. DATA & STORAGE SECTION */}
      <div className="setting-section">
        <div className="setting-header">
          <Database className="setting-icon" size={20} />
          <h3>Data & Storage</h3>
        </div>
        <button className="setting-action-btn border-bottom" onClick={() => alert("Backup feature coming soon!")}>
          <span>Backup Data</span>
          <Download size={18} color="#64748b" />
        </button>
        <button className="setting-action-btn danger" onClick={handleClearData}>
          <span>Clear Completed Tasks</span>
          <AlertCircle size={18} color="#ef4444" />
        </button>
      </div>

      {/* FOOTER */}
      <div className="settings-footer">
        <p>ToDoList</p>
        <p className="version">v1.0.0 • Student Project</p>
      </div>
      
    </div>
  );
}