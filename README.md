TaskFlow is a simple, responsive web-app for productivity using vanilla JavaScript. It provides a clean 3-column layout — sidebar, task list, quick-add form, stats panel and task detail view — with built-in Pomodoro timer functionality. You can add, edit, delete, filter, search and sort tasks, with all data stored in localStorage. The app demonstrates JS core concepts like closures, ES6 modules, DOM manipulation and event-loop. It’s ideal as a minimal task-management dashboard.

*JavaScript Concepts Used:
Closures - TaskManager aur Storage module private state maintain karte hain
Higher Order Functions (HOF) - filterTasks, sortTasks, searchTasks ke liye
Event Loop - Timers ke liye setInterval use kiya
ES6 Modules - Code ko organized modules mein structure kiya
DOM Manipulation - Dynamic task rendering
Control Flow - Form validation aur priority rules

* Module Breakdown:
1. storage.js
-LocalStorage save/load operations
-Theme storage

2. taskManager.js
-Closure for private task state
-CRUD operations (Add, Update, Delete)
-Timer management (Event Loop)
-HOF for filtering, sorting, searching

3. ui.js
-DOM manipulation
-Task rendering
-Stats display
-Detail view

4. modal.js
-Add/Edit task modal
-Form validation (Control Flow)

5. handlers.js
-Event handlers for actions
-Timer toggle, Complete, Edit, Delete

6. utils.js
-Sorting functions (HOF)
-Search functions (HOF)
-Filter functions (HOF)
-Theme utilities

7. main.js
-Main entry point
-App initialization
-Event listeners setup
-State management
