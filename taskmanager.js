// ============ Task Manager Module ============
import * as Storage from './storage.js';

// Closure for maintaining private state
const TaskManager = (() => {
  let tasks = Storage.load();
  let nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  let selectedTaskId = null;
  let timers = {}; // Store running timers
  
  const getTasks = () => [...tasks];
  
  const getTask = (id) => tasks.find(t => t.id === id);
  
  const addTask = (taskData) => {
    const newTask = {
      id: nextId++,
      title: taskData.title,
      category: taskData.category || 'Personal',
      priority: taskData.priority || 'Medium',
      description: taskData.description || '',
      dueDate: taskData.dueDate || '',
      completed: false,
      timerSeconds: 0,
      timerRunning: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    Storage.save(tasks);
    return newTask;
  };
  
  const updateTask = (id, updates) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      Storage.save(tasks);
      return tasks[index];
    }
    return null;
  };
  
  const deleteTask = (id) => {
    // Stop timer if running
    if (timers[id]) {
      clearInterval(timers[id]);
      delete timers[id];
    }
    tasks = tasks.filter(t => t.id !== id);
    Storage.save(tasks);
  };
  
  const toggleComplete = (id) => {
    const task = getTask(id);
    if (task) {
      // Stop timer if running
      if (task.timerRunning) {
        stopTimer(id);
      }
      return updateTask(id, { completed: !task.completed });
    }
  };
  
  const startTimer = (id, onTick) => {
    const task = getTask(id);
    if (!task || task.timerRunning) return;
    
    updateTask(id, { timerRunning: true });
    
    // Event Loop - setInterval for timer
    timers[id] = setInterval(() => {
      const currentTask = getTask(id);
      if (currentTask) {
        updateTask(id, { timerSeconds: currentTask.timerSeconds + 1 });
        if (onTick) onTick(id);
      }
    }, 1000);
  };
  
  const stopTimer = (id) => {
    if (timers[id]) {
      clearInterval(timers[id]);
      delete timers[id];
      updateTask(id, { timerRunning: false });
    }
  };
  
  const resetTimer = (id) => {
    stopTimer(id);
    updateTask(id, { timerSeconds: 0 });
  };
  
  const setSelectedTask = (id) => {
    selectedTaskId = id;
  };
  
  const getSelectedTask = () => selectedTaskId;
  
  // HOF for filtering
  const filterTasks = (filterFn) => tasks.filter(filterFn);
  
  // HOF for sorting
  const sortTasks = (compareFn) => [...tasks].sort(compareFn);
  
  // HOF for searching
  const searchTasks = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(term) ||
      task.description.toLowerCase().includes(term)
    );
  };
  
  return {
    getTasks,
    getTask,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    startTimer,
    stopTimer,
    resetTimer,
    setSelectedTask,
    getSelectedTask,
    filterTasks,
    sortTasks,
    searchTasks
  };
})();

export default TaskManager;
