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

// ============ Helper Functions ============
const refreshUI = () => {
  let tasksToShow;
  
  // Apply filters first
  if (filterHighPriority || filterTimerRunning) {
    tasksToShow = Utils.applyFilters(filterHighPriority, filterTimerRunning);
  } else if (currentSearchTerm) {
    tasksToShow = Utils.applySearch(currentSearchTerm, currentSortType);
  } else {
    tasksToShow = Utils.applySorting(currentSortType);
  }
  
  UI.renderTasks(tasksToShow, handleTaskAction);
  UI.updateStats();
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
  
  // Theme toggle
  document.querySelector('.sidebar-footer .btn.small').addEventListener('click', () => {
    const newTheme = Utils.toggleTheme();
    Storage.saveTheme(newTheme);
  });
  
  // Filter checkboxes
  const filterCheckboxes = document.querySelectorAll('.sidebar-footer input[type="checkbox"]');
  filterCheckboxes[0].addEventListener('change', (e) => {
    filterHighPriority = e.target.checked;
    refreshUI();
  });
  
  filterCheckboxes[1].addEventListener('change', (e) => {
    filterTimerRunning = e.target.checked;
    refreshUI();
  });
};

// ============ App Initialization ============
const init = () => {
  // Load saved theme
  const savedTheme = Storage.loadTheme();
  Utils.setTheme(savedTheme);
  
  // Setup event listeners
  setupEventListeners();
  
  // Initial render
  refreshUI();
};

// Start the app
document.addEventListener('DOMContentLoaded', init);
