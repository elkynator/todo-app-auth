/**
 * Todo App with Supabase Integration
 * Features: Real-time sync, cloud storage, offline support
 */

// Global variables and state
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;
let isLoading = false;
let isOnline = navigator.onLine;
let pollingInterval = null; // Changed from realtimeSubscription

// DOM Elements
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const taskTemplate = document.getElementById('task-template');
const emptyState = document.getElementById('empty-state');
const loadingIndicator = document.getElementById('loading-indicator');
const errorState = document.getElementById('error-state');
const retryBtn = document.getElementById('retry-btn');
const taskStats = document.getElementById('task-stats');
const statsText = document.getElementById('stats-text');
const bulkActions = document.getElementById('bulk-actions');
const clearCompletedBtn = document.getElementById('clear-completed');

// Filter elements
const filterButtons = document.querySelectorAll('.filter-btn');
const allCountSpan = document.getElementById('all-count');
const activeCountSpan = document.getElementById('active-count');
const completedCountSpan = document.getElementById('completed-count');

// Utility Functions
/**
 * Generate unique ID (fallback for offline mode)
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date for display
 */
function formatDate(date) {
    const now = new Date();
    const taskDate = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const compareDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    
    const diffTime = today - compareDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return `Today ${taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return taskDate.toLocaleDateString();
    }
}

/**
 * Sanitize user input
 */
function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Show/hide loading state
 */
function setLoadingState(loading) {
    isLoading = loading;
    loadingIndicator.style.display = loading ? 'block' : 'none';
    taskList.style.display = loading ? 'none' : 'block';
    emptyState.style.display = 'none';
    errorState.style.display = 'none';
    
    // Disable form during loading
    addBtn.disabled = loading || !taskInput.value.trim();
    taskInput.disabled = loading;
}

/**
 * Show error state
 */
function showErrorState(message = 'Unable to connect to the server') {
    errorState.style.display = 'block';
    errorState.querySelector('p').textContent = `⚠️ ${message}`;
    loadingIndicator.style.display = 'none';
    taskList.style.display = 'none';
    emptyState.style.display = 'none';
}

/**
 * Hide error state
 */
function hideErrorState() {
    errorState.style.display = 'none';
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: var(--success-color);' : ''}
        ${type === 'error' ? 'background: var(--danger-color);' : ''}
        ${type === 'info' ? 'background: var(--primary-color);' : ''}
        ${type === 'warning' ? 'background: var(--warning-color);' : ''}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Supabase Database Functions
/**
 * Check if Supabase is properly configured
 */
function isSupabaseConfigured() {
    return window.supabaseClient && 
           window.supabaseConfig?.url !== 'YOUR_SUPABASE_URL' &&
           window.supabaseConfig?.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
}

/**
 * Load all tasks from Supabase
 */
async function loadTasks() {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, falling back to localStorage');
        loadTasksFromLocalStorage();
        return;
    }

    try {
        setLoadingState(true);
        hideErrorState();

        const { data, error } = await window.supabaseClient
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        tasks = data || [];
        renderTasks();
        
        if (tasks.length > 0) {
            showNotification(`Loaded ${tasks.length} tasks`, 'success');
        }

    } catch (error) {
        console.error('Error loading tasks:', error);
        showErrorState('Failed to load tasks');
        showNotification('Failed to load tasks from server', 'error');
        
        // Fallback to localStorage
        loadTasksFromLocalStorage();
    } finally {
        setLoadingState(false);
    }
}

/**
 * Save task to Supabase
 */
async function saveTask(task) {
    if (!isSupabaseConfigured()) {
        saveTaskToLocalStorage(task);
        return task;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('todos')
            .insert([{
                text: task.text,
                completed: task.completed
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error saving task:', error);
        showNotification('Failed to save task', 'error');
        
        // Fallback: add to local array and localStorage
        task.id = task.id || generateId();
        task.created_at = task.created_at || new Date().toISOString();
        saveTaskToLocalStorage(task);
        return task;
    }
}

/**
 * Update task in Supabase
 */
async function updateTaskInDB(id, updates) {
    if (!isSupabaseConfigured()) {
        updateTaskInLocalStorage(id, updates);
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('todos')
            .update(updates)
            .eq('id', id);

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Failed to update task', 'error');
        updateTaskInLocalStorage(id, updates);
    }
}

/**
 * Delete task from Supabase
 */
async function deleteTaskFromDB(id) {
    if (!isSupabaseConfigured()) {
        deleteTaskFromLocalStorage(id);
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Failed to delete task', 'error');
        deleteTaskFromLocalStorage(id);
    }
}

/**
 * Clear completed tasks from Supabase
 */
async function clearCompletedTasksFromDB() {
    if (!isSupabaseConfigured()) {
        clearCompletedFromLocalStorage();
        return;
    }

    try {
        const { error } = await window.supabaseClient
            .from('todos')
            .delete()
            .eq('completed', true);

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Error clearing completed tasks:', error);
        showNotification('Failed to clear completed tasks', 'error');
        clearCompletedFromLocalStorage();
    }
}

// LocalStorage Fallback Functions
function loadTasksFromLocalStorage() {
    try {
        const savedTasks = localStorage.getItem('todoApp_tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                if (typeof task.created_at === 'string') {
                    task.created_at = new Date(task.created_at);
                }
            });
        }
        renderTasks();
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        tasks = [];
        renderTasks();
    }
}

function saveTaskToLocalStorage(task) {
    tasks.unshift(task);
    localStorage.setItem('todoApp_tasks', JSON.stringify(tasks));
}

function updateTaskInLocalStorage(id, updates) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        Object.assign(task, updates);
        localStorage.setItem('todoApp_tasks', JSON.stringify(tasks));
    }
}

function deleteTaskFromLocalStorage(id) {
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('todoApp_tasks', JSON.stringify(tasks));
}

function clearCompletedFromLocalStorage() {
    tasks = tasks.filter(task => !task.completed);
    localStorage.setItem('todoApp_tasks', JSON.stringify(tasks));
}

// Smart Polling for Updates (Replaces Real-time)
/**
 * Set up smart polling for live updates
 * Polls every 3 seconds when page is visible and user is active
 */
function setupPollingUpdates() {
    if (!isSupabaseConfigured()) {
        console.log('Polling updates not available without Supabase configuration');
        return;
    }

    try {
        let pollInterval;
        let lastActivity = Date.now();
        
        // Track user activity
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            });
        });
        
        // Start polling when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(pollInterval);
                console.log('Page hidden - polling stopped');
            } else {
                startPolling();
                console.log('Page visible - polling resumed');
            }
        });
        
        function startPolling() {
            pollInterval = setInterval(async () => {
                // Only poll if user has been active in last 30 seconds
                const timeSinceActivity = Date.now() - lastActivity;
                if (timeSinceActivity < 30000) {
                    try {
                        await loadTasks();
                        console.log('Polling update completed');
                    } catch (error) {
                        console.log('Polling update failed:', error.message);
                    }
                }
            }, 3000); // Poll every 3 seconds
        }
        
        // Start initial polling
        startPolling();
        
        // Store interval reference for cleanup
        pollingInterval = pollInterval;
        
        showNotification('🔄 Smart polling enabled (3s intervals)', 'success');
        console.log('Smart polling setup completed');
        
    } catch (error) {
        console.error('Failed to set up polling updates:', error);
        showNotification('⚠️ Polling setup failed (app still works)', 'warning');
    }
}

/**
 * Clean up polling interval
 */
function cleanupPollingUpdates() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        console.log('Polling cleanup completed');
    }
}

// Task Management Functions
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    allCountSpan.textContent = totalTasks;
    activeCountSpan.textContent = activeTasks;
    completedCountSpan.textContent = completedTasks;
    
    if (totalTasks === 0) {
        statsText.textContent = 'No tasks yet';
    } else {
        statsText.textContent = `${totalTasks} total, ${activeTasks} active, ${completedTasks} completed`;
    }
    
    bulkActions.style.display = completedTasks > 0 ? 'block' : 'none';
    clearCompletedBtn.disabled = completedTasks === 0 || isLoading;
}

// DOM Functions
function createTaskElement(task) {
    const taskElement = taskTemplate.content.cloneNode(true);
    const listItem = taskElement.querySelector('.task-item');
    const checkbox = taskElement.querySelector('.task-checkbox');
    const taskText = taskElement.querySelector('.task-text');
    const editBtn = taskElement.querySelector('.edit-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');
    const taskDate = taskElement.querySelector('.task-date');
    
    listItem.dataset.taskId = task.id;
    checkbox.checked = task.completed;
    taskText.textContent = task.text;
    taskDate.textContent = formatDate(task.created_at);
    
    if (task.completed) {
        listItem.classList.add('completed');
        checkbox.setAttribute('aria-label', 'Mark task as incomplete');
    } else {
        checkbox.setAttribute('aria-label', 'Mark task as complete');
    }
    
    // Event listeners
    checkbox.addEventListener('change', () => toggleTask(task.id));
    taskText.addEventListener('click', () => startEditTask(task.id));
    taskText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startEditTask(task.id);
        }
    });
    editBtn.addEventListener('click', () => startEditTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return listItem;
}

function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    taskList.innerHTML = '';
    
    if (!isLoading) {
        emptyState.style.display = filteredTasks.length === 0 ? 'block' : 'none';
        taskList.style.display = filteredTasks.length === 0 ? 'none' : 'block';
    }
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskElement.classList.add('adding');
        taskList.appendChild(taskElement);
    });
    
    updateStats();
}

// CRUD Operations
async function addTask(text) {
    const trimmedText = text.trim();
    if (!trimmedText) {
        showNotification('Please enter a task description', 'error');
        return;
    }
    
    if (trimmedText.length > 200) {
        showNotification('Task description is too long (max 200 characters)', 'error');
        return;
    }
    
    // Optimistic update
    const tempTask = {
        id: generateId(),
        text: sanitizeInput(trimmedText),
        completed: false,
        created_at: new Date().toISOString()
    };
    
    tasks.unshift(tempTask);
    renderTasks();
    taskInput.value = '';
    
    // Save to database
    const savedTask = await saveTask(tempTask);
    
    // Update local task with server data
    if (savedTask && savedTask.id !== tempTask.id) {
        const tempIndex = tasks.findIndex(t => t.id === tempTask.id);
        if (tempIndex !== -1) {
            tasks[tempIndex] = savedTask;
            renderTasks();
        }
    }
    
    showNotification('Task added!', 'success');
    taskInput.focus();
}

async function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Optimistic update
    task.completed = !task.completed;
    renderTasks();
    
    // Update in database
    await updateTaskInDB(taskId, { completed: task.completed });
    
    showNotification(
        task.completed ? 'Task completed!' : 'Task marked as active',
        task.completed ? 'success' : 'info'
    );
}

function startEditTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (editingTaskId) {
        cancelEdit();
    }
    
    editingTaskId = taskId;
    
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const taskText = taskElement.querySelector('.task-text');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.text;
    input.maxLength = 200;
    
    taskElement.classList.add('editing');
    taskText.parentNode.insertBefore(input, taskText.nextSibling);
    input.focus();
    input.select();
    
    const saveEdit = async () => {
        const newText = input.value.trim();
        if (newText && newText !== task.text) {
            await updateTask(taskId, newText);
        } else {
            cancelEdit();
        }
    };
    
    const cancelEdit = () => {
        taskElement.classList.remove('editing');
        input.remove();
        editingTaskId = null;
        taskText.focus();
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
}

async function updateTask(taskId, newText) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const sanitizedText = sanitizeInput(newText);
    
    // Optimistic update
    task.text = sanitizedText;
    renderTasks();
    editingTaskId = null;
    
    // Update in database
    await updateTaskInDB(taskId, { text: sanitizedText });
    
    showNotification('Task updated!', 'success');
}

async function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    // Optimistic update
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    taskElement.classList.add('removing');
    
    setTimeout(async () => {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
        
        // Delete from database
        await deleteTaskFromDB(taskId);
        
        showNotification('Task deleted!', 'success');
    }, 300);
}

async function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) return;
    
    if (!confirm(`Delete ${completedCount} completed task${completedCount === 1 ? '' : 's'}?`)) {
        return;
    }
    
    // Optimistic update
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
    
    // Update database
    await clearCompletedTasksFromDB();
    
    showNotification(`${completedCount} completed task${completedCount === 1 ? '' : 's'} deleted!`, 'success');
}

// Event Handlers
function handleSubmit(e) {
    e.preventDefault();
    if (!isLoading) {
        addTask(taskInput.value);
    }
}

function handleFilterClick(e) {
    const filter = e.target.dataset.filter;
    if (!filter) return;
    
    currentFilter = filter;
    
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    renderTasks();
}

function handleKeyboardShortcuts(e) {
    if (e.key === 'Escape' && editingTaskId) {
        cancelEdit();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        taskInput.focus();
    }
}

function cancelEdit() {
    if (!editingTaskId) return;
    
    const taskElement = document.querySelector(`[data-task-id="${editingTaskId}"]`);
    const input = taskElement.querySelector('.task-edit-input');
    
    if (input) {
        taskElement.classList.remove('editing');
        input.remove();
        editingTaskId = null;
    }
}

// Network Status
function handleOnlineStatus() {
    isOnline = navigator.onLine;
    
    if (isOnline) {
        showNotification('🌐 Back online - syncing data...', 'success');
        loadTasks();
    } else {
        showNotification('📴 You\'re offline - changes will sync when reconnected', 'warning');
    }
}

// Initialization
async function initApp() {
    console.log('Initializing Todo App with Supabase...');
    
    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
        showNotification('⚠️ Supabase not configured - using offline mode', 'warning');
        console.warn('Please configure Supabase in config.js for cloud sync');
    }
    
    // Set up event listeners
    todoForm.addEventListener('submit', handleSubmit);
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    retryBtn.addEventListener('click', loadTasks);
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    taskInput.addEventListener('input', (e) => {
        const isValid = e.target.value.trim().length > 0;
        addBtn.disabled = !isValid || isLoading;
    });
    
    // Network status monitoring
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Load initial data
    await loadTasks();
    
    // Set up polling updates (replaces real-time)
    setupPollingUpdates();
    
    // Focus input
    taskInput.focus();
    
    console.log('Todo App initialized successfully!');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    cleanupPollingUpdates();
});

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}