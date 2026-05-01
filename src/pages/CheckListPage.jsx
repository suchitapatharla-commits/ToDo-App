import React, { useState, useEffect } from 'react';
import { ShoppingCart, BookOpen, Film, Plus, X, Circle, CheckCircle2, ListTodo, Briefcase, Heart, Coffee, Trash2 } from 'lucide-react';

// A collection of beautiful pastel themes for randomly assigning to new lists
const themes = [
  { bgColor: '#ecfdf5', badgeColor: '#10b981', icon: 'ShoppingCart' }, // Mint / Green
  { bgColor: '#fff7ed', badgeColor: '#f97316', icon: 'BookOpen' },     // Peach / Orange
  { bgColor: '#fdf2f8', badgeColor: '#ec4899', icon: 'Film' },         // Pink / Pink
  { bgColor: '#eff6ff', badgeColor: '#3b82f6', icon: 'Briefcase' },    // Blue / Blue
  { bgColor: '#fef2f2', badgeColor: '#ef4444', icon: 'Heart' },        // Red / Red
  { bgColor: '#fefce8', badgeColor: '#eab308', icon: 'Coffee' },       // Yellow / Yellow
  { bgColor: '#f8fafc', badgeColor: '#64748b', icon: 'ListTodo' }      // Slate / Grey
];

export default function ChecklistPage() {
  // Start with an empty array or load from localStorage so they don't disappear on refresh
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('local_checklists');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newItems, setNewItems] = useState({});
  const [newListTitle, setNewListTitle] = useState('');

  // Save to localStorage whenever lists change
  useEffect(() => {
    localStorage.setItem('local_checklists', JSON.stringify(lists));
  }, [lists]);

  // --- CREATE & DELETE WHOLE LISTS ---
  const handleCreateList = () => {
    if (!newListTitle.trim()) return;
    
    // Pick a random aesthetic theme
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    
    const newList = {
      id: Date.now(),
      title: newListTitle,
      items: [],
      ...randomTheme
    };
    
    setLists([newList, ...lists]); // Add to the top
    setNewListTitle(''); // Clear input
  };

  const handleDeleteList = (listId) => {
    if (window.confirm("Delete this entire checklist?")) {
      setLists(lists.filter(l => l.id !== listId));
    }
  };

  // --- ITEM MANAGEMENT ---
  const toggleItem = (listId, itemId) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        return { ...list, items: list.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item) };
      }
      return list;
    }));
  };

  const deleteItem = (listId, itemId) => {
    setLists(lists.map(list => {
      if (list.id === listId) return { ...list, items: list.items.filter(item => item.id !== itemId) };
      return list;
    }));
  };

  const handleAddItem = (listId) => {
    const text = newItems[listId];
    if (!text || !text.trim()) return;

    setLists(lists.map(list => {
      if (list.id === listId) return { ...list, items: [...list.items, { id: Date.now(), text, completed: false }] };
      return list;
    }));
    setNewItems({ ...newItems, [listId]: '' }); 
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'ShoppingCart': return <ShoppingCart size={20} />;
      case 'BookOpen': return <BookOpen size={20} />;
      case 'Film': return <Film size={20} />;
      case 'Briefcase': return <Briefcase size={20} />;
      case 'Heart': return <Heart size={20} />;
      case 'Coffee': return <Coffee size={20} />;
      default: return <ListTodo size={20} />;
    }
  };

  return (
    <div className="checklist-page">
      
      {/* Create New Checklist Bar */}
      <div className="create-list-container">
        <input 
          type="text" 
          className="create-list-input" 
          placeholder="New checklist name..." 
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
        />
        <button className="create-list-btn" onClick={handleCreateList}>Create</button>
      </div>

      {lists.length === 0 && (
        <div style={{textAlign: 'center', marginTop: '40px', color: '#94a3b8'}}>
          <ListTodo size={48} color="#cbd5e1" style={{marginBottom: '10px'}} />
          <p>No checklists yet.<br/>Create one above!</p>
        </div>
      )}

      {/* Render Existing Lists */}
      {lists.map(list => (
        <div key={list.id} className="checklist-card" style={{ backgroundColor: list.bgColor }}>
          
          <div className="checklist-badge" style={{ backgroundColor: list.badgeColor }}>
            {getIcon(list.icon)}
          </div>

          <div className="checklist-title-row">
            <h3 className="checklist-title">{list.title}</h3>
            <button className="delete-list-btn" onClick={() => handleDeleteList(list.id)}>
              <Trash2 size={18} />
            </button>
          </div>

          <div className="checklist-items-container">
            {list.items.map(item => (
              <div key={item.id} className="checklist-item">
                <button className="check-btn" onClick={() => toggleItem(list.id, item.id)}>
                  {item.completed ? <CheckCircle2 size={20} color={list.badgeColor} /> : <Circle size={20} color="#cbd5e1" />}
                </button>
                <span className={`checklist-item-text ${item.completed ? 'completed' : ''}`}>
                  {item.text}
                </span>
                <button className="check-delete-btn" onClick={() => deleteItem(list.id, item.id)}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="checklist-add-row">
            <Plus size={18} color={list.badgeColor} />
            <input 
              type="text" 
              className="checklist-input" 
              placeholder="Add item..."
              value={newItems[list.id] || ''}
              onChange={(e) => setNewItems({...newItems, [list.id]: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem(list.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}