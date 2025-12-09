const TaskModel = (() => {
  let tasks = []; // private
  let listeners = [];

  const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function load(initial = []) {
    tasks = Array.isArray(initial) ? initial.slice() : [];
    notify();
  }

  function getAll() {
    return tasks.slice(); // return copy
  }

  function findById(id) {
    return tasks.find((t) => t.id === id) || null;
  }

  function add(task) {
    const newTask = {
      id: task.id || generateId(),
      title: task.title || "Untitled",
      description: task.description || "",
      category: task.category || "Work",
      priority: task.priority || "Low",
      dueDate: task.dueDate || null,
      createdAt: new Date().toISOString(),
      completed: !!task.completed,
      timer: task.timer || { running: false, remaining: 25 * 60 }, // in seconds
      tags: task.tags || [],
    };
    tasks.unshift(newTask); // newest first
    notify();
    return newTask;
  }

  function update(id, patch = {}) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...patch };
    notify();
    return tasks[idx];
  }

  function remove(id) {
    const before = tasks.length;
    tasks = tasks.filter((t) => t.id !== id);
    if (tasks.length !== before) notify();
  }

  function toggleComplete(id) {
    const t = findById(id);
    if (!t) return null;
    t.completed = !t.completed;
    notify();
    return t;
  }

  function subscribe(fn) {
    listeners.push(fn);
    // return unsubscribe
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }

  function notify() {
    const snapshot = getAll();
    listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (e) {
        console.error("Listener error:", e);
      }
    });
  }

  return {
    load,
    getAll,
    findById,
    add,
    update,
    remove,
    toggleComplete,
    subscribe,
  };
})();

export default TaskModel;
