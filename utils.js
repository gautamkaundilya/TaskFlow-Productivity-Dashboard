// ============ Utility Functions Module ============
import TaskManager from './taskManager.js';

// Sorting Functions (HOF)
export const applySorting = (sortType) => {
  let sorted;
  
  switch(sortType) {
    case 'newest':
      sorted = TaskManager.sortTasks((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      break;
    case 'due':
      sorted = TaskManager.sortTasks((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      break;
    case 'priority':
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      sorted = TaskManager.sortTasks((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      break;
    default:
      sorted = TaskManager.getTasks();
  }
  
  return sorted;
};

// Search Function (HOF)
export const applySearch = (searchTerm, sortType) => {
  if (searchTerm.trim()) {
    return TaskManager.searchTasks(searchTerm);
  } else {
    return applySorting(sortType);
  }
};

// Filter Functions (HOF)
export const applyFilters = (highPriority, timerRunning) => {
  let filtered = TaskManager.getTasks();
  
  if (highPriority) {
    filtered = filtered.filter(t => t.priority === 'High');
  }
  
  if (timerRunning) {
    filtered = filtered.filter(t => t.timerRunning);
  }
  
  return filtered;
};

// Navigation Filters
export const getNavFilteredTasks = (navType) => {
  const tasks = TaskManager.getTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  switch(navType) {
    case 'dashboard':
      return tasks;
    case 'my-tasks':
      return tasks.filter(t => !t.completed);
    case 'today':
      return tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    case 'upcoming':
      return tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() > today.getTime();
      });
    case 'completed':
      return tasks.filter(t => t.completed);
    default:
      return tasks;
  }
};

// Theme Functions
export const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  return newTheme;
};

export const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};