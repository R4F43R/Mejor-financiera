document.addEventListener('DOMContentLoaded', function() {
            // Elementos del DOM
            const taskInput = document.getElementById('taskInput');
            const categorySelect = document.getElementById('categorySelect');
            const prioritySelect = document.getElementById('prioritySelect');
            const addButton = document.getElementById('addButton');
            const taskList = document.getElementById('taskList');
            const totalCount = document.getElementById('totalCount');
            const completedCount = document.getElementById('completedCount');
            const pendingCount = document.getElementById('pendingCount');
            const filterButtons = document.querySelectorAll('.filter-btn');
            const clearBtn = document.getElementById('clearBtn');
            
            // Variables de estado
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            let currentFilter = 'all';
            
            // Inicializar la aplicación
            renderTasks();
            updateCounters();
            
            // Función para agregar tarea
            function addTask() {
                const taskText = taskInput.value.trim();
                const category = categorySelect.value;
                const priority = prioritySelect.value;
                
                if (taskText !== '') {
                    const newTask = {
                        id: Date.now(),
                        text: taskText,
                        category: category,
                        priority: priority,
                        completed: false,
                        createdAt: new Date().toISOString()
                    };
                    
                    tasks.unshift(newTask);
                    saveTasks();
                    renderTasks();
                    updateCounters();
                    
                    // Resetear el input
                    taskInput.value = '';
                    taskInput.focus();
                    
                    // Animación de scroll
                    taskList.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
            
            // Función para renderizar tareas
            function renderTasks() {
                // Filtrar tareas según el filtro seleccionado
                let filteredTasks = tasks;
                if (currentFilter === 'completed') {
                    filteredTasks = tasks.filter(task => task.completed);
                } else if (currentFilter === 'pending') {
                    filteredTasks = tasks.filter(task => !task.completed);
                }
                
                // Actualizar la lista de tareas
                if (filteredTasks.length > 0) {
                    taskList.innerHTML = filteredTasks.map(task => `
                        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                            <div class="priority priority-${task.priority}"></div>
                            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                            <div class="task-content">
                                <div class="task-text">${task.text}</div>
                                <div class="task-meta">
                                    <span class="task-category category-${task.category}">
                                        ${getCategoryName(task.category)}
                                    </span>
                                    <span><i class="far fa-calendar"></i> ${formatDate(task.createdAt)}</span>
                                    <span><i class="fas fa-flag"></i> ${getPriorityName(task.priority)}</span>
                                </div>
                            </div>
                            <div class="task-actions">
                                <div class="delete-btn">
                                    <i class="fas fa-trash"></i>
                                </div>
                            </div>
                        </li>
                    `).join('');
                } else {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>¡No hay tareas ${getFilterMessage()}!</p>
                            <p>${getFilterSuggestion()}</p>
                        </div>
                    `;
                }
                
                // Agregar event listeners a los elementos recién creados
                document.querySelectorAll('.task-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', toggleTaskStatus);
                });
                
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', deleteTask);
                });
            }
            
            // Función para obtener nombre de categoría
            function getCategoryName(category) {
                const categories = {
                    'personal': 'Personal',
                    'work': 'Trabajo',
                    'shopping': 'Compras',
                    'study': 'Estudio',
                    'other': 'Otro'
                };
                return categories[category] || 'Otro';
            }
            
            // Función para obtener nombre de prioridad
            function getPriorityName(priority) {
                const priorities = {
                    'low': 'Baja',
                    'medium': 'Media',
                    'high': 'Alta'
                };
                return priorities[priority] || 'Media';
            }
            
            // Función para formatear fecha
            function formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
            
            // Función para obtener mensaje de filtro
            function getFilterMessage() {
                return currentFilter === 'all' ? '' : 
                       currentFilter === 'completed' ? 'completadas' : 'pendientes';
            }
            
            // Función para obtener sugerencia de filtro
            function getFilterSuggestion() {
                if (tasks.length === 0) return 'Agrega tu primera tarea usando el formulario superior.';
                
                if (currentFilter === 'completed' && tasks.some(t => !t.completed)) {
                    return 'Prueba cambiando al filtro "Pendientes" para ver tus tareas activas.';
                }
                
                if (currentFilter === 'pending' && tasks.some(t => t.completed)) {
                    return 'Prueba cambiando al filtro "Completadas" para ver tus logros.';
                }
                
                return 'Prueba cambiando al filtro "Todas" para ver todas tus tareas.';
            }
            
            // Función para cambiar estado de tarea
            function toggleTaskStatus(e) {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                const task = tasks.find(t => t.id === taskId);
                
                if (task) {
                    task.completed = e.target.checked;
                    saveTasks();
                    updateCounters();
                    
                    // Aplicar clase para transición
                    taskItem.classList.toggle('completed', task.completed);
                    
                    // Si estamos en un filtro específico, eliminar la tarea de la vista
                    if ((currentFilter === 'completed' && !task.completed) || 
                        (currentFilter === 'pending' && task.completed)) {
                        taskItem.classList.add('slide-out');
                        setTimeout(() => {
                            renderTasks();
                        }, 400);
                    }
                }
            }
            
            // Función para eliminar tarea
            function deleteTask(e) {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.id);
                
                // Animación de eliminación
                taskItem.classList.add('slide-out');
                
                setTimeout(() => {
                    tasks = tasks.filter(t => t.id !== taskId);
                    saveTasks();
                    renderTasks();
                    updateCounters();
                }, 400);
            }
            
            // Función para actualizar contadores
            function updateCounters() {
                const total = tasks.length;
                const completed = tasks.filter(t => t.completed).length;
                const pending = total - completed;
                
                totalCount.textContent = total;
                completedCount.textContent = completed;
                pendingCount.textContent = pending;
            }
            
            // Función para guardar tareas en localStorage
            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
            
            // Función para cambiar filtro
            function setFilter(filter) {
                currentFilter = filter;
                
                // Actualizar botones activos
                filterButtons.forEach(btn => {
                    if (btn.dataset.filter === filter) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                
                renderTasks();
            }
            
            // Función para limpiar todas las tareas
            function clearAllTasks() {
                if (tasks.length > 0 && confirm('¿Estás seguro de que deseas eliminar todas las tareas?')) {
                    tasks = [];
                    saveTasks();
                    renderTasks();
                    updateCounters();
                }
            }
            
            // Event listeners
            addButton.addEventListener('click', addTask);
            
            taskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
            
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    if (this.dataset.filter) {
                        setFilter(this.dataset.filter);
                    }
                });
            });
            
            clearBtn.addEventListener('click', clearAllTasks);
        });