import TaskModel from "./taskModel.js";
import { saveTasks, loadTasks } from "./storage.js";
import { renderTaskList, updateStats, showTaskDetail, qs } from "./ui.js";
import { createTimer } from "./timer.js";
import { filterByQuery, filterByCategory, sortTasks, debounce } from "./filters.js";

const taskListEl = qs("#task-list");
const quickAddForm = qs("#quick-add");
const qTitle = qs("#q-title");
const qCategory = qs("#q-category");
const searchInput = qs("#search");
const sortSelect = qs("#sort");

let saveTimer = null;

/* bootstrap */
async function init() {
  // load from storage
  const stored = await loadTasks();
  TaskModel.load(stored);

  // subscribe to model changes -> save + ui
  TaskModel.subscribe(async (tasks) => {
    // persist
    await saveTasks(tasks);
    // render
    applyAndRender(tasks);
  });

  // initial render
  applyAndRender(TaskModel.getAll());

  attachUiHandlers();
}

function attachUiHandlers() {
  // Quick add
  if (quickAddForm) {
    quickAddForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = qTitle.value && qTitle.value.trim();
      const category = qCategory.value || "Work";
      if (!title) return;
      TaskModel.add({ title, category, priority: "Medium" });
      qTitle.value = "";
      qTitle.focus();
    });
  }

  // Task list clicks (event delegation)
  if (taskListEl) {
    taskListEl.addEventListener("click", (e) => {
      const card = e.target.closest(".task-card");
      if (!card) return;
      const id = card.dataset.id;
      if (e.target.matches(".btn-delete")) {
        TaskModel.remove(id);
        return;
      }
      if (e.target.matches(".btn-edit")) {
        // simplistic: show details for editing
        const t = TaskModel.findById(id);
        showTaskDetail(t);
        return;
      }
      if (e.target.matches(".btn-start")) {
        const t = TaskModel.findById(id);
        if (!t) return;
        // start a timer for this task (simple per-click start)
        startTaskTimer(t);
        return;
      }
      if (e.target.matches(".task-checkbox")) {
        // toggle complete
        TaskModel.toggleComplete(id);
        return;
      }
      // clicking card body -> show detail
      const t = TaskModel.findById(id);
      if (t) showTaskDetail(t);
    });
  }

  // Search with debounce
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((ev) => {
        applyAndRender(TaskModel.getAll());
      }, 220)
    );
  }

  // Sort change
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      applyAndRender(TaskModel.getAll());
    });
  }

  // FAB (focus quick add)
  const fab = qs("#fab");
  if (fab) fab.addEventListener("click", () => qTitle && qTitle.focus());
}

/* Apply filters/sorting from UI and render */
function applyAndRender(tasks) {
  let out = tasks.slice();
  const q = (qs("#search") && qs("#search").value) || "";
  const sort = (qs("#sort") && qs("#sort").value) || "newest";
  // category filters could be added (left nav) - here we just apply query + sort
  out = filterByQuery(out, q);
  out = sortTasks(out, sort);
  // render list
  renderTaskList(taskListEl, out);
  // update stats
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  updateStats({ total, completed, streak: 0 });
}

/* Timer integration example */
function startTaskTimer(task) {
  // create a timer instance for this task's remaining seconds
  const tRemaining = (task.timer && task.timer.remaining) || 25 * 60;
  const timer = createTimer({
    initial: tRemaining,
    onTick: (rem) => {
      // update UI display in detail pane if visible
      if (qs("#detail-pane") && !qs("#detail-pane").hidden) {
        const mins = Math.floor(rem / 60);
        const secs = rem % 60;
        const disp = qs("#timer-display");
        if (disp) disp.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
    },
    onComplete: () => {
      // simple toast via alert (can be improved)
      alert(`Timer finished for: ${task.title}`);
      // set task.timer.running false & reset remaining
      TaskModel.update(task.id, { timer: { running: false, remaining: 25 * 60 } });
    },
  });

  // mark as running in model
  TaskModel.update(task.id, { timer: { running: true, remaining: tRemaining } });
  timer.start();
}

window.addEventListener("DOMContentLoaded", init);
