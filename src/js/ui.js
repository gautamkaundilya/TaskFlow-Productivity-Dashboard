const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* Render a task card (returns DOM element) */
export function renderTaskCard(task) {
  const article = document.createElement("article");
  article.className = "task-card card";
  article.dataset.id = task.id;
  article.tabIndex = 0;

  const left = document.createElement("div");
  left.className = "task-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!task.completed;
  checkbox.className = "task-checkbox";
  left.appendChild(checkbox);

  const meta = document.createElement("div");
  const title = document.createElement("h4");
  title.className = "task-title";
  title.textContent = task.title || "Untitled";
  meta.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "task-desc";
  desc.textContent = task.description || "";
  meta.appendChild(desc);

  left.appendChild(meta);

  const right = document.createElement("div");
  right.className = "task-right";

  const badge = document.createElement("span");
  badge.className = `badge priority-${(task.priority || "low").toLowerCase()}`;
  badge.textContent = task.priority || "Low";
  right.appendChild(badge);

  const btnStart = document.createElement("button");
  btnStart.className = "icon-btn small btn-start";
  btnStart.title = "Start timer";
  btnStart.textContent = "▶";
  right.appendChild(btnStart);

  const btnEdit = document.createElement("button");
  btnEdit.className = "icon-btn small btn-edit";
  btnEdit.title = "Edit";
  btnEdit.textContent = "✎";
  right.appendChild(btnEdit);

  const btnDelete = document.createElement("button");
  btnDelete.className = "icon-btn small btn-delete";
  btnDelete.title = "Delete";
  btnDelete.textContent = "🗑";
  right.appendChild(btnDelete);

  article.appendChild(left);
  article.appendChild(right);

  // attach minimal dataset for later use
  article._task = task;

  return article;
}

/* Render a list of tasks into container (clears first) */
export function renderTaskList(container, tasks = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!tasks.length) {
    const emp = document.createElement("div");
    emp.className = "card";
    emp.textContent = "No tasks yet. Add a task to get started.";
    container.appendChild(emp);
    return;
  }
  const frag = document.createDocumentFragment();
  tasks.forEach((t) => {
    frag.appendChild(renderTaskCard(t));
  });
  container.appendChild(frag);
}

/* Update stats */
export function updateStats({ total = 0, completed = 0, streak = 0 } = {}) {
  const elTotal = qs("#stat-total");
  const elCompleted = qs("#stat-completed");
  const elStreak = qs("#stat-streak");
  if (elTotal) elTotal.textContent = total;
  if (elCompleted) elCompleted.textContent = completed;
  if (elStreak) elStreak.textContent = streak;
}

/* Show task details in detail pane */
export function showTaskDetail(task) {
  const pane = qs("#detail-pane");
  const empty = qs("#detail-empty");
  if (!pane || !empty) return;
  if (!task) {
    pane.hidden = true;
    empty.style.display = "";
    return;
  }
  empty.style.display = "none";
  pane.hidden = false;

  const title = qs("#detail-title");
  const desc = qs("#detail-desc");
  const timerDisplay = qs("#timer-display");
  if (title) title.textContent = task.title || "";
  if (desc) desc.textContent = task.description || "";
  if (timerDisplay) {
    const mins = Math.floor((task.timer && task.timer.remaining) / 60) || 25;
    const secs = (task.timer && task.timer.remaining) % 60 || 0;
    timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
}

/* Small helper to find parent task card element */
export function findTaskCardFromEvent(e) {
  return e.target.closest(".task-card");
}

export { qs, qsa };
