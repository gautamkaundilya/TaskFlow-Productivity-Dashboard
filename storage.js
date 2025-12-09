// ============ Storage Module ============
const STORAGE_KEY = 'taskflow_tasks';
const THEME_KEY = 'taskflow_theme';

export const save = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const load = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};

export const loadTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'dark';
};
