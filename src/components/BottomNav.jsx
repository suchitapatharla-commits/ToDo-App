import React from 'react';
import { Home, ListChecks, ListTodo, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
        <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span>Home</span>
      </button>
      
      {/* NEW CHECKLIST TAB */}
      <button className={activeTab === 'checklist' ? 'active' : ''} onClick={() => setActiveTab('checklist')}>
        <ListChecks size={24} strokeWidth={activeTab === 'checklist' ? 2.5 : 2} />
        <span>Checklist</span>
      </button>
      
      <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>
        <ListTodo size={24} strokeWidth={activeTab === 'all' ? 2.5 : 2} />
        <span>All Tasks</span>
      </button>
      
      <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
        <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
        <span>Settings</span>
      </button>
    </nav>
  );
}