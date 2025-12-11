// ============ Event Handlers Module ============
import TaskManager from './taskManager.js';
import * as UI from './ui.js';
import * as Modal from './modal.js';

export const toggleTimer = (taskId, onUpdate) => {
  const task = TaskManager.getTask(taskId);
  if (!task) return;
  
  if (task.timerRunning) {
    TaskManager.stopTimer(taskId);
  } else {
    TaskManager.startTimer(taskId, () => {
      UI.updateTaskTimer(taskId);
    });
  }
  
  if (onUpdate) onUpdate();
};

export const completeTask = (taskId, onUpdate) => {
  TaskManager.toggleComplete(taskId);
  
  if (onUpdate) onUpdate();
  
  if (TaskManager.getSelectedTask() === taskId) {
    UI.selectTask(taskId);
  }
};

export const editTask = (taskId, onUpdate) => {
  const task = TaskManager.getTask(taskId);
  if (task) {
    Modal.createModal('Edit Task', task, onUpdate);
  }
};

export const deleteTask = (taskId, onUpdate) => {
  if (confirm('Are you sure you want to delete this task?')) {
    TaskManager.deleteTask(taskId);
    
    if (onUpdate) onUpdate();
    
    if (TaskManager.getSelectedTask() === taskId) {
      TaskManager.setSelectedTask(null);
      UI.clearTaskDetail();
    }
  }
};

export const selectTask = (taskId, onUpdate) => {
  UI.selectTask(taskId);
  if (onUpdate) onUpdate();
};

export const setupDetailActions = (onUpdate) => {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-detail-edit')) {
      const selectedId = TaskManager.getSelectedTask();
      if (selectedId) {
        editTask(selectedId, onUpdate);
        // Close mobile detail if open
        if (window.innerWidth <= 768) {
          UI.closeMobileDetail();
        }
      }
    } else if (e.target.classList.contains('btn-detail-delete')) {
      const selectedId = TaskManager.getSelectedTask();
      if (selectedId) {
        deleteTask(selectedId, onUpdate);
        // Close mobile detail if open
        if (window.innerWidth <= 768) {
          UI.closeMobileDetail();
        }
      }
    }
  });
};