/**
 * @file Todo-приложение с управлением задачами
 * @description Система для создания и отслеживания задач с категориями и статусами
 * 
 * <img src="todo-screenshot.png" alt="Интерфейс приложения" style="width: 100%;
 * max-width: 800px; display: block; margin: 20px 0;">
 *
 * Скриншот главного окна приложения
 */

/**
 * Категории задач в приложении
 * @enum {string}
 */
const TaskCategory = {
  /** Домашние дела */
  HOME: 'home',
  /** Рабочие задачи */
  WORK: 'work',
  /** Учебные задания */
  STUDY: 'study'
};

/**
* Статусы выполнения задач
* @enum {string}
*/
const TaskStatus = {
  /** Задача не начата */
  NOT_STARTED: 'not-started',
  /** Задача в процессе выполнения */
  IN_PROGRESS: 'in-progress',
  /** Задача завершена */
  COMPLETED: 'completed'
};

class Task {
  /**
   * Создает новую задачу
   * @param {string} title Название задачи
   * @param {TaskCategory} [category=TaskCategory.HOME] Категория
   * @param {TaskStatus} [status=TaskStatus.NOT_STARTED] Статус
   */
  constructor(title, category = TaskCategory.HOME, status = TaskStatus.NOT_STARTED) {
      this.id = Math.random().toString(36).substring(2, 11);
      this.title = title;
      this.category = category;
      this.status = status;
      this.createdAt = new Date();
  }

  /**
   * Обновляет статус задачи
   * @param {TaskStatus} newStatus Новый статус
   */
  updateStatus(newStatus) {
      this.status = newStatus;
  }

  /**
   * Рассчитывает приоритет задачи
   * @description Приоритет = 1 / (возраст задачи в днях + 1)
   * @returns {number} Число от 0 до 1
   */
  calculatePriority() {
      const ageInDays = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
      return 1 / (ageInDays + 1);
  }
}

/**
* Главный класс приложения для управления задачами
* @class
* 
* @mermaid
* graph TD
*     A[Пользователь] -->|Добавляет| B[Новая задача]
*     A -->|Изменяет| C[Статус задачи]
*     A -->|Удаляет| D[Задача]
*     B --> E[Список задач]
*     C --> E
*     D --> E
*     E --> F[LocalStorage]
*     F -->|Загружает| E
*/
class TodoApp {
  constructor() {
      /** @private Список задач */
      this.tasks = [];
      /** @private Текущий фильтр */
      this.currentFilter = 'all';
      
      this.loadTasks();
      this.setupEventListeners();
      this.renderTasks();
  }

  /** @private Загружает задачи из localStorage */
  loadTasks() {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
          this.tasks = JSON.parse(savedTasks);
      }
  }

  /** @private Настраивает обработчики событий */
  setupEventListeners() {
      document.getElementById('addBtn').addEventListener('click', () => {
          const title = document.getElementById('taskInput').value.trim();
          const category = document.getElementById('categorySelect').value;
          const status = document.getElementById('statusSelect').value;
          if (title) {
              this.addTask(title, category, status);
              document.getElementById('taskInput').value = '';
          }
      });

      document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              this.currentFilter = btn.dataset.category;
              this.renderTasks();
          });
      });
  }

  /**
   * Добавляет новую задачу
   * @param {string} title Название
   * @param {TaskCategory} category Категория
   * @param {TaskStatus} status Статус
   */
  addTask(title, category, status) {
      const task = new Task(title, category, status);
      this.tasks.push(task);
      this.saveTasks();
      this.renderTasks();
  }

  /** @private Сохраняет задачи в localStorage */
  saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  /** @private Отрисовывает задачи в интерфейсе */
  renderTasks() {
      const taskList = document.getElementById('taskList');
      taskList.innerHTML = '';
      
      this.getFilteredTasks().forEach(task => {
          const li = document.createElement('li');
          if (task.status === TaskStatus.COMPLETED) li.classList.add('completed');
          
          li.innerHTML = `
              <div class="task-info">
                  <span class="category-icon">${this.getCategoryIcon(task.category)}</span>
                  <span>${task.title}</span>
                  <span class="status-badge status-${task.status}">
                      ${this.getStatusText(task.status)}
                  </span>
              </div>
              <div class="task-actions">
                  <select class="status-select" data-id="${task.id}">
                      <option value="not-started" ${task.status === 'not-started' ? 'selected' : ''}>Не начато</option>
                      <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>В процессе</option>
                      <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Готово</option>
                  </select>
                  <button onclick="app.deleteTask('${task.id}')">✕</button>
              </div>
          `;
          taskList.appendChild(li);
      });

      document.getElementById('totalTasks').textContent = this.tasks.length;
      document.getElementById('completedTasks').textContent = 
          this.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

      document.querySelectorAll('.status-select').forEach(select => {
          select.addEventListener('change', (e) => {
              this.updateTaskStatus(e.target.dataset.id, e.target.value);
          });
      });
  }

  /** @private Возвращает отфильтрованные задачи */
  getFilteredTasks() {
      return this.currentFilter === 'all' 
          ? this.tasks 
          : this.tasks.filter(t => t.category === this.currentFilter);
  }

  /** @private Возвращает иконку категории */
  getCategoryIcon(category) {
      const icons = {
          [TaskCategory.HOME]: '🏠',
          [TaskCategory.WORK]: '💼',
          [TaskCategory.STUDY]: '📚'
      };
      return icons[category] || '📌';
  }

  /** @private Возвращает текст статуса */
  getStatusText(status) {
      const texts = {
          [TaskStatus.NOT_STARTED]: 'Не начато',
          [TaskStatus.IN_PROGRESS]: 'В процессе',
          [TaskStatus.COMPLETED]: 'Готово'
      };
      return texts[status];
  }

  /**
   * Обновляет статус задачи
   * @param {string} taskId ID задачи
   * @param {TaskStatus} newStatus Новый статус
   */
  updateTaskStatus(taskId, newStatus) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
          task.updateStatus(newStatus);
          this.saveTasks();
          this.renderTasks();
      }
  }

  /**
   * Удаляет задачу
   * @param {string} taskId ID задачи
   */
  deleteTask(taskId) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveTasks();
      this.renderTasks();
  }
}

// Инициализация приложения
const app = new TodoApp();