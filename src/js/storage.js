const STORAGE_KEY = "taskflow_tasks_v1";

export async function saveTasks(tasks = []) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (e) {
    console.error("Storage save error:", e);
    return false;
  }
}

export async function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Storage load error:", e);
    return [];
  }
}

export async function clearTasks() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Storage clear error:", e);
    return false;
  }
}
