'use strict';

// настройки страницы
document.title = 'Мои планы — личный блокнот';

const charset = document.createElement('meta');
charset.setAttribute('charset', 'UTF-8');

const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';

const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = 'css/style.css';

document.head.append(charset, viewport, stylesheet);

// основная страница блокнота
const notebook = document.createElement('main');
notebook.className = 'notebook';

// шапка
const header = document.createElement('header');
header.className = 'notebook-header';

const label = document.createElement('p');
label.className = 'notebook-label';
label.textContent = 'Личный блокнот';

const title = document.createElement('h1');
title.className = 'notebook-title';
title.textContent = 'Мои планы';

const subtitle = document.createElement('p');
subtitle.className = 'notebook-subtitle';
subtitle.textContent = 'по одному делу за раз';

header.append(label, title, subtitle);

// раздел задач
const tasksSection = document.createElement('section');
tasksSection.className = 'tasks-section';
tasksSection.setAttribute('aria-labelledby', 'tasks-title');

const tasksTitle = document.createElement('h2');
tasksTitle.id = 'tasks-title';
tasksTitle.className = 'tasks-title';
tasksTitle.textContent = 'Список дел';

const emptyMessage = document.createElement('p');
emptyMessage.className = 'empty-message';
emptyMessage.textContent = 'Пока здесь чистый лист. Всt начинается с одного дела.';

tasksSection.append(tasksTitle, emptyMessage);

// готовая структура
notebook.append(header, tasksSection);
document.body.append(notebook);