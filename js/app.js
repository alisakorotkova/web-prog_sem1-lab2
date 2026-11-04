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

const filters = element('div', 'filters');

const searchInput = element('input');
searchInput.type = 'search';
searchInput.placeholder = 'Название задачи';

const statusSelect = element('select');

for (const [value, text] of [
  ['all', 'Все задачи'],
  ['active', 'Активные'],
  ['done', 'Выполненные']
]) {
  const option = element('option', '', text);
  option.value = value;
  statusSelect.append(option);
}

const filterDate = element('input');
filterDate.type = 'date';
const sortSelect = element('select');

for (const [value, text] of [
  ['manual', 'Мой порядок'],
  ['planned', 'По дате плана'],
  ['deadline', 'По дедлайну']
]) {
  const option = element('option', '', text);
  option.value = value;
  sortSelect.append(option);
}

const resetFilters = element('button', 'text-button filter-reset', 'Сбросить');
resetFilters.type = 'button';
resetFilters.hidden = true;

filters.append(
  field('Поиск', searchInput),
  field('Состояние', statusSelect),
  field('Дата', filterDate),
  field('Порядок', sortSelect),
  resetFilters
);

section.append(heading, filters, empty, list, notice);
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
  const query = searchInput.value.trim().toLocaleLowerCase('ru');
  const status = statusSelect.value;
  const date = filterDate.value;
  const hasFilters = Boolean(query || status !== 'all' || date);

  const visibleTasks = tasks.filter((task) => {
    const matchesName = task.name.toLocaleLowerCase('ru').includes(query);
    const matchesStatus =
      status === 'all' || (status === 'done' ? task.done : !task.done);
    const matchesDate =
      !date || task.planned === date || task.deadline === date;

    return matchesName && matchesStatus && matchesDate;
  });

  const dateField = sortSelect.value;

  if (dateField !== 'manual') {
    visibleTasks.sort((first, second) => {
      const firstDate = first[dateField] || '';
      const secondDate = second[dateField] || '';

      if (!firstDate && !secondDate) return 0;
      if (!firstDate) return 1;
      if (!secondDate) return -1;

      return firstDate.localeCompare(secondDate);
    });
  }

  list.replaceChildren();
  resetFilters.hidden = !hasFilters;

  count.textContent = hasFilters
    ? `${visibleTasks.length} из ${tasks.length}`
    : String(tasks.length).padStart(2, '0');

  empty.hidden = visibleTasks.length > 0;
  empty.textContent = tasks.length === 0
    ? 'Пока пусто. Нажми +, чтобы записать первое дело.'
    : 'По этим условиям задач нет. Попробуй сбросить фильтры.';

  for (const task of visibleTasks) {
    const row = element('li', 'task-row');
    row.classList.toggle('is-done', task.done);

    const check = element('input', 'task-check');
    check.type = 'checkbox';
    check.checked = task.done;
    check.setAttribute('aria-label', `Выполнено: ${task.name}`);
    check.addEventListener('change', () => {
    task.done = check.checked;
    saveTasks();

    if (statusSelect.value === 'all') {
      row.classList.toggle('is-done', task.done);
    } else {
      renderTasks();
      statusSelect.focus();
    }
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

searchInput.addEventListener('input', renderTasks);
statusSelect.addEventListener('change', renderTasks);
sortSelect.addEventListener('change', renderTasks);
filterDate.addEventListener('input', renderTasks);

resetFilters.addEventListener('click', () => {
  searchInput.value = '';
  statusSelect.value = 'all';
  filterDate.value = '';
  renderTasks();
  searchInput.focus();
});


renderTasks();