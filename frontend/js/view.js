import { renderClients } from './clients-view.js';
import { renderOpportunities } from './opportunities-view.js';
import { renderActivities } from './activities-view.js';
import { renderSummary } from './summary-view.js';

const sections = {
  clientes: ['Mi cartera', 'Organice sus clientes y el seguimiento de sus ventas.'],
  oportunidades: ['Oportunidades', 'Dé seguimiento a sus cotizaciones y a cada etapa de venta.'],
  actividades: ['Actividades', 'Organice sus llamadas, reuniones y tareas.'],
  resumen: ['Resumen', 'Consulte los resultados de sus ventas por mes.'],
};

export function selectedSection(hash) { return Object.hasOwn(sections, hash.slice(1)) ? hash.slice(1) : 'clientes'; }

export function render(root, state) {
  const template = state.restoring ? 'loading-view' : state.session ? 'session-view' : 'login-view';
  const content = document.getElementById(template).content.cloneNode(true);
  if (state.session && !state.restoring) renderSession(content, state);
  else if (!state.restoring) renderLogin(content, state);
  const notice = content.querySelector('[data-notice]');
  if (notice) { notice.textContent = state.notice; notice.hidden = !state.notice; }
  root.replaceChildren(content);
  document.title = (state.session ? sections[state.section][0] : 'Acceso') + ' · CRM Ferretería';
}

function renderSession(content, state) {
  content.querySelector('[data-name]').textContent = state.session.usuario.nombre;
  content.querySelector('[data-mail]').textContent = state.session.usuario.correo;
  content.querySelector('[data-heading]').textContent = sections[state.section][0];
  content.querySelector('[data-description]').textContent = sections[state.section][1];
  if (state.section === 'clientes') renderClients(content.querySelector('[data-section-body]'), state.clients, state.activities);
  if (state.section === 'oportunidades') renderOpportunities(content.querySelector('[data-section-body]'), state.opportunities);
  if (state.section === 'actividades') renderActivities(content.querySelector('[data-section-body]'), state.activities);
  if (state.section === 'resumen') renderSummary(content.querySelector('[data-section-body]'), state.summary);
  for (const link of content.querySelectorAll('[data-section]')) {
    const current = link.dataset.section === state.section;
    link.classList.toggle('active', current);
    if (current) link.setAttribute('aria-current', 'page');
  }
}

function renderLogin(content, state) {
  content.querySelector('[name=correo]').value = state.correo;
  const error = content.querySelector('[data-error]');
  error.textContent = state.error; error.hidden = !state.error;
  for (const field of ['correo', 'clave']) {
    const input = content.querySelector('[name=' + field + ']'), message = state.fields[field] || '';
    input.disabled = state.busy; input.classList.toggle('is-invalid', Boolean(message)); input.setAttribute('aria-invalid', String(Boolean(message)));
    const feedback = content.querySelector('#' + field + '-error'); feedback.textContent = message; feedback.hidden = !message;
  }
  content.querySelector('form').setAttribute('aria-busy', String(state.busy));
  content.querySelector('button[type=submit]').disabled = state.busy;
  content.querySelector('[data-submit-label]').textContent = state.busy ? 'Entrando…' : 'Entrar';
  content.querySelector('[data-spinner]').hidden = !state.busy;
}
