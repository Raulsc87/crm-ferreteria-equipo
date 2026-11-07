import { stageNames, allowedStages, isClosed } from './opportunities.js';

const money = value => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
const date = value => value ? new Intl.DateTimeFormat('es-GT', { timeZone: 'America/Guatemala', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Sin cierre';
function node(tag, text = '', className = '') { const element = document.createElement(tag); element.textContent = text; element.className = className; return element; }
function template(id) { return document.getElementById(id).content.cloneNode(true); }
function action(label, name, id) { const button = node('button', label, 'btn btn-outline-success btn-sm'); button.type = 'button'; button.dataset.opAction = name; if (id !== undefined) button.dataset.id = id; return button; }
function options(select, rows, value, empty) {
  if (empty) select.append(new Option(empty, ''));
  for (const row of rows) select.append(new Option(row.nombre, row.id));
  select.value = value;
}
function fieldErrors(content, state, form) {
  for (const element of content.querySelectorAll('[data-op-error]')) {
    const error = state.errorForm === form ? state.fields[element.dataset.opError] || '' : '';
    element.textContent = error; element.hidden = !error;
    const input = content.querySelector('[name="' + element.dataset.opError + '"]');
    if (input) { input.classList.toggle('is-invalid', Boolean(error)); input.setAttribute('aria-invalid', String(Boolean(error))); }
  }
}

export function renderOpportunities(container, state) {
  const content = template('opportunities-view');
  const status = content.querySelector('[data-op-status]');
  status.textContent = state.busy ? 'Guardando la operación…' : state.detailLoading ? 'Cargando detalle…' : state.loading && state.mode === 'list' ? 'Cargando oportunidades…' : '';
  status.hidden = !status.textContent;
  for (const [selector, message] of [['[data-op-error-summary]', state.error], ['[data-op-notice]', state.notice]]) {
    const element = content.querySelector(selector); element.textContent = message; element.hidden = !message;
  }
  const body = content.querySelector('[data-op-body]');
  if (state.mode === 'list') renderList(body, state);
  else if (state.mode === 'create') renderCreate(body, state);
  else if (state.selected) renderDetail(body, state);
  if (state.busy) for (const control of content.querySelectorAll('button, input, select, textarea')) control.disabled = true;
  container.replaceChildren(content);
}

function renderList(container, state) {
  const content = template('opportunities-list'), select = content.querySelector('[name=etapa]');
  options(select, Object.entries(stageNames).map(([id, nombre]) => ({ id, nombre })), state.filter, 'Todas las etapas');
  const status = content.querySelector('[data-op-list-message]'); status.textContent = state.listError || (!state.loading && !state.items.length ? 'No hay oportunidades para este filtro.' : '');
  status.classList.toggle('alert', Boolean(state.listError)); status.classList.toggle('alert-danger', Boolean(state.listError)); status.hidden = !status.textContent;
  if (!state.loading && !state.listError) {
    const board = content.querySelector('[data-op-board]');
    for (const stage of ['prospecto', 'calificado', 'propuesta', 'negociacion']) {
      const column = node('section', '', 'col-12 col-md-6 col-xl-3'); column.dataset.boardStage = stage;
      const panel = node('div', '', 'bg-body-tertiary rounded-3 p-3 h-100'); panel.append(node('h3', stageNames[stage], 'h6'));
      const rows = state.items.filter(row => row.etapa === stage);
      if (!rows.length) panel.append(node('p', 'Sin oportunidades.', 'small text-body-secondary'));
      for (const row of rows) panel.append(summary(row));
      column.append(panel); board.append(column);
    }
    const closed = content.querySelector('[data-op-closed]');
    for (const row of state.items.filter(row => isClosed(row.etapa))) closed.append(summary(row));
    if (!closed.children.length) closed.append(node('p', 'No hay oportunidades cerradas para este filtro.', 'small text-body-secondary'));
  }
  container.append(content);
}
function summary(row) {
  const card = node('article', '', 'bg-white border rounded-3 p-3 mb-3 text-break');
  card.append(node('h4', row.titulo, 'h6'), node('p', row.cliente.nombre, 'small mb-1'), node('p', `${stageNames[row.etapa]} · ${row.probabilidad}%`, 'small mb-1'), node('p', money(row.total), 'fw-semibold mb-1'), node('p', 'Cierre: ' + date(row.fecha_cierre), 'small mb-2'));
  if (row.motivo_perdida) card.append(node('p', 'Motivo: ' + row.motivo_perdida, 'small'));
  card.append(action('Ver oportunidad', 'detail', row.id)); return card;
}
function choicesMessage(content, state) {
  const element = content.querySelector('[data-op-choices-message]');
  element.textContent = state.choicesLoading ? 'Consultando opciones…' : state.choicesError;
  element.hidden = !element.textContent;
}
function renderCreate(container, state) {
  const content = template('opportunity-create'), form = content.querySelector('form');
  options(form.elements.cliente_id, state.clients, state.create.cliente_id, 'Seleccione un cliente de su cartera');
  form.elements.titulo.value = state.create.titulo;
  choicesMessage(content, state); fieldErrors(content, state, 'create'); container.append(content);
}
function renderDetail(container, state) {
  const content = template('opportunity-detail'), opportunity = state.selected, closed = isClosed(opportunity.etapa);
  content.querySelector('[data-op-title]').textContent = opportunity.titulo;
  content.querySelector('[data-op-client]').textContent = opportunity.cliente.nombre;
  content.querySelector('[data-op-stage]').textContent = stageNames[opportunity.etapa] + ' · ' + opportunity.probabilidad + '%';
  content.querySelector('[data-op-total]').textContent = money(opportunity.total);
  content.querySelector('[data-op-closing]').textContent = 'Cierre (Guatemala): ' + date(opportunity.fecha_cierre);
  content.querySelector('[data-op-reason]').textContent = opportunity.motivo_perdida || '';
  content.querySelector('[data-op-readonly]').hidden = !closed;
  const title = content.querySelector('#op-title-form'); title.hidden = closed; title.elements.titulo.value = state.title; fieldErrors(title, state, 'title');
  const lines = content.querySelector('[data-op-lines]');
  for (const line of opportunity.productos) {
    const item = node('article', '', 'border rounded-3 p-3 mb-3 text-break'); item.dataset.lineId = line.id;
    item.append(node('h4', line.nombre, 'h6'), node('p', `Precio cotizado: ${money(line.precio_unitario)} · Cantidad: ${line.cantidad}`, 'small mb-1'), node('p', 'Subtotal: ' + money(line.subtotal), 'fw-semibold'));
    if (!closed) {
      const form = template('op-line-form'); form.querySelector('form').dataset.lineId = line.id;
      const input = form.querySelector('input'); input.id = 'op-quantity-' + line.id; input.value = state.quantities[line.id];
      const label = form.querySelector('label'); label.htmlFor = input.id;
      const error = form.querySelector('[data-op-error]'); error.id = input.id + '-error'; input.setAttribute('aria-describedby', error.id);
      form.querySelector('[data-op-action]').dataset.id = line.id;
      fieldErrors(form, state, 'quantity-' + line.id); item.append(form);
    }
    lines.append(item);
  }
  if (!opportunity.productos.length) lines.append(node('p', 'Todavía no hay productos cotizados.', 'text-body-secondary'));
  const add = content.querySelector('#op-add-form'); add.hidden = closed;
  options(add.elements.producto_id, state.products.map(row => ({ id: row.id, nombre: row.nombre + ' · catálogo ' + money(row.precio) })), state.add.producto_id, 'Seleccione un producto activo');
  add.elements.cantidad.value = state.add.cantidad; fieldErrors(add, state, 'add'); choicesMessage(content, state);
  const stage = content.querySelector('#op-stage-form'); stage.hidden = closed;
  options(stage.elements.etapa, allowedStages(opportunity.etapa).map(id => ({ id, nombre: stageNames[id] })), state.stage.etapa);
  stage.elements.motivo_perdida.value = state.stage.motivo_perdida;
  stage.querySelector('[data-loss-reason]').hidden = state.stage.etapa !== 'perdida'; fieldErrors(stage, state, 'stage');
  content.querySelector('[data-close-confirmation]').hidden = !state.confirming;
  content.querySelector('[data-confirm-stage]').textContent = 'Confirme el cierre como ' + (stageNames[state.stage.etapa] || '').toLowerCase() + '. La oportunidad quedará en modo consulta.';
  const history = content.querySelector('[data-op-history]');
  for (const entry of opportunity.historial) history.append(node('li', `${date(entry.fecha)} · ${stageNames[entry.etapa_anterior] || 'Inicio'} → ${stageNames[entry.etapa_nueva]} · ${entry.usuario}`, 'mb-2 text-break'));
  container.append(content);
}
