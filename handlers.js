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
  
  // Update detail view if this task is selected
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
    
    // Clear detail view if deleted task was selected
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
