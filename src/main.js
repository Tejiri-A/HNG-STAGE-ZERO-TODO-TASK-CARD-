import "./style.css";

// assign id to each of them
// each task would have a status data
// when checkbox is in checked state, set status to done
// assign the strike-through style to the title

// get due date data
// calculate the remaining time (on page load)

// if due date is ahead: due in '' dats
// if due date is the next day: due tomorrow
// if due date is now: due now
// if due time has passed: overdue by '' minutes | hours | days | weeks | months | years

// on edit click: alert "edit clicked"
// on delete clicked: alert "task deleted successfully"

class Task {
  constructor(taskEl) {
    this.taskEl = taskEl;
    this.id = taskEl.dataset.taskid;
    this.statusEl = taskEl.querySelector(".todo__status");
    this.checkboxEl = taskEl.querySelector(".todo__checkbox");
    this.titleEl = taskEl.querySelector(".todo__title");
    this.dueDateEl = taskEl.querySelector(".todo__due-date");
    this.timeRemainingEl = taskEl.querySelector(
      '[data-testid="test-todo-time-remaining"]',
    );

    // Buttons
    this.editBtn = taskEl.querySelector(
      '[data-testid="test-todo-edit-button"]',
    );
    this.deleteBtn = taskEl.querySelector('[data-testid="test-todo--button"]');

    this.init();
  }

  init() {
    this.dueDate = new Date(this.dueDateEl.getAttribute("datetime"));

    // Event Listeners
    this.checkboxEl.addEventListener("change", () => this.handleStatusChange());
    this.editBtn.addEventListener("click", () => alert("Edit clicked"));
    this.deleteBtn.addEventListener("click", () =>
      alert("Task deleted successfully"),
    );

    // Initial check
    this.handleStatusChange();

    const timeElapsed = this.calculateRemainingTime();
    this.timeRemainingEl.innerText = timeElapsed;
  }

  handleStatusChange() {
    if (this.checkboxEl.checked) {
      this.statusEl.textContent = "Done";
      this.statusEl.className = "todo__status todo__status--done";
      this.titleEl.style.textDecoration = "line-through";
      this.titleEl.style.opacity = "0.6";
    } else {
      this.statusEl.textContent = "Pending";
      this.statusEl.className = "todo__status todo__status--pending";
      this.titleEl.style.textDecoration = "none";
      this.titleEl.style.opacity = "1";
    }
  }

  calculateRemainingTime() {
    const now = Date.now();
    const targetDate = this.dueDate;

    const diffInSeconds = Math.floor((targetDate - now) / 1000);


    // Define thresholds in seconds
    const units = [
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const unit of units) {
      if (Math.abs(diffInSeconds) >= unit.seconds || unit.label === "second") {
        const value = Math.floor(diffInSeconds / unit.seconds);
        
        this.updateTimeStyle(diffInSeconds);

        const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
        return rtf.format(value, unit.label);
      }
    }
  }

  updateTimeStyle(diffInSeconds) {
    let color = "var(--clr-success-600)"; // Default: Distant

    if (diffInSeconds < 0) {
      color = "var(--clr-error-600)"; // Overdue
    } else if (diffInSeconds < 86400) {
      color = "var(--clr-warning-600)"; // Due today (within 24h)
    } else if (diffInSeconds < 259200) {
      color = "var(--clr-info-600)"; // Due soon (within 3 days)
    }

    this.timeRemainingEl.style.color = color;
  }
}

// Store all instances
const allTasks = [];

function initTasks() {
  const taskElements = document.querySelectorAll(".todo");
  taskElements.forEach((el) => {
    // Avoid double-initializing
    if (!allTasks.find((t) => t.taskEl === el)) {
      allTasks.push(new Task(el));
    }
  });
}

// Initial Run
initTasks();

// Global access to re-init if new tasks are added later
window.initTasks = initTasks;
