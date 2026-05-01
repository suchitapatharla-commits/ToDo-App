import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Tag } from 'lucide-react';

export default function AddTaskModal({ onClose, onSave, initialData }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [desc, setDesc] = useState(initialData?.desc || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [category, setCategory] = useState(initialData?.category || '');
  
  const [categories] = useState(() => {
    const savedCats = localStorage.getItem('custom_categories');
    return savedCats ? JSON.parse(savedCats) : [
      { id: 'cat_1', name: 'Work', color: '#3b82f6' },
      { id: 'cat_2', name: 'Personal', color: '#10b981' },
      { id: 'cat_3', name: 'Shopping', color: '#f97316' },
    ];
  });

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, desc, date, category, initialData?.id);
  };

  return (
    <div className="add-modal-overlay">
      <div className="add-modal">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} color="#64748b" /></button>
        </div>
        
        <div className="input-group">
          <input type="text" className="input-title" placeholder="What do you need to do?" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="input-desc" placeholder="Details (optional)" rows="3" value={desc} onChange={e => setDesc(e.target.value)}></textarea>
          
          <label style={{display:'flex', alignItems:'center', gap:'12px', marginTop:'5px', padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer'}}>
            <CalendarIcon size={20} color="#6366f1" />
            <input 
              type="datetime-local" 
              style={{border:'none', outline:'none', color:'#1e293b', fontSize:'15px', background:'transparent', width: '100%', fontFamily: 'inherit', cursor: 'pointer'}} 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              onClick={(e) => {
                if(e.target.showPicker) e.target.showPicker();
              }}
            />
          </label>

          <div style={{marginTop: '10px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
              <Tag size={18} color="#94a3b8" />
              <span style={{fontSize:'14px', fontWeight:'600', color:'#64748b'}}>Select Category</span>
            </div>
            <div className="modal-categories">
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  className={`cat-select-pill ${category === cat.id ? 'selected' : ''}`}
                  style={{ 
                    '--pill-color': cat.color, 
                    '--pill-color-light': cat.color + '1A', 
                    borderColor: category === cat.id ? cat.color : '#e2e8f0'
                  }}
                  onClick={() => setCategory(category === cat.id ? '' : cat.id)}
                >
                  {cat.name}
                </button>
              ))} 
            </div>
          </div>
          
          <button className="save-btn" onClick={handleSave}>Save Task</button>
        </div>
      </div>
    </div>
  );
}