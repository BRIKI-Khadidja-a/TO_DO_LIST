// API Base URL


// State Management
let currentUser = null;
let tasks = [];
let currentFilter = 'all';
let currentSort = 'date';

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const tasksContainer = document.getElementById('tasks-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');


function setupEventListeners() {
    // Auth tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchAuthTab(tabName);
        });
    });

    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Register form
    registerForm.addEventListener('submit', handleRegister);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Add task form
    addTaskForm.addEventListener('submit', handleAddTask);

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks();
        });
    });

    // Sort select
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });
}

// Auth Functions
function switchAuthTab(tabName) {
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        form.classList.remove('active');
        if (form.id === `${tabName}-form`) {
            form.classList.add('active');
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            showApp();
            loadTasks();
        } else {
            alert(data.message || 'Erreur de connexion');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Erreur de connexion au serveur');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            showApp();
            loadTasks();
        } else {
            alert(data.message || 'Erreur d\'inscription');
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('Erreur de connexion au serveur');
    }
}

function handleLogout() {
    currentUser = null;
    tasks = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    showAuth();
}

function showAuth() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
}

function showApp() {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    userNameSpan.textContent = currentUser.name;
}

// Task Functions
async function loadTasks() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/todos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            tasks = await response.json();
            renderTasks();
            updateStats();
        } else {
            console.error('Failed to load tasks');
        }
    } catch (error) {
        console.error('Load tasks error:', error);
    }
}

async function handleAddTask(e) {
    e.preventDefault();
    const title = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (!title) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                title, 
                priority,
                completed: false
            })
        });

        if (response.ok) {
            const newTask = await response.json();
            tasks.push(newTask);
            taskInput.value = '';
            prioritySelect.value = 'medium';
            renderTasks();
            updateStats();
        } else {
            alert('Erreur lors de l\'ajout de la tâche');
        }
    } catch (error) {
        console.error('Add task error:', error);
        alert('Erreur de connexion au serveur');
    }
}

async function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/todos/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                completed: !task.completed 
            })
        });

        if (response.ok) {
            task.completed = !task.completed;
            renderTasks();
            updateStats();
        }
    } catch (error) {
        console.error('Toggle task error:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/todos/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            tasks = tasks.filter(t => t._id !== taskId);
            renderTasks();
            updateStats();
        }
    } catch (error) {
        console.error('Delete task error:', error);
    }
}

async function updateTask(taskId, updates) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/todos/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            const updatedTask = await response.json();
            const index = tasks.findIndex(t => t._id === taskId);
            if (index !== -1) {
                tasks[index] = updatedTask;
            }
            renderTasks();
            updateStats();
        }
    } catch (error) {
        console.error('Update task error:', error);
    }
}

function renderTasks() {
    // Filter tasks
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    // Sort tasks
    filteredTasks = sortTasks(filteredTasks);

    // Render
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>Aucune tâche</h3>
                <p>Ajoutez votre première tâche pour commencer !</p>
            </div>
        `;
        return;
    }

    tasksContainer.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');

    // Add event listeners
    filteredTasks.forEach(task => {
        const taskElement = document.getElementById(`task-${task._id}`);
        
        // Checkbox
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskComplete(task._id));

        // Edit button
        const editBtn = taskElement.querySelector('.edit');
        editBtn.addEventListener('click', () => enterEditMode(task._id));

        // Delete button
        const deleteBtn = taskElement.querySelector('.delete');
        deleteBtn.addEventListener('click', () => deleteTask(task._id));
    });
}

function createTaskHTML(task) {
    const date = new Date(task.createdAt || Date.now()).toLocaleDateString('fr-FR');
    const priorityLabels = {
        high: '🔴 Haute',
        medium: '🟡 Moyenne',
        low: '🟢 Basse'
    };

    return `
        <div class="task-item ${task.completed ? 'completed' : ''}" id="task-${task._id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="priority-badge ${task.priority || 'medium'}">${priorityLabels[task.priority || 'medium']}</span>
                    <span class="task-date">📅 ${date}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit">✏️</button>
                <button class="task-btn delete">🗑️</button>
            </div>
        </div>
    `;
}

function enterEditMode(taskId) {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const taskElement = document.getElementById(`task-${taskId}`);
    const priorityLabels = {
        high: '🔴 Haute',
        medium: '🟡 Moyenne',
        low: '🟢 Basse'
    };

    taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} disabled>
        <form class="task-edit-form" id="edit-form-${taskId}">
            <input type="text" class="task-edit-input" value="${escapeHtml(task.title)}" required>
            <select class="task-edit-priority">
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>🟢 Basse</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>🟡 Moyenne</option>
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>🔴 Haute</option>
            </select>
            <div class="task-edit-actions">
                <button type="submit" class="task-btn save">✅</button>
                <button type="button" class="task-btn cancel">❌</button>
            </div>
        </form>
    `;

    const form = document.getElementById(`edit-form-${taskId}`);
    const cancelBtn = form.querySelector('.cancel');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTitle = form.querySelector('.task-edit-input').value.trim();
        const newPriority = form.querySelector('.task-edit-priority').value;
        
        if (newTitle) {
            await updateTask(taskId, { title: newTitle, priority: newPriority });
        }
    });

    cancelBtn.addEventListener('click', () => renderTasks());
}

function sortTasks(tasks) {
    const sorted = [...tasks];
    
    if (currentSort === 'date') {
        sorted.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    } else if (currentSort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        sorted.sort((a, b) => {
            return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
        });
    } else if (currentSort === 'title') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('active-tasks').textContent = active;
    document.getElementById('high-priority-tasks').textContent = highPriority;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
