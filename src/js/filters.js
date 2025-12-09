export function filterByQuery(tasks, q = "") {
  const ql = q.trim().toLowerCase();
  if (!ql) return tasks.slice();
  return tasks.filter((t) => {
    return (
      (t.title && t.title.toLowerCase().includes(ql)) ||
      (t.description && t.description.toLowerCase().includes(ql)) ||
      (t.tags && t.tags.join(" ").toLowerCase().includes(ql))
    );
  });
}

export function filterByCategory(tasks, category) {
  if (!category || category === "All") return tasks.slice();
  return tasks.filter((t) => t.category === category);
}

export function filterByPriority(tasks, priority) {
  if (!priority || priority === "All") return tasks.slice();
  return tasks.filter((t) => t.priority === priority);
}

export function sortTasks(tasks, mode = "newest") {
  const arr = tasks.slice();
  if (mode === "newest") {
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (mode === "due") {
    return arr.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }
  if (mode === "priority") {
    const rank = { High: 1, Medium: 2, Low: 3 };
    return arr.sort((a, b) => (rank[a.priority] || 99) - (rank[b.priority] || 99));
  }
  return arr;
}

// simple debounce HOF
export function debounce(fn, wait = 250) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
