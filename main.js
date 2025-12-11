// ============ Main Entry Point ============
import TaskManager from './taskManager.js';
import * as UI from './ui.js';
import * as Modal from './modal.js';
import * as Handlers from './handlers.js';
import * as Utils from './utils.js';
import * as Storage from './storage.js';

// ============ Main App State ============
let currentSortType = 'newest';
let currentSearchTerm = '';
let filterHighPriority = false;
let filterTimerRunning = false;
let currentNavFilter = 'dashboard';

// ============ Helper Functions ============
const refreshUI = () => {
  let tasksToShow;
  
  // First apply navigation filter
  tasksToShow = Utils.getNavFilteredTasks(currentNavFilter);
  
  // Then apply additional filters
  if (filterHighPriority || filterTimerRunning) {
    if (filterHighPriority) {
      tasksToShow = tasksToShow.filter(t => t.priority === 'High');
    }
    if (filterTimerRunning) {
      tasksToShow = tasksToShow.filter(t => t.timerRunning);
    }
  } else if (currentSearchTerm) {
    const searchTerm = currentSearchTerm.toLowerCase();
    tasksToShow = tasksToShow.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  } else {
    // Apply sorting
    tasksToShow = sortTasksArray(tasksToShow, currentSortType);
  }
  
  UI.renderTasks(tasksToShow, handleTaskAction);
  UI.updateStats();
};

const sortTasksArray = (tasks, sortType) => {
  const sorted = [...tasks];
  
  switch(sortType) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'due':
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      break;
    case 'priority':
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      break;
  }
  
  return sorted;
};

const handleTaskAction = (action, taskId) => {
  switch(action) {
    case 'timer':
      Handlers.toggleTimer(taskId, refreshUI);
      break;
    case 'complete':
      Handlers.completeTask(taskId, refreshUI);
      break;
    case 'edit':
      Handlers.editTask(taskId, refreshUI);
      break;
    case 'delete':
      Handlers.deleteTask(taskId, refreshUI);
      break;
    case 'select':
      Handlers.selectTask(taskId, refreshUI);
      break;
  }
};

// ============ Event Listeners Setup ============
const setupEventListeners = () => {
  const elements = UI.getElements();
  
  // Setup detail panel actions
  Handlers.setupDetailActions(refreshUI);
  
  // Quick Add Form
  elements.quickAddForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = elements.qTitle.value.trim();
    const category = elements.qCategory.value;
    
    if (!title) return;
    
    TaskManager.addTask({ title, category });
    elements.qTitle.value = '';
    refreshUI();
  });
  
  // FAB - Add new task
  elements.fab.addEventListener('click', () => {
    Modal.createModal('Add New Task', null, refreshUI);
  });
  
  // Sort change
  elements.sortSelect.addEventListener('change', (e) => {
    currentSortType = e.target.value;
    refreshUI();
  });
  
  // Search
  elements.searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    refreshUI();
  });
  
  // Sidebar toggle
  elements.sidebarToggle.addEventListener('click', () => {
    elements.sidebar.classList.toggle('show');
  });
  
  // Close sidebar when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    const sidebar = elements.sidebar;
    const toggle = elements.sidebarToggle;
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        !toggle.contains(e.target)) {
      sidebar.classList.remove('show');
    }
  });
  
  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const newTheme = Utils.toggleTheme();
      Storage.saveTheme(newTheme);
    });
  }
  
  // Filter checkboxes
  const filterPriority = document.getElementById('filter-priority');
  const filterTimer = document.getElementById('filter-timer');
  
  if (filterPriority) {
    filterPriority.addEventListener('change', (e) => {
      filterHighPriority = e.target.checked;
      refreshUI();
    });
  }
  
  if (filterTimer) {
    filterTimer.addEventListener('change', (e) => {
      filterTimerRunning = e.target.checked;
      refreshUI();
    });
  }
  
  // Navigation buttons
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      navButtons.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');
      
      // Set current filter
      const navFilters = ['dashboard', 'my-tasks', 'today', 'upcoming', 'completed'];
      currentNavFilter = navFilters[index];
      
      // Reset other filters
      currentSearchTerm = '';
      filterHighPriority = false;
      filterTimerRunning = false;
      if (filterPriority) filterPriority.checked = false;
      if (filterTimer) filterTimer.checked = false;
      if (elements.searchInput) elements.searchInput.value = '';
      
      refreshUI();
      
      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('show');
      }
    });
  });
};

// ============ App Initialization ============
const init = () => {
  const savedTheme = Storage.loadTheme();
  Utils.setTheme(savedTheme);
  
  setupEventListeners();
  refreshUI();
};

// Start the app
document.addEventListener('DOMContentLoaded', init);