import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const DB_NAME = 'todo_db';
const sqlite = new SQLiteConnection(CapacitorSQLite);

const isWeb = () => Capacitor.getPlatform() === 'web';

const getWebTasks = () => {
  const data = localStorage.getItem('web_tasks');
  return data ? JSON.parse(data) : [];
};
const saveWebTasks = (tasks) => {
  localStorage.setItem('web_tasks', JSON.stringify(tasks));
};

export const initDB = async () => {
  if (isWeb()) return null;

  try {
    await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

    let db;
    if (isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      try {
        db = await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
      } catch (e) {
        if (e.message && e.message.includes("already exists")) {
            db = await sqlite.retrieveConnection(DB_NAME, false);
        } else {
            throw e; 
        }
      }
    }

    await db.open();
    
    // 1. Create table with the new category AND isPinned columns
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT,
        category TEXT,
        completed INTEGER DEFAULT 0,
        isPinned INTEGER DEFAULT 0
      );
    `);

    // 2. PRO TRICK: Safely attempt to add columns to existing databases!
    try {
      await db.execute(`ALTER TABLE tasks ADD COLUMN category TEXT;`);
    } catch { 
      // Ignore silently if column already exists
    }
    
    try {
      await db.execute(`ALTER TABLE tasks ADD COLUMN isPinned INTEGER DEFAULT 0;`);
    } catch {
      // Ignore silently if column already exists
    }
    
    return db;
  } catch (e) {
    if (Capacitor.isNativePlatform() && !e.message?.includes("already exists")) {
        alert("DB Error: " + JSON.stringify(e.message));
    }
    return null;
  }
};

export const fetchTasks = async (db) => {
  if (isWeb()) return getWebTasks();
  if (!db) return [];
  try {
    const result = await db.query("SELECT * FROM tasks ORDER BY id DESC");
    return result.values || [];
  } catch { return []; }
};

export const addTaskSQL = async (db, title, description, date, category) => {
  if (isWeb()) {
    const tasks = getWebTasks();
    const newTask = { id: Date.now(), title, description, date, category, completed: 0, isPinned: 0 };
    saveWebTasks([newTask, ...tasks]);
    return;
  }
  if (!db) return;
  try {
      const query = "INSERT INTO tasks (title, description, date, category, completed, isPinned) VALUES (?, ?, ?, ?, 0, 0)";
      await db.run(query, [title, description, date, category]);
  } catch(e) {
      alert("Save Failed: " + e.message);
  }
};

export const updateTaskDetailsSQL = async (db, id, title, description, date, category) => {
  if (isWeb()) {
    const tasks = getWebTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, title, description, date, category } : t);
    saveWebTasks(updated);
    return;
  }
  if (!db) return;
  const query = "UPDATE tasks SET title = ?, description = ?, date = ?, category = ? WHERE id = ?";
  await db.run(query, [title, description, date, category, id]);
};

export const toggleTaskSQL = async (db, id, currentStatus) => {
  if (isWeb()) {
    const tasks = getWebTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveWebTasks(updated);
    return;
  }
  if (!db) return;
  const newStatus = currentStatus ? 0 : 1;
  await db.run("UPDATE tasks SET completed = ? WHERE id = ?", [newStatus, id]);
};

export const deleteTaskSQL = async (db, id) => {
  if (isWeb()) {
    const tasks = getWebTasks().filter(t => t.id !== id);
    saveWebTasks(tasks);
    return;
  }
  if (!db) return;
  await db.run("DELETE FROM tasks WHERE id = ?", [id]);
};

// --- NEW: Toggle Pin Status ---
export const togglePinTaskSQL = async (db, id, currentPinStatus) => {
  if (isWeb()) {
    const tasks = getWebTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t);
    saveWebTasks(updated);
    return;
  }
  if (!db) return;
  const newStatus = currentPinStatus ? 0 : 1;
  await db.run("UPDATE tasks SET isPinned = ? WHERE id = ?", [newStatus, id]);
};