/**
 * Tehtävälista Pro - Logic v3.2
 */

let todos = JSON.parse(localStorage.getItem('todos_v3')) || [];
let currentFilter = 'all';
let todoToDelete = null;
let todoToEdit = null;
let errorTimeout = null;

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const errorMessage = document.getElementById('error-message');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');

const editModal = document.getElementById('edit-modal');
const editInput = document.getElementById('edit-input');
const confirmModal = document.getElementById('confirm-modal');

function init() {
    renderTodos();
    
    todoForm.addEventListener('submit', handleAddTodo);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    document.getElementById('cancel-edit').onclick = closeEditModal;
    document.getElementById('save-edit').onclick = saveEdit;
    document.getElementById('cancel-delete').onclick = () => confirmModal.classList.add('hidden');
    document.getElementById('confirm-delete').onclick = deleteTodo;

    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveEdit();
        if (e.key === 'Escape') closeEditModal();
    });
}

function handleAddTodo(e) {
    e.preventDefault();
    const text = todoInput.value.trim();
    
    if (!validateInput(text)) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.unshift(newTodo);
    saveAndRender();
    todoInput.value = '';
    todoInput.focus();
}

function validateInput(text) {
    if (text.length === 0) {
        showError('Kirjoita jotain ensin.');
        return false;
    }
    if (text.length > 100) {
        showError('Teksti on liian pitkä (max 100 merkkiä).');
        return false;
    }
    return true;
}

function showError(msg) {
    if (errorTimeout) clearTimeout(errorTimeout);
    errorMessage.textContent = msg;
    errorTimeout = setTimeout(() => errorMessage.textContent = '', 4000);
}

function saveAndRender() {
    localStorage.setItem('todos_v3', JSON.stringify(todos));
    renderTodos();
}

function renderTodos() {
    todoList.innerHTML = '';
    
    const filtered = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(todo => {
            todoList.appendChild(createTodoElement(todo));
        });
    }
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    const textId = `todo-text-${todo.id}`;

    const checkbox = document.createElement('div');
    checkbox.className = 'todo-checkbox';
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', todo.completed);
    checkbox.setAttribute('aria-labelledby', textId);
    checkbox.setAttribute('tabindex', '0');
    checkbox.onclick = () => toggleTodo(todo.id);
    checkbox.onkeydown = (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleTodo(todo.id));

    const textSpan = document.createElement('span');
    textSpan.id = textId;
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.textContent = '✎';
    editBtn.title = 'Muokkaa';
    editBtn.setAttribute('aria-label', `Muokkaa tehtävää: ${todo.text}`);
    editBtn.onclick = () => openEditModal(todo);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Poista';
    deleteBtn.setAttribute('aria-label', `Poista tehtävä: ${todo.text}`);
    deleteBtn.onclick = () => openDeleteModal(todo.id);

    li.append(checkbox, textSpan, editBtn, deleteBtn);
    return li;
}

function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    saveAndRender();
}

function openEditModal(todo) {
    todoToEdit = todo;
    editInput.value = todo.text;
    editModal.classList.remove('hidden');
    setTimeout(() => editInput.focus(), 50);
}

function closeEditModal() {
    editModal.classList.add('hidden');
    todoToEdit = null;
}

function saveEdit() {
    const newText = editInput.value.trim();
    if (validateInput(newText)) {
        todos = todos.map(t => t.id === todoToEdit.id ? {...t, text: newText} : t);
        closeEditModal();
        saveAndRender();
    }
}

function openDeleteModal(id) {
    todoToDelete = id;
    confirmModal.classList.remove('hidden');
}

function deleteTodo() {
    todos = todos.filter(t => t.id !== todoToDelete);
    confirmModal.classList.add('hidden');
    saveAndRender();
}

init();
