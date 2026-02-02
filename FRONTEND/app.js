// API Base URL
const API_URL = 'http://localhost:5000/api';


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

    // Show password buttons
    document.querySelectorAll('.show-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    // Remember me functionality
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginEmail = document.getElementById('login-email');
    
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        loginEmail.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }
    
    // Save email when remember me changes
    rememberMeCheckbox.addEventListener('change', () => {
        if (rememberMeCheckbox.checked && loginEmail.value) {
            localStorage.setItem('rememberedEmail', loginEmail.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
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
    const rememberMe = document.getElementById('remember-me').checked;

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
            
            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            showApp();
            loadTasks();
        } else {
            console.error('Login error:', data.message || 'Erreur de connexion');
        }
    } catch (error) {
        console.error('Login error:', error);
        // Pas d'alerte, juste une erreur dans la console
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
            console.error('Register error:', data.message || 'Erreur d\'inscription');
        }
    } catch (error) {
        console.error('Register error:', error);
        // Pas d'alerte, juste une erreur dans la console
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
            console.error('Add task error:', data.message || 'Erreur lors de l\'ajout de la tâche');
        }
    } catch (error) {
        console.error('Add task error:', error);
        // Pas d'alerte, juste une erreur dans la console
    }
}

async function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
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
            tasks = tasks.filter(t => t.id !== taskId);
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
            const index = tasks.findIndex(t => t.id === taskId);
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

    // Afficher les tâches
    tasksContainer.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       id="checkbox-${task.id}"
                       onchange="toggleTask('${task.id}')">
            </div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
                    <span class="task-date">${formatDate(task.created_at)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn delete-btn" onclick="deleteTask('${task.id}')" title="Supprimer">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Fonctions globales pour les tâches
window.toggleTask = async function(id) {
    console.log('=== TOGGLE START ===');
    console.log('ID reçu:', id);
    console.log('Tasks actuelles:', tasks);
    
    const task = tasks.find(t => t.id === id);
    console.log('Task trouvée:', task);
    
    if (!task) {
        console.error('Task non trouvée!');
        return;
    }
    
    const checkbox = document.getElementById(`checkbox-${id}`);
    console.log('Checkbox trouvée:', checkbox);
    
    const originalCompleted = task.completed;
    const newCompleted = !originalCompleted;
    
    console.log('Original completed:', originalCompleted);
    console.log('New completed:', newCompleted);
    
    // Réinitialiser la case à son état original pendant la requête
    if (checkbox) {
        checkbox.checked = originalCompleted;
        console.log('Checkbox réinitialisée à:', originalCompleted);
    }
    
    try {
        const token = localStorage.getItem('token');
        console.log('Token disponible:', !!token);
        
        if (!token) {
            console.error('Pas de token!');
            // Pas d'alerte, juste une erreur dans la console
            return;
        }
        
        console.log('Envoi requête PUT vers:', `${API_URL}/todos/${id}`);
        console.log('Body:', JSON.stringify({ completed: newCompleted }));
        
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ completed: newCompleted })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            console.log('Mise à jour réussie!');
            // Mettre à jour seulement si le serveur a accepté
            task.completed = newCompleted;
            if (checkbox) {
                checkbox.checked = newCompleted;
            }
            renderTasks();
            updateStats();
        } else {
            const errorText = await response.text();
            console.error('Erreur toggle:', errorText);
            // Remettre la case à son état original
            if (checkbox) {
                checkbox.checked = originalCompleted;
            }
            // Pas d'alerte, juste une erreur dans la console
        }
    } catch (error) {
        console.error('Error updating task:', error);
        // Remettre la case à son état original
        if (checkbox) {
            checkbox.checked = originalCompleted;
        }
        // Pas d'alerte, juste une erreur dans la console
    }
    
    console.log('=== TOGGLE END ===');
};

window.deleteTask = async function(id) {
    console.log('Tentative de suppression tâche ID:', id);
    console.log('Token disponible:', !!localStorage.getItem('token'));
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        try {
            const token = localStorage.getItem('token');
            console.log('Envoi requête DELETE vers:', `${API_URL}/todos/${id}`);
            
            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                console.log('Suppression réussie, mise à jour locale');
                // Mettre à jour seulement si le serveur a confirmé
                tasks = tasks.filter(t => t.id !== id);
                renderTasks();
                updateStats();
            } else {
                const errorText = await response.text();
                console.error('Erreur suppression:', errorText);
                // Pas d'alerte, juste une erreur dans la console
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            // Pas d'alerte, juste une erreur dans la console
        }
    }
};

// Fonctions utilitaires
function getPriorityLabel(priority) {
    const labels = {
        low: '🟢 Basse',
        medium: '🟡 Moyenne', 
        high: '🔴 Haute'
    };
    return labels[priority] || '🟡 Moyenne';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize App
function init() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
        currentUser = JSON.parse(savedUser);
        showApp();
        loadTasks();
    } else {
        showAuth();
    }

    // Event Listeners
    setupEventListeners();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Fonctions manquantes
function sortTasks(tasks) {
    const sorted = [...tasks];
    
    if (currentSort === 'date') {
        sorted.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
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
