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
    this.descriptionEl = taskEl.querySelector(".todo__description");
    this.checkboxEl = taskEl.querySelector(".todo__checkbox");
    this.priorityValueEl = taskEl.querySelector(".todo__priority");
    this.titleEl = taskEl.querySelector(".todo__title");
    this.dueDateEl = taskEl.querySelector(".todo__due-date");
    this.timeRemainingEl = taskEl.querySelector(
      '[data-testid="test-todo-time-remaining"]',
    );
    this.priorityIndicatorEl = taskEl.querySelector(
      ".todo__priority-indicator",
    );

    // Content Containers
    this.contentEl = taskEl.querySelector(".todo__content");
    this.formEl = taskEl.querySelector(".todo__form");

    // Form Inputs
    this.titleInput = taskEl.querySelector(
      '[data-testid="test-todo-edit-title-input"]',
    );
    this.descriptionInput = taskEl.querySelector(
      '[data-testid="test-todo-edit-description-input"]',
    );
    this.priorityInput = taskEl.querySelector(
      '[data-testid="test-todo-edit-priority-select"]',
    );
    this.dueDateInput = taskEl.querySelector(
      '[data-testid="test-todo-edit-due-date-input"]',
    );

    // Form Actions
    this.submitBtn = taskEl.querySelector(".todo__update-btn");
    this.cancelBtn = taskEl.querySelector(".todo__cancel-btn");

    // Buttons
    this.editBtn = taskEl.querySelector(
      '[data-testid="test-todo-edit-button"]',
    );
    this.deleteBtn = taskEl.querySelector('[data-testid="test-todo--button"]');

    // TODO status control
    this.statusControlEl = taskEl.querySelector(".todo__status-control");

    // Save original status and class to revert correctly
    this.originalStatus = this.statusEl.innerText;
    this.originalClass = this.statusEl.className;

    this.init();
  }

  init() {
    this.dueDate = new Date(this.dueDateEl.getAttribute("datetime"));

    // Event Listeners
    this.checkboxEl.addEventListener("change", () => this.handleStatusChange());
    this.editBtn.addEventListener("click", () => this.toggleEditMode(true));
    this.cancelBtn.addEventListener("click", () => this.toggleEditMode(false));
    this.deleteBtn.addEventListener("click", () =>
      alert("Task deleted successfully"),
    );
    this.formEl.addEventListener("submit", (e) => this.updateCard(e));

    const initialStatus = this.statusEl.textContent.trim().toLowerCase();
    if (this.statusControlEl) {
      this.statusControlEl.value = initialStatus;
      this.statusControlEl.addEventListener("change", (e) =>
        this.updateStatus(e),
      );
    }

    const priority = this.priorityValueEl.textContent.toLowerCase();
    this.priorityIndicatorEl.classList.add(
      `todo__priority-indicator--${priority}`,
    );

    // Form submission (placeholder for now)
    // this.submitBtn?.addEventListener("click", (e) => {
    //   e.preventDefault();
    //   alert("Changes saved (UI update pending implementation)");
    //   this.toggleEditMode(false);
    // });

    // Initial check
    // this.handleStatusChange();
    this.updateRemainingTime();
    this.populateForm();
  }

  populateForm() {
    // Fill text inputs
    this.titleInput.value = this.titleEl.textContent.trim();
    this.descriptionInput.value = this.descriptionEl.textContent
      .trim()
      .replace("\n", "");

    // Fill priority select
    const priority = this.priorityValueEl.textContent.trim().toLowerCase();
    this.priorityInput.value = priority;

    // Fill date input (YYYY-MM-DD format required)
    const dateAttr = this.dueDateEl.getAttribute("datetime");
    if (dateAttr) {
      const dateOnly = dateAttr.split("T")[0];
      this.dueDateInput.value = dateOnly;
    }
  }

  updateCard(e) {
    e.preventDefault();
    const formData = new FormData(this.formEl);
    const todoData = Object.fromEntries(formData.entries());

    this.titleEl.textContent = todoData.title;
    this.descriptionEl.textContent = todoData.description;
    this.priorityValueEl.textContent = todoData.priority;
    this.priorityIndicatorEl.className = `todo__priority-indicator todo__priority-indicator--${todoData.priority}`;

    this.toggleEditMode(false);
  }

  updateStatus(e) {
    const newStatus = e.target.value;
    this.checkboxEl.checked = newStatus === "done"
    this.statusEl.textContent = newStatus
    this.statusEl.className = `todo__status todo__status--${newStatus.replace(" ", "-")}`;
  }

  toggleEditMode(show) {
    if (show) {
      this.contentEl.style.display = "none";
      this.formEl.style.display = "block";
      this.populateForm(); // Refresh values when opening
    } else {
      this.contentEl.style.display = "block";
      this.formEl.style.display = "none";
      this.editBtn.focus()
    }
  }

  updateRemainingTime() {
    const timeElapsed = this.calculateRemainingTime();
    this.timeRemainingEl.innerText = timeElapsed;
  }

  handleStatusChange() {
    if (this.checkboxEl.checked) {
      this.checkboxEl.setAttribute("aria-label", "mark as in-progress");
      this.statusEl.textContent = "Done";
      this.statusEl.className = "todo__status todo__status--done";
      this.titleEl.style.textDecoration = "line-through";
      this.titleEl.style.opacity = "0.6";
      this.statusControlEl.value = "done"
    } else {
      this.checkboxEl.setAttribute("aria-label", "mark as done");
      this.statusEl.textContent = "pending";
      this.statusEl.className = "todo__status todo__status--pending";
      this.titleEl.style.textDecoration = "none";
      this.titleEl.style.opacity = "1";
      this.statusControlEl.value = this.originalStatus.trim().toLowerCase()
    }
  }

  calculateRemainingTime() {
    const now = new Date();
    const targetDate = this.dueDate;
    const diffInMilliseconds = targetDate - now;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const absDiff = Math.abs(diffInSeconds);

    this.updateTimeStyle(diffInSeconds);

    // If within 1 minute of the deadline (future or past), say "Due now!"
    if (absDiff < 60) {
      return "Due now!";
    }

    const units = [
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    // Find the largest unit that fits
    const unit =
      units.find((u) => absDiff >= u.seconds) || units[units.length - 1];
    const value = Math.floor(absDiff / unit.seconds);
    const plural = value !== 1 ? "s" : "";

    if (diffInSeconds > 0) {
      // Future
      if (unit.label === "day" && value === 1) {
        return "Due tomorrow";
      }
      return `Due in ${value} ${unit.label}${plural}`;
    } else {
      // Past
      return `Overdue by ${value} ${unit.label}${plural}`;
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
