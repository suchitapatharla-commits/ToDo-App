import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar, Trash2, Edit2, Tag, Pin, Wand2 } from 'lucide-react';
import { toggleTaskSQL, deleteTaskSQL, togglePinTaskSQL, addTaskSQL } from '../database';

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">📝</div>
    <h3 style={{margin: '0 0 5px 0', color: '#64748b'}}>No Tasks</h3>
  </div>
);

export default function TaskList({ tasks, db, reloadTasks, filter, onEdit }) {
  const [subTab, setSubTab] = useState('all'); 

  const savedCats = JSON.parse(localStorage.getItem('custom_categories')) || [];
  const getCategoryObj = (catId) => savedCats.find(c => c.id === catId);

  // --- THE SIMPLIFICATION ALGORITHM ---
  const handleBreakdown = async (task, e) => {
    e.stopPropagation();
    if (!task.date) {
      alert("Please add a due date to this project first so we can schedule the steps!");
      return;
    }

    const dueDate = new Date(task.date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      alert("This task is due too soon to break down. Just do it!");
      return;
    }

    if (window.confirm(`Break this project down into 3 scheduled steps leading up to ${dueDate.toLocaleDateString()}?`)) {
      // Calculate evenly spaced dates
      const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const step1Date = new Date(); step1Date.setDate(today.getDate() + Math.floor(diffDays * 0.25));
      const step2Date = new Date(); step2Date.setDate(today.getDate() + Math.floor(diffDays * 0.5));
      const step3Date = new Date(); step3Date.setDate(today.getDate() + Math.floor(diffDays * 0.75));

      // Generate the sub-tasks
      await addTaskSQL(db, `Phase 1: Research/Prep for ${task.title}`, `Step 1 of the simplified project.`, formatYMD(step1Date), task.category);
      await addTaskSQL(db, `Phase 2: Draft/Execute ${task.title}`, `Step 2 of the simplified project.`, formatYMD(step2Date), task.category);
      await addTaskSQL(db, `Phase 3: Finalize ${task.title}`, `Step 3 of the simplified project.`, formatYMD(step3Date), task.category);
      
      reloadTasks();
      alert("Project simplified! Check your upcoming tasks.");
    }
  };

  const renderListTask = (task) => {
    const cat = getCategoryObj(task.category);
    return (
      <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
        <button className="check-btn" onClick={async (e) => { e.stopPropagation(); await toggleTaskSQL(db, task.id, task.completed); reloadTasks(); }}>
          {task.completed ? <CheckCircle2 size={24} color="#10b981" /> : <Circle size={24} color="#94a3b8" />}
        </button>
        <div className="task-info-row" onClick={() => onEdit(task)}>
          <div>
            <h3 className="task-title-text" style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#94a3b8' : '#1e293b' }}>
              {task.title}
            </h3>
            <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
              {task.date && (
                <div className="due-tag-compact">
                  <Calendar size={10} />
                  <span>{new Date(task.date).toLocaleDateString([], {month: 'short', day: 'numeric'})}</span>
                </div>
              )}
              {cat && (
                <div className="due-tag-compact" style={{ backgroundColor: cat.color + '1A', color: cat.color }}>
                  <Tag size={10} />
                  <span>{cat.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="task-actions">
          {/* Wand Icon for Simplification */}
          {!task.completed && <button className="edit-btn" onClick={(e) => handleBreakdown(task, e)} title="Simplify Project"><Wand2 size={16} color="#8b5cf6" /></button>}
          {/* Pin Icon */}
          <button className="edit-btn" onClick={async (e) => { e.stopPropagation(); await togglePinTaskSQL(db, task.id, task.isPinned); reloadTasks(); }}>
            <Pin size={16} color={task.isPinned ? "#ef4444" : "#94a3b8"} fill={task.isPinned ? "#ef4444" : "none"} />
          </button>
          <button className="delete-btn" onClick={async (e) => { e.stopPropagation(); if(window.confirm("Delete task?")) { await deleteTaskSQL(db, task.id); reloadTasks(); } }}><Trash2 size={16} /></button>
        </div>
      </div>
    );
  };

  const renderBentoTask = (task) => {
    const cat = getCategoryObj(task.category);
    return (
      <div key={task.id} className={`bento-card ${task.isPinned ? 'pinned-bento' : ''}`} onClick={() => onEdit(task)}>
        {cat && <div style={{position: 'absolute', top: 16, right: 16, width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color}} />}
        {task.isPinned && <div style={{position: 'absolute', top: 14, right: cat ? 34 : 16}}><Pin size={14} color="#ef4444" fill="#ef4444" /></div>}
        
        <div className="bento-card-header">
          <button className="check-btn" onClick={async (e) => { e.stopPropagation(); await toggleTaskSQL(db, task.id, task.completed); reloadTasks(); }}>
            <Circle size={26} color={task.isPinned ? "#fca5a5" : "#cbd5e1"} strokeWidth={2.5} />
          </button>
        </div>
        <div className="bento-title" style={{color: task.isPinned ? '#7f1d1d' : '#1e293b'}}>{task.title}</div>
      </div>
    );
  };

  // --- ALL TASKS LOGIC ---
  if (filter === 'all') {
    let displayedTasks = tasks;
    if (subTab === 'pending') displayedTasks = tasks.filter(t => !t.completed);
    if (subTab === 'completed') displayedTasks = tasks.filter(t => t.completed);

    return (
      <div className="task-list-wrapper">
        <div className="sub-nav-tabs">
          <button className={subTab === 'all' ? 'active' : ''} onClick={() => setSubTab('all')}>All</button>
          <button className={subTab === 'completed' ? 'active' : ''} onClick={() => setSubTab('completed')}>Completed</button>
          <button className={subTab === 'pending' ? 'active' : ''} onClick={() => setSubTab('pending')}>Pending</button>
        </div>
        {displayedTasks.length === 0 ? <EmptyState /> : displayedTasks.map(renderListTask)}
      </div>
    );
  }

  // --- HOME TAB LOGIC ---
  const pending = tasks.filter(t => !t.completed);
  if (pending.length === 0) return <EmptyState />;

  // 1. Extract Pinned Tasks
  const pinnedTasks = pending.filter(t => t.isPinned);
  const unpinnedPending = pending.filter(t => !t.isPinned);

  // 2. Date Math for Unpinned Tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = formatYMD(today);
  const tomorrowStr = formatYMD(tomorrow);

  const todayTasks = unpinnedPending.filter(t => t.date && t.date.startsWith(todayStr));
  const tomorrowTasks = unpinnedPending.filter(t => t.date && t.date.startsWith(tomorrowStr));
  const upcomingTasks = unpinnedPending.filter(t => t.date && t.date > tomorrowStr);
  const noDateTasks = unpinnedPending.filter(t => !t.date);

  return (
    <div className="bento-layout">
      {/* RENDER PINNED TASK FIRST */}
      {pinnedTasks.length > 0 && (
        <>
          <h2 className="bento-section-title" style={{color: '#ef4444'}}>★ Top Priority</h2>
          <div className="bento-grid">
            {pinnedTasks.map(t => (
               <div key={t.id} style={{gridColumn: 'span 2'}}>{renderBentoTask(t)}</div>
            ))}
          </div>
        </>
      )}

      {todayTasks.length > 0 && (<><h2 className="bento-section-title">Today</h2><div className="bento-grid">{todayTasks.map(renderBentoTask)}</div></>)}
      {tomorrowTasks.length > 0 && (<><h2 className="bento-section-title">Tomorrow</h2><div className="bento-grid">{tomorrowTasks.map(renderBentoTask)}</div></>)}
      {upcomingTasks.length > 0 && (<><h2 className="bento-section-title">Day After</h2><div className="bento-grid">{upcomingTasks.map(renderBentoTask)}</div></>)}
      {noDateTasks.length > 0 && (<><h2 className="bento-section-title">Someday</h2><div className="bento-grid">{noDateTasks.map(renderBentoTask)}</div></>)}
    </div>
  );
}