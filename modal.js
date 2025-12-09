// ============ Modal Module ============
import TaskManager from './taskManager.js';

let currentModal = null;
let editingTaskId = null;

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const createModal = (title, task = null, onSuccess) => {
  editingTaskId = task ? task.id : null;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <form id="task-form">
        <div class="form-group">
          <label>Title *</label>
          <input type="text" id="modal-title" required value="${task ? escapeHtml(task.title) : ''}">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="modal-category">
            <option ${!task || task.category === 'Work' ? 'selected' : ''}>Work</option>
            <option ${task && task.category === 'Study' ? 'selected' : ''}>Study</option>
            <option ${task && task.category === 'Personal' ? 'selected' : ''}>Personal</option>
          </select>
        </div>
        <div class="form-group">
          <label>Priority</label>
          <select id="modal-priority">
            <option ${!task || task.priority === 'Low' ? 'selected' : ''}>Low</option>
            <option ${!task || task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option ${task && task.priority === 'High' ? 'selected' : ''}>High</option>
          </select>
        </div>
        <div class="form-group">
          <label>Due Date</label>
          <input type="date" id="modal-date" value="${task && task.dueDate ? task.dueDate : ''}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="modal-description">${task ? escapeHtml(task.description) : ''}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn">${task ? 'Update' : 'Add'} Task</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  currentModal = modal;
  
  // Event listeners
  modal.querySelector('#modal-cancel').addEventListener('click', closeModal);
  modal.querySelector('#task-form').addEventListener('submit', (e) => {
    handleSubmit(e, onSuccess);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Focus first input
  modal.querySelector('#modal-title').focus();
};

const handleSubmit = (e, onSuccess) => {
  e.preventDefault();
  
  const formData = {
    title: document.getElementById('modal-title').value.trim(),
    category: document.getElementById('modal-category').value,
    priority: document.getElementById('modal-priority').value,
    dueDate: document.getElementById('modal-date').value,
    description: document.getElementById('modal-description').value.trim()
  };
  
  // Control Flow - Validation
  if (!formData.title) {
    alert('Please enter a task title');
    return;
  }
  
  if (editingTaskId) {
    TaskManager.updateTask(editingTaskId, formData);
  } else {
    TaskManager.addTask(formData);
  }
  
  if (onSuccess) onSuccess();
  closeModal();
};

export const closeModal = () => {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
    editingTaskId = null;
  }
};
