import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TaskList from '../pages/TaskList';

export default function CalendarView({ tasks, db, reloadTasks, onEdit }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Helper to format date as YYYY-MM-DD to match database format
  const formatYMD = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Check if a specific day has tasks
  const hasTask = (day) => {
    const dateStr = formatYMD(new Date(year, month, day));
    return tasks.some(t => t.date && t.date.startsWith(dateStr));
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(year, month, day));
  };

  // Filter tasks to only show the ones for the selected date below the calendar
  const selectedDateStr = formatYMD(selectedDate);
  const filteredTasks = tasks.filter(t => t.date && t.date.startsWith(selectedDateStr));

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="calendar-view-wrapper">
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth}><ChevronLeft size={20}/></button>
          <h2>{monthNames[month]}, {year}</h2>
          <button className="calendar-nav-btn" onClick={nextMonth}><ChevronRight size={20}/></button>
        </div>
        
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-day-name">{d}</div>
          ))}
          
          {blanks.map((_, i) => <div key={`blank-${i}`} className="calendar-day empty"></div>)}
          
          {days.map(day => {
            const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            
            return (
              <div 
                key={day} 
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {day}
                {hasTask(day) && <div className="calendar-dot"></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-tasks-section">
        <h3 style={{margin: '10px 0 15px 5px', color: '#1e293b', fontSize: '16px'}}>
          Tasks for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h3>
        <TaskList tasks={filteredTasks} db={db} reloadTasks={reloadTasks} filter="home" onEdit={onEdit} />
      </div>
    </div>
  );
}