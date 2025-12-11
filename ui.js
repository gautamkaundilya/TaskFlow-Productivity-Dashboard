// ============ UI Module ============
import TaskManager from './taskManager.js';

const elements = {
  taskList: document.getElementById('task-list'),
  quickAddForm: document.getElementById('quick-add'),
  qTitle: document.getElementById('q-title'),
  qCategory: document.getElementById('q-category'),
  sortSelect: document.getElementById('sort'),
  searchInput: document.getElementById('search-input'),
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
    <input 
      type="radio" 
      class="task-radio" 
      ${task.completed ? 'checked' : ''}
    />
    <div class="task-content">
      <span class="task-title">${escapeHtml(task.title)}</span>
      <div class="task-badges">
        <span class="task-category ${task.category}">${task.category}</span>
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        ${task.timerSeconds > 0 ? `<span class="task-timer-badge">⏱ ${formatTime(task.timerSeconds)}</span>` : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn ${task.timerRunning ? 'timer-running' : ''}" 
              title="${task.timerRunning ? 'Pause Timer' : 'Start Timer'}">
        ${task.timerRunning ? '⏸' : '▶'}
      </button>
      <button class="task-action-btn" title="Edit Task">✏</button>
      <button class="task-action-btn" title="Delete Task">🗑</button>
    </div>
  `;
  
  // Radio button event
  const radio = div.querySelector('.task-radio');
  radio.addEventListener('click', (e) => {
    e.stopPropagation();
    onAction('complete', task.id);
  });
  
  // Task content click (select)
  const content = div.querySelector('.task-content');
  content.addEventListener('click', (e) => {
    e.stopPropagation();
    onAction('select', task.id);
  });
  
  // Action buttons
  const actionBtns = div.querySelectorAll('.task-action-btn');
  actionBtns[0].addEventListener('click', (e) => {
    e.stopPropagation();
    onAction('timer', task.id);
  });
  actionBtns[1].addEventListener('click', (e) => {
    e.stopPropagation();
    onAction('edit', task.id);
  });
  actionBtns[2].addEventListener('click', (e) => {
    e.stopPropagation();
    onAction('delete', task.id);
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
    const timerBadge = taskEl.querySelector('.task-timer-badge');
    if (timerBadge) {
      timerBadge.textContent = `⏱ ${formatTime(task.timerSeconds)}`;
    } else if (task.timerSeconds > 0) {
      const badges = taskEl.querySelector('.task-badges');
      if (badges) {
        const newBadge = document.createElement('span');
        newBadge.className = 'task-timer-badge';
        newBadge.textContent = `⏱ ${formatTime(task.timerSeconds)}`;
        badges.appendChild(newBadge);
      }
    }
    
    const timerBtn = taskEl.querySelectorAll('.task-action-btn')[0];
    if (timerBtn) {
      timerBtn.textContent = task.timerRunning ? '⏸' : '▶';
      timerBtn.title = task.timerRunning ? 'Pause Timer' : 'Start Timer';
      if (task.timerRunning) {
        timerBtn.classList.add('timer-running');
      } else {
        timerBtn.classList.remove('timer-running');
      }
    }
  }
  
  if (TaskManager.getSelectedTask() === taskId) {
    updateTaskDetailTimer(taskId);
  }
};

const updateTaskDetailTimer = (taskId) => {
  const task = TaskManager.getTask(taskId);
  if (!task) return;
  
  const timerValue = document.querySelector('.detail-timer-value');
  if (timerValue) {
    timerValue.textContent = formatTime(task.timerSeconds);
  }
};

export const updateStats = () => {
  const tasks = TaskManager.getTasks();
  const completed = tasks.filter(t => t.completed).length;
  
  elements.statTotal.textContent = tasks.length;
  elements.statCompleted.textContent = completed;
  
  const streak = calculateStreak(tasks);
  elements.statStreak.textContent = streak;
};

const calculateStreak = (tasks) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  return tasks.filter(t => 
    t.completed && new Date(t.createdAt) > sevenDaysAgo
  ).length;
};

export const selectTask = (taskId) => {
  TaskManager.setSelectedTask(taskId);
  
  // Check if mobile view
  if (window.innerWidth <= 768) {
    showMobileTaskDetail(taskId);
  } else {
    showTaskDetail(taskId);
  }
};

export const showMobileTaskDetail = (taskId) => {
  const task = TaskManager.getTask(taskId);
  if (!task) return;
  
  // Create or get modal
  let modal = document.getElementById('mobile-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mobile-detail-modal';
    modal.className = 'mobile-detail-modal';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="mobile-detail-content">
      <div class="mobile-detail-header">
        <h3>Task Details</h3>
        <button class="mobile-detail-close" id="mobile-detail-close">×</button>
      </div>
      <div class="detail-content">
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
          <span class="detail-value detail-timer-value">${formatTime(task.timerSeconds)}</span>
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
        <div class="detail-actions">
          <button class="btn-detail-edit">✏ Edit</button>
          <button class="btn-detail-delete">🗑 Delete</button>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.add('show');
  
  // Close button event
  const closeBtn = document.getElementById('mobile-detail-close');
  closeBtn.addEventListener('click', closeMobileDetail);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeMobileDetail();
    }
  });
};

export const closeMobileDetail = () => {
  const modal = document.getElementById('mobile-detail-modal');
  if (modal) {
    modal.classList.remove('show');
  }
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
      <span class="detail-value detail-timer-value">${formatTime(task.timerSeconds)}</span>
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
    <div class="detail-actions">
      <button class="btn-detail-edit">✏ Edit</button>
      <button class="btn-detail-delete">🗑 Delete</button>
    </div>
  `;
  
  detailCard.appendChild(detailDiv);
};

export const clearTaskDetail = () => {
  elements.detailEmpty.style.display = 'block';
  const detailContent = document.querySelector('.detail-content');
  if (detailContent) detailContent.remove();
};