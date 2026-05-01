import React, { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { initDB, fetchTasks, addTaskSQL, updateTaskDetailsSQL } from './database';
import { Plus, Calendar as CalendarIcon, X } from 'lucide-react'; 
import './App.css';

import BottomNav from './components/BottomNav';
import AddTaskModal from './components/AddTaskModal';
import TaskList from './pages/TaskList';
import SettingsPage from './pages/SettingsPage';
import CalendarView from './components/CalendarView';
import CheckListPage from './pages/CheckListPage';

function App() {
  const [isWeb] = useState(Capacitor.getPlatform() === 'web');
  const [db, setDb] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const refreshTasks = useCallback(async () => {
    let database = db;
    if (!database && !isWeb) {
        try { database = await initDB(); setDb(database); } 
        catch (err) { console.error(err); }
    }
    if (database || isWeb) {
        try { const data = await fetchTasks(database); setTasks(data || []); } 
        catch (err) { console.error(err); }
    }
  }, [db, isWeb]);

  const scheduleAlerts = async (title, date) => {
    if (!date || isWeb) return;
    const dueTime = new Date(date).getTime();
    const now = Date.now();
    const notifications = [];

    const reminderTime = dueTime - (60 * 60 * 1000); 
    if (reminderTime > now) {
      notifications.push({ id: Math.floor(Math.random() * 100000), title: "Upcoming Task ⏳", body: `"${title}" is due in 1 hour.`, schedule: { at: new Date(reminderTime) }, channelId: 'reminder-channel', sound: null });
    }
    if (dueTime > now) {
      notifications.push({ id: Math.floor(Math.random() * 100000) + 1, title: "⏰ TASK DUE NOW", body: `It's time to: ${title}`, schedule: { at: new Date(dueTime) }, channelId: 'alarm-channel-system', sound: null });
    }
    if (notifications.length > 0) await LocalNotifications.schedule({ notifications });
  };

  const handleSaveTask = async (title, desc, date, category, id) => {
    let currentDb = db;
    if (!currentDb && !isWeb) { currentDb = await initDB(); setDb(currentDb); }
    
    if (id) await updateTaskDetailsSQL(currentDb, id, title, desc, date, category);
    else await addTaskSQL(currentDb, title, desc, date, category);
    
    await scheduleAlerts(title, date);
    setTimeout(refreshTasks, 100);
    setEditingTask(null);
  };

  useEffect(() => {
    const startup = setTimeout(async () => {
        await refreshTasks(); 
        if (Capacitor.isNativePlatform()) {
            const permStatus = await LocalNotifications.checkPermissions();
            if (permStatus.display !== 'granted') await LocalNotifications.requestPermissions();
            await LocalNotifications.createChannel({ id: 'reminder-channel', name: 'Task Reminders', importance: 3, visibility: 1, vibration: true });
            await LocalNotifications.createChannel({ id: 'alarm-channel-system', name: 'Task Alarms', importance: 5, visibility: 1, vibration: true });
        }
    }, 100);
    return () => clearTimeout(startup);
  }, [refreshTasks]); 

  useEffect(() => {
    const timer = setTimeout(refreshTasks, 0);
    return () => clearTimeout(timer);
  }, [activeTab, refreshTasks]);

  const openEditModal = (task) => { setEditingTask(task); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingTask(null); };

  const mainContent = (
    <div className="app-container">
      <header className="modern-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 className="header-title">
              {activeTab === 'home' ? 'My Day' : activeTab === 'all' ? 'All Tasks' : activeTab === 'checklist' ? 'Checklists' : 'Settings'}
            </h1>
            <p className="header-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={() => setShowCalendar(true)} style={{padding:'10px', background:'none', border:'none', cursor:'pointer'}}>
            <CalendarIcon size={26} color="#64748b" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="content-area">
        {activeTab === 'settings' && <SettingsPage />}
        
        {/* CLEANED UP CHECKLIST RENDER */}
        {activeTab === 'checklist' && <ChecklistPage />}

        {(activeTab === 'home' || activeTab === 'all') && (
          <TaskList tasks={tasks} db={db} reloadTasks={refreshTasks} filter={activeTab} onEdit={openEditModal} />
        )}
      </div>

      {/* THE FIX: Hide floating button when modal is open */}
      {activeTab === 'home' && !isModalOpen && (
        <div className="add-task-bar-wrapper">
          <button className="add-task-bar" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} strokeWidth={3} /> Add Task
          </button>
        </div>
      )}

      {/* THE FIX: Hide bottom navigation when modal is open */}
      {!isModalOpen && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {showCalendar && (
        <div className="fullscreen-overlay">
          <header className="modern-header" style={{borderBottom: 'none'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h1 className="header-title">Calendar</h1>
              <button onClick={() => setShowCalendar(false)} style={{padding:'10px', background:'#f1f5f9', borderRadius: '50%', border:'none', cursor:'pointer'}}>
                <X size={24} color="#64748b" />
              </button>
            </div>
          </header>
          <div className="content-area" style={{paddingBottom: '20px'}}>
            <CalendarView tasks={tasks} db={db} reloadTasks={refreshTasks} onEdit={openEditModal} />
          </div>
        </div>
      )}

      {isModalOpen && <AddTaskModal onClose={handleCloseModal} onSave={handleSaveTask} initialData={editingTask} />}
    </div>
  );

  if (isWeb) return <div className="web-preview-container"><div className="phone-frame"><div className="phone-notch"></div>{mainContent}</div></div>;
  return mainContent;
}

export default App;