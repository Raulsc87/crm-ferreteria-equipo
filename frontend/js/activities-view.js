import { activityTypes, formatDeadline } from './activities.js';

function template(id) { return document.getElementById(id).content.cloneNode(true); }
function message(content, selector, value) { const element = content.querySelector(selector); element.textContent = value; element.hidden = !value; }

export function renderActivityForm(container, state) {
  const content = template('activity-create'), form = content.querySelector('form');
  for (const field of ['tipo', 'descripcion', 'vence_en']) {
    const input = form.elements[field], error = state.fields[field] || '';
    input.value = state.form[field]; input.disabled = Boolean(state.busy);
    input.classList.toggle('is-invalid', Boolean(error)); input.setAttribute('aria-invalid', String(Boolean(error)));
    message(content, '#activity-' + field + '-error', error);
  }
  message(content, '[data-activity-form-error]', state.error);
  message(content, '[data-activity-form-notice]', state.notice);
  form.setAttribute('aria-busy', String(Boolean(state.busy)));
  const button = form.querySelector('button'); button.disabled = Boolean(state.busy);
  button.textContent = state.busy === 'create' ? 'Registrando actividad…' : 'Registrar actividad';
  container.append(content);
}

export function renderActivities(container, state) {
  const content = template('activities-view');
  content.querySelector('[name=estado]').value = state.filter;
  message(content, '[data-activity-status]', state.busy ? 'Guardando el estado…' : state.loading ? 'Cargando actividades…' : !state.listError && !state.items.length ? 'No hay actividades para este filtro.' : '');
  message(content, '[data-activity-list-error]', state.listError);
  message(content, '[data-activity-error]', state.error);
  message(content, '[data-activity-notice]', state.notice);
  const list = content.querySelector('[data-activity-list]');
  if (!state.loading && !state.listError) for (const row of state.items) {
    const item = document.createElement('article'); item.dataset.activityId = row.id;
    const visualState = row.completada ? 'activity-completed' : row.vencida ? 'activity-overdue' : 'activity-pending';
    item.className = `activity-card ${visualState} card mb-3 text-break`;
    const body = document.createElement('div'); body.className = 'card-body';
    const header = document.createElement('div'); header.className = 'activity-card-header d-flex flex-wrap align-items-start justify-content-between gap-2';
    const title = document.createElement('h3'); title.className = 'h6 mb-0'; title.textContent = activityTypes[row.tipo] + ' · ' + row.cliente.nombre;
    const description = document.createElement('p'); description.className = 'activity-description'; description.textContent = row.descripcion;
    const deadline = document.createElement('p'); deadline.className = 'activity-deadline small text-body-secondary'; deadline.textContent = 'Vencimiento (Guatemala): ' + formatDeadline(row.vence_en);
    const status = document.createElement('p'); status.dataset.activityState = ''; status.className = `activity-status-badge ${visualState} small fw-semibold mb-0`;
    status.textContent = row.completada ? 'Completada' : row.vencida ? 'Pendiente · Vencida' : 'Pendiente';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'btn btn-outline-success btn-sm';
    button.dataset.activityAction = 'toggle'; button.dataset.id = row.id; button.disabled = Boolean(state.busy);
    button.textContent = state.busy === 'toggle-' + row.id ? 'Guardando…' : row.completada ? 'Marcar como pendiente' : 'Marcar como completada';
    header.append(title, status); body.append(header, description, deadline, button); item.append(body); list.append(item);
  }
  if (state.busy) for (const control of content.querySelectorAll('button, select')) control.disabled = true;
  container.replaceChildren(content);
}
