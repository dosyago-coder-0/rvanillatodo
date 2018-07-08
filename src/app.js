"use strict";
{
  const root = document.querySelector('.todoapp');
  const todos = load();
  let keyCounter = 0;

  openApp();

  function openApp() {
    render(App(), root);
    updateList();
    addEventListener('hashchange', routeHash);
    routeHash();
  }

  function newKey(prefix) {
    return `key-${prefix ? prefix + '-' : ''}${keyCounter++}`;
  }

  function load() {
    return JSON.parse(localStorage.getItem('todos')) || [];
  }

  function save() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function updateList(list = todos) {
    save();
    render(TodoList(list), root.querySelector('.todo-list')); 
    updateTodoCount();
    hideControlsIfEmpty();
  }
  
  function updateTodo(todo) {
    save();
    const node = root.querySelector(`[data-key="${todo.key}"]`);
    const newTodo = Todo(todo);
    render(newTodo, node, {replace:true});
    updateTodoCount();
  }

  function updateTodoCount() {
    const activeCount = todos.filter(t => !t.completed).length
    const node = root.querySelector('.todo-count');
    render(TodoCount({activeCount}), node, {replace:true});
    hideClearIfNoCompleted(activeCount);
  }

  function hideClearIfNoCompleted(activeCount) {
    if ( todos.length - activeCount ) {
      root.querySelector('.clear-completed').style.display = 'inline';
    } else {
      root.querySelector('.clear-completed').style.display = 'none';
    }
  }

  function addTodo(todo) {
    todos.push(todo);
    updateList();
  }

  function toggleCompleted(todoKey) {
    const todo = todos.find(({key}) => key == todoKey);
    todo.completed = !!(todo.completed ^ true);
    updateTodo(todo);
  }

  function editTodo(todoKey) {
    const todo = todos.find(({key}) => key == todoKey);
    todo.editing = true;
    updateTodo(todo);
    root.querySelector('.edit').focus();
  }

  function deleteTodo(todoKey) {
    const index = todos.findIndex(({key}) => key == todoKey);
    todos.splice(index,1); 
    updateList();
  }

  function saveTodo(todoKey) {
    const todo = todos.find(({key}) => key == todoKey);
    if ( ! todo || ! todo.editing ) {
      return;
    }
    const node = root.querySelector('input.edit');
    const text = node.value;
    if ( text.length == 0 ) {
      return deleteTodo(todoKey);
    }
    todo.editing = false;
    todo.text = text;
    updateTodo(todo);
  }

  function deleteCompleted() {
    const completed = todos.filter(({completed}) => completed);
    completed.forEach(({key}) => deleteTodo(key));
    updateList();
  }

  function toggleAll({target:{checked}}) {
    todos.forEach(t => t.completed = !!checked);
    updateList();
  }

  function listAll() {
    updateList(todos);
  }

  function listCompleted() {
    updateList(todos.filter( t => t.completed ));
  }

  function listActive() {
    updateList(todos.filter( t => !t.completed ));
  }

  function hideControlsIfEmpty() {
    if (todos.length) {
      root.querySelector('.main').style.display = 'block';
    } else {
      root.querySelector('.main').style.display = 'none';
    }
  }

  function saveTodoIfEnter(keyEvent,key) {
    if ( keyEvent.key !== 'Enter' ) {
      return;
    }
    saveTodo(key);
  }

  function newTodoIfEnter(keyEvent) {
    if ( keyEvent.key !== 'Enter' ) {
      return;
    }
    const {srcElement:source} = keyEvent;
    const text = source.value;
    const todo = {
      key: newKey('todo'),
      text,
      completed: false,
      editing: false
    };
    addTodo(todo);
    source.value = '';
  }

  function routeHash() {
    const hash = location.hash;
    switch(location.hash) {
      case "#/active":
        listActive();
        break;
      case "#/completed":
        listCompleted();
        break;
      case "#/":
      default:
        listAll();
        break;
        break;
    }
  }

  function TodoList(list) {
    return R`${list.map(todo => Todo(todo))}`
  }

  function TodoCount({activeCount}) {
    return R`
      <span class="todo-count">
        <strong>${activeCount}</strong>
        items left
      </span>
    `;
  }

  function Todo({key,text,completed,editing}) {
    return R`
      <li data-key=${key} class=${editing ? 'editing' : completed ? 'completed' : 'active'}>
        <div class="view">
          <input class="toggle" type="checkbox" 
            ${completed ? 'checked':''} click=${() => toggleCompleted(key)}>
          <label dblclick=${() => editTodo(key)}>${text}</label>
          <button class="destroy" click=${() => deleteTodo(key)}></button>
        </div>
        ${editing ? R`<input class=edit value=${text}
              keydown=${keyEvent => saveTodoIfEnter(keyEvent,key)}
              blur=${() => saveTodo(key)}>`
          : ''
        }
      </li>
    `;
  }

  function App() {
    return R`
      <header class="header">
        <h1>todos</h1>
        <input class="new-todo" placeholder="What needs to be done?" autofocus
          keydown=${newTodoIfEnter} 
        >
      </header>
      <section style="display:none" class="main">
        <input id="toggle-all" class="toggle-all" type="checkbox" click=${toggleAll}>
        <label for="toggle-all">Mark all as complete</label>
        <ul class="todo-list"></ul>
        <footer class="footer">
          <span class="todo-count"></span>
          <ul class="filters">
            <li>
              <a href="#/" class="selected">All</a>
            </li>
            <li>
              <a href="#/active">Active</a>
            </li>
            <li>
              <a href="#/completed">Completed</a>
            </li>
          </ul>
          <button class="clear-completed" click=${deleteCompleted}>Clear completed</button>
        </footer>
      </section>
    `;
  }
}
