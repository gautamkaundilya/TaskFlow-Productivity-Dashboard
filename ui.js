// ============ UI Module ============
import TaskManager from './taskManager.js';

const elements = {
  taskList: document.getElementById('task-list'),
  quickAddForm: document.getElementById('quick-add'),
  qTitle: document.getElementById('q-title'),
  qCategory: document.getElementById('q-category'),
  sortSelect: document.getElementById('sort'),
  searchInput: document.querySelector('.search input'),
  statTotal: document.getElementById('stat-total'),
  statCompleted: document.getElementById('stat-completed'),
  statStreak: document.getElementById('stat-streak'),
  detailEmpty: document.getElementById('detail-empty'),
  fab: document.getElementById('fab'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  sidebar: document.getElementById('sidebar')
};

export const getElements = () => elements;

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const createTaskElement = (task, onAction) => {
  const div = document.createElement('div');
  div.className = `task-item ${task.completed ? 'completed' : ''}`;
  div.dataset.id = task.id;
  
  div.innerHTML = `
    <div class="task-header">
      <div>
        <div class="task-title">${escapeHtml(task.title)}</div>
        <span class="task-category ${task.category}">${task.category}</span>
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
      </div>
    </div>
    <div class="task-meta">
      ${task.dueDate ? `<span>📅 ${formatDate(task.dueDate)}</span>` : ''}
      <span>⏱️ ${formatTime(task.timerSeconds)}</span>
    </div>
    ${task.timerSeconds > 0 || task.timerRunning ? `
      <div class="task-timer">
        <span class="timer-display">${formatTime(task.timerSeconds)}</span>
      </div>
    ` : ''}
    <div class="task-actions">
      <button class="btn-timer ${task.timerRunning ? 'running' : ''}" data-action="timer">
        ${task.timerRunning ? '⏸ Pause' : '▶ Start'}
      </button>
      <button class="btn-complete" data-action="complete">
        ${task.completed ? '↩ Undo' : '✓ Done'}
      </button>
      <button class="btn-edit" data-action="edit">✏ Edit</button>
      <button class="btn-delete" data-action="delete">🗑 Delete</button>
    </div>
  `;
  
  // Event delegation for task actions
  div.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (!action) {
      // Select task for detail view
      if (onAction) onAction('select', task.id);
      return;
    }
    
    e.stopPropagation();
    if (onAction) onAction(action, task.id);
  });
  
  return div;
};

export const renderTasks = (tasksToRender = null, onAction) => {
  const tasks = tasksToRender || TaskManager.getTasks();
  elements.taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    elements.taskList.innerHTML = '<div class="card" style="text-align:center; padding:2rem; color:var(--text-secondary)">No tasks found. Add one to get started!</div>';
    return;
  }
  
  tasks.forEach(task => {
    elements.taskList.appendChild(createTaskElement(task, onAction));
  });
  
  // Highlight selected task
  const selectedId = TaskManager.getSelectedTask();
  if (selectedId) {
    const selectedEl = elements.taskList.querySelector(`[data-id="${selectedId}"]`);
    if (selectedEl) selectedEl.classList.add('selected');
  }
};

export const updateTaskTimer = (taskId) => {
  const task = TaskManager.getTask(taskId);
  if (!task) return;
  
  const taskEl = elements.taskList.querySelector(`[data-id="${taskId}"]`);
  if (taskEl) {
    const timerDisplay = taskEl.querySelector('.timer-display');
    if (timerDisplay) {
      timerDisplay.textContent = formatTime(task.timerSeconds);
    }
    const metaTimer = taskEl.querySelector('.task-meta span:last-child');
    if (metaTimer) {
      metaTimer.textContent = `⏱️ ${formatTime(task.timerSeconds)}`;
    }
  }
};

export const updateStats = () => {
  const tasks = TaskManager.getTasks();
  const completed = tasks.filter(t => t.completed).length;
  
  elements.statTotal.textContent = tasks.length;
  elements.statCompleted.textContent = completed;
  
  // Calculate focus streak (consecutive days with completed tasks)
  const streak = calculateStreak(tasks);
  elements.statStreak.textContent = streak;
};

const calculateStreak = (tasks) => {
  // Simple implementation - count tasks completed in last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  return tasks.filter(t => 
    t.completed && new Date(t.createdAt) > sevenDaysAgo
  ).length;
};

export const selectTask = (taskId) => {
  TaskManager.setSelectedTask(taskId);
  showTaskDetail(taskId);
};

export const showTaskDetail = (taskId) => {
  const task = TaskManager.getTask(taskId);
  if (!task) return;
  
  const detailCard = document.querySelector('.col-detail .card');
  elements.detailEmpty.style.display = 'none';
  
  const existingDetail = detailCard.querySelector('.detail-content');
  if (existingDetail) existingDetail.remove();
  
  const detailDiv = document.createElement('div');
  detailDiv.className = 'detail-content';
  detailDiv.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Title</span>
      <span class="detail-value">${escapeHtml(task.title)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Category</span>
      <span class="detail-value">${task.category}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Priority</span>
      <span class="detail-value priority-badge priority-${task.priority}">${task.priority}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Status</span>
      <span class="detail-value">${task.completed ? '✓ Completed' : '⏳ Active'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Time Tracked</span>
      <span class="detail-value">${formatTime(task.timerSeconds)}</span>
    </div>
    ${task.dueDate ? `
      <div class="detail-row">
        <span class="detail-label">Due Date</span>
        <span class="detail-value">${formatDate(task.dueDate)}</span>
      </div>
    ` : ''}
    ${task.description ? `
      <div class="detail-row">
        <span class="detail-label">Description</span>
        <span class="detail-value">${escapeHtml(task.description)}</span>
      </div>
    ` : ''}
  `;
  
  detailCard.appendChild(detailDiv);
};

export const clearTaskDetail = () => {
  elements.detailEmpty.style.display = 'block';
  const detailContent = document.querySelector('.detail-content');
  if (detailContent) detailContent.remove();
};
