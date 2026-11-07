import { renderActivityForm } from './activities-view.js';

function template(id) { return document.getElementById(id).content.cloneNode(true); }
function text(parent, selector, value) { parent.querySelector(selector).textContent = value; }
function message(parent, selector, value) { const element = parent.querySelector(selector); element.textContent = value; element.hidden = !value; }
function button(label, action, id, disabled = false) {
  const element = document.createElement('button');
  element.type = 'button'; element.className = 'btn btn-outline-success btn-sm'; element.textContent = label;
  element.dataset.clientAction = action; if (id !== undefined) element.dataset.id = id;
  element.disabled = disabled; return element;
}

export function renderClients(container, state, activities) {
  const content = template('clients-view');
  const busy = state.saving || state.taking !== null || Boolean(activities.busy);
  for (const element of content.querySelectorAll('[data-client-action]')) element.disabled = busy;
  text(content, '[data-capacity]', state.capacityLoading ? 'Consultando cartera…' : state.capacity ? `${state.capacity.clientes} / ${state.capacity.maximo} clientes` : 'Cartera no disponible');
  message(content, '[data-capacity-error]', state.capacityError);
  message(content, '[data-client-error]', state.error);
  message(content, '[data-client-notice]', state.notice);
  const body = content.querySelector('[data-client-body]');
  if (['create', 'edit'].includes(state.mode)) renderForm(body, state);
  else if (state.mode === 'detail') renderDetail(body, state, activities);
  else renderList(body, state, state.mode === 'available');
  container.replaceChildren(content);
}

function renderList(container, state, available) {
  const content = template('clients-list');
  const form = content.querySelector('form'); form.hidden = available;
  form.elements.q.value = state.query;
  text(content, '[data-list-heading]', available ? 'Clientes disponibles' : 'Mis clientes');
  const loading = available ? state.availableLoading : state.loading;
  const error = available ? state.availableError : state.listError;
  const rows = available ? state.available : state.items;
  message(content, '[data-list-status]', loading ? 'Cargando clientes…' : !error && !rows.length ? (available ? 'No hay clientes disponibles.' : 'No se encontraron clientes para esta búsqueda.') : '');
  message(content, '[data-list-error]', error);
  const list = content.querySelector('[data-client-list]');
  if (!loading && !error) for (const row of rows) {
    const item = document.createElement('div'); item.className = 'list-group-item d-flex flex-wrap align-items-center justify-content-between gap-3';
    const identity = document.createElement('div'); identity.className = 'text-break';
    const name = document.createElement('p'); name.className = 'fw-semibold mb-1'; name.textContent = row.nombre; identity.append(name);
    if (!available) { const nit = document.createElement('p'); nit.className = 'small text-body-secondary mb-0'; nit.textContent = 'NIT: ' + row.nit; identity.append(nit); }
    // Disponibles solo expone id y nombre; no pedir ni inferir datos privados.
    const action = button(available ? (state.taking === row.id ? 'Tomando…' : 'Tomar cliente') : 'Ver detalle', available ? 'take' : 'detail', row.id, state.taking !== null || state.saving);
    item.append(identity, action); list.append(item);
  }
  container.append(content);
}

function renderDetail(container, state, activities) {
  if (state.detailLoading) { const loading = document.createElement('p'); loading.textContent = 'Cargando el detalle…'; loading.setAttribute('role', 'status'); container.append(loading); return; }
  if (!state.selected) return;
  const content = template('client-detail'), client = state.selected;
  text(content, '[data-detail-name]', client.nombre);
  for (const field of ['nit', 'telefono', 'correo']) text(content, '[data-detail-' + field + ']', client[field] || (field === 'correo' ? 'Sin correo' : 'CF'));
  const activity = content.querySelector('[data-activity-form-container]');
  if (activities.clientId === client.id) renderActivityForm(activity, activities);
  content.querySelector('[data-activity-action]').disabled = Boolean(activities.busy);
  container.append(content);
}

function renderForm(container, state) {
  const content = template('client-form'), form = content.querySelector('form');
  text(content, '[data-form-heading]', state.mode === 'edit' ? 'Editar cliente' : 'Crear cliente');
  form.setAttribute('aria-busy', String(state.saving));
  for (const field of ['nombre', 'nit', 'telefono', 'correo']) {
    const input = form.elements[field], error = state.fields[field] || '';
    input.value = state.form[field] ?? ''; input.disabled = state.saving;
    input.classList.toggle('is-invalid', Boolean(error)); input.setAttribute('aria-invalid', String(Boolean(error)));
    message(content, '#client-' + field + '-error', error);
  }
  for (const element of content.querySelectorAll('button')) element.disabled = state.saving;
  text(content, '[data-save-label]', state.saving ? 'Guardando…' : 'Guardar cliente');
  container.append(content);
}
