'use strict';

document.title = 'My plans';

function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const charset = element('meta');
charset.setAttribute('charset', 'UTF-8');

const viewport = element('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';

const stylesheet = element('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = 'css/style.css';

document.head.append(charset, viewport, stylesheet);

// Основной экран
const main = element('main', 'planner');
const header = element('header', 'page-header');
const title = element('h1', '', 'My plans');
title.lang = 'en';
header.append(title);

const section = element('section');
const heading = element('div', 'list-heading');
const sectionTitle = element('h2', '', 'Мои задачи');
sectionTitle.id = 'tasks-title';
section.setAttribute('aria-labelledby', sectionTitle.id);

const count = element('span', 'count');
heading.append(sectionTitle, count);

const list = element('ul', 'task-list');
const empty = element('p', 'empty', 'Пока пусто. Нажми +, чтобы записать первое дело.');
const notice = element('p', 'notice');
notice.setAttribute('role', 'status');

section.append(heading, empty, list, notice);
main.append(header, section);

const addButton = element('button', 'add-button');
addButton.type = 'button';
addButton.title = 'Добавить задачу';
addButton.setAttribute('aria-label', 'Добавить задачу');
addButton.setAttribute('aria-haspopup', 'dialog');

// Одна форма для создания и редактирования
const dialog = element('dialog', 'task-dialog');
dialog.setAttribute('aria-labelledby', 'form-title');

const form = element('form', 'task-form');
const formHeader = element('div', 'form-header');
const formTitle = element('h2');
formTitle.id = 'form-title';

const closeButton = element('button', 'close-button', '×');
closeButton.type = 'button';
closeButton.setAttribute('aria-label', 'Закрыть форму');
closeButton.addEventListener('click', () => dialog.close());
formHeader.append(formTitle, closeButton);

function field(labelText, control) {
  const label = element('label', 'field');
  label.append(element('span', '', labelText), control);
  return label;
}

const nameInput = element('input');
nameInput.type = 'text';
nameInput.placeholder = 'Например, собрать макет';
nameInput.required = true;

const descriptionInput = element('textarea');
descriptionInput.rows = 3;
descriptionInput.placeholder = 'Детали, ссылка или короткая заметка';

const plannedInput = element('input');
plannedInput.type = 'date';

const deadlineInput = element('input');
deadlineInput.type = 'date';

const dates = element('div', 'date-fields');
dates.append(
  field('Когда сделать', plannedInput),
  field('Дедлайн', deadlineInput)
);

const saveButton = element('button', 'save-button', 'Сохранить');
saveButton.type = 'submit';

form.append(
  formHeader,
  field('Название задачи', nameInput),
  element('p', 'form-hint', 'Остальные поля — по желанию.'),
  field('Описание', descriptionInput),
  dates,
  saveButton
);

dialog.append(form);
document.body.append(main, addButton, dialog);

// Данные
const storageKey = 'my-plans.tasks.v1';
let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) tasks = saved;
} catch {
  notice.textContent = 'Не удалось загрузить сохранённый список.';
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    notice.textContent = '';
  } catch {
    notice.textContent = 'Изменения видны сейчас, но сохранить их в браузере не удалось.';
  }
}

let editingId = null;

function openForm(task = null) {
  editingId = task?.id ?? null;
  form.reset();
  nameInput.setCustomValidity('');
  formTitle.textContent = task ? 'Изменить задачу' : 'Новая задача';
  nameInput.value = task?.name ?? '';
  descriptionInput.value = task?.description ?? '';
  plannedInput.value = task?.planned ?? '';
  deadlineInput.value = task?.deadline ?? '';

  dialog.showModal();
  nameInput.focus();
}

addButton.addEventListener('click', () => openForm());

nameInput.addEventListener('input', () => {
  nameInput.setCustomValidity('');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  if (!name) {
    nameInput.setCustomValidity('Введи название задачи.');
    nameInput.reportValidity();
    return;
  }

  const values = {
    name,
    description: descriptionInput.value.trim(),
    planned: plannedInput.value,
    deadline: deadlineInput.value
  };

  if (editingId === null) {
    tasks.push({ id: crypto.randomUUID(), done: false, ...values });
  } else {
    const task = tasks.find((item) => item.id === editingId);
    Object.assign(task, values);
  }

  saveTasks();
  dialog.close();
  renderTasks();
  addButton.focus();
});

// Отображение
function dateTag(label, value, className) {
  const tag = element('span', `date-tag ${className}`);
  const date = element('time');
  date.dateTime = value;
  date.textContent = value.split('-').reverse().join('.');
  tag.append(`${label} `, date);
  return tag;
}

function renderTasks() {
  list.replaceChildren();
  count.textContent = String(tasks.length).padStart(2, '0');
  empty.hidden = tasks.length > 0;

  for (const task of tasks) {
    const row = element('li', 'task-row');
    row.classList.toggle('is-done', task.done);

    const check = element('input', 'task-check');
    check.type = 'checkbox';
    check.checked = task.done;
    check.setAttribute('aria-label', `Выполнено: ${task.name}`);
    check.addEventListener('change', () => {
      task.done = check.checked;
      row.classList.toggle('is-done', task.done);
      saveTasks();
    });

    const content = element('div', 'task-content');
    content.append(element('h3', 'task-name', task.name));

    if (task.description) {
      content.append(element('p', 'description', task.description));
    }

    if (task.planned || task.deadline) {
      const tags = element('div', 'tags');
      if (task.planned) {
        tags.append(dateTag('В планах', task.planned, 'planned'));
      }
      if (task.deadline) {
        tags.append(dateTag('Дедлайн', task.deadline, 'deadline'));
      }
      content.append(tags);
    }

    const actions = element('div', 'actions');
    const edit = element('button', 'text-button', 'Изменить');
    const remove = element('button', 'text-button', 'Удалить');

    edit.type = remove.type = 'button';
    edit.addEventListener('click', () => openForm(task));
    remove.addEventListener('click', () => {
      if (!window.confirm(`Удалить задачу «${task.name}»?`)) return;
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
      addButton.focus();
    });

    actions.append(edit, remove);
    content.append(actions);
    row.append(check, content);
    list.append(row);
  }
}

renderTasks();