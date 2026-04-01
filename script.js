const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed");

const STORAGE_KEY = "todo_app_tasks_v1";

let tasks = loadTasks();
let activeFilter = "all";

renderTasks();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  input.value = "";
  saveTasks();
  renderTasks();
});

list.addEventListener("click", (event) => {
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;
  if (event.target.classList.contains("delete-btn")) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    return;
  }

  if (event.target.classList.contains("edit-btn")) {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;

    const nextText = prompt("Edit task:", current.text);
    if (nextText === null) return;

    const cleaned = nextText.trim();
    if (!cleaned) return;

    current.text = cleaned;
    saveTasks();
    renderTasks();
  }
});

list.addEventListener("change", (event) => {
  if (!event.target.matches('input[type="checkbox"]')) return;
  const item = event.target.closest(".todo-item");
  if (!item) return;

  const id = item.dataset.id;
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = event.target.checked;
  saveTasks();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

function renderTasks() {
  const visible = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });

  list.innerHTML = "";

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No tasks to show.";
    list.appendChild(empty);
  } else {
    visible.forEach((task) => {
      const li = document.createElement("li");
      li.className = `todo-item${task.completed ? " completed" : ""}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task as complete" />
        <span class="task-text"></span>
        <div class="task-actions">
          <button class="edit-btn" type="button">Edit</button>
          <button class="delete-btn" type="button">Delete</button>
        </div>
      `;

      li.querySelector(".task-text").textContent = task.text;
      list.appendChild(li);
    });
  }

  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.completed === "boolean"
    );
  } catch (_error) {
    return [];
  }
}
