// Frontend Only To-Do List (Local Storage)
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.updateStats();
    }

    setupEventListeners() {
        // Add task form
        document.getElementById('add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
                this.updateFilterButtons(btn);
            });
        });

        // Sort select
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    addTask() {
        const input = document.getElementById('task-input');
        const priority = document.getElementById('priority-select').value;
        const title = input.value.trim();

        if (!title) return;

        const task = {
            id: Date.now().toString(),
            title,
            completed: false,
            priority,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.updateStats();

        // Reset form
        input.value = '';
        document.getElementById('priority-select').value = 'medium';
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        this.updateStats();
    }

    editTask(id, newTitle) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newTitle.trim()) {
            task.title = newTitle.trim();
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    updateFilterButtons(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Apply filter
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }

        // Apply sort
        filtered.sort((a, b) => {
            if (this.currentSort === 'date') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (this.currentSort === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (this.currentSort === 'title') {
                return a.title.localeCompare(b.title);
            }
        });

        return filtered;
    }

    render() {
        const container = document.getElementById('tasks-container');
        const emptyState = document.getElementById('empty-state');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        container.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        // Add event listeners to task elements
        container.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTask(e.target.dataset.id);
            });
        });

        container.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTask(e.target.dataset.id);
            });
        });

        container.querySelectorAll('.task-title').forEach(title => {
            title.addEventListener('dblclick', (e) => {
                this.makeEditable(e.target);
            });
        });
    }

    createTaskHTML(task) {
        const priorityColors = {
            high: '#ef4444',
            medium: '#eab308', 
            low: '#22c55e'
        };

        const priorityLabels = {
            high: 'Haute',
            medium: 'Moyenne',
            low: 'Basse'
        };

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox-wrapper">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        data-id="${task.id}"
                        ${task.completed ? 'checked' : ''}
                    >
                    <span class="checkmark"></span>
                </div>
                
                <div class="task-content">
                    <div class="task-title" data-id="${task.id}">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-priority" style="color: ${priorityColors[task.priority]}">
                            ${priorityLabels[task.priority]}
                        </span>
                        <span class="task-date">
                            ${new Date(task.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="task-edit" onclick="app.makeEditable(document.querySelector('[data-id=\"${task.id}\"].task-title'))">
                        ✏️
                    </button>
                    <button class="task-delete" data-id="${task.id}">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    makeEditable(element) {
        const taskId = element.dataset.id;
        const currentTitle = element.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentTitle;
        input.className = 'task-edit-input';
        
        element.replaceWith(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== currentTitle) {
                this.editTask(taskId, newTitle);
            } else {
                this.render();
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('active-tasks').textContent = active;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('completion-rate').textContent = `${rate}%`;
    }
}

// Initialize app
const app = new TodoApp();
