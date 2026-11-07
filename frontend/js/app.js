import { API_BASE_URL } from './config.js';
import { createApi } from './api.js';
import { loadSession, saveSession, clearSession } from './session.js';
import { render, selectedSection } from './view.js';
import { createClients } from './clients.js';
import { createOpportunities } from './opportunities.js';
import { createActivities } from './activities.js';
import { createSummary } from './summary.js';

const root = document.getElementById('app');
const state = { session: loadSession(), section: selectedSection(location.hash), correo: '', fields: {}, error: '', notice: '', busy: false, restoring: false };
const api = createApi({ baseUrl: API_BASE_URL, getSession: () => state.session, onUnauthorized: expireSession });
const clients = createClients({ api, changed: () => update({}) });
state.clients = clients.state;
const opportunities = createOpportunities({ api, changed: () => update({}) });
state.opportunities = opportunities.state;
const activities = createActivities({ api, changed: () => update({}), missingClient: async id => {
  const session = state.session;
  if (clients.state.selected?.id === id) await clients.detail(id);
  if (state.session === session && session) await clients.refresh();
} });
state.activities = activities.state;
const summary = createSummary({ api, changed: () => update({}), updateCapacity: clients.updateCapacity });
state.summary = summary.state;

function update(changes) { Object.assign(state, changes); render(root, state); }
function expireSession(token) {
  // Una respuesta antigua no debe cerrar una sesión nueva.
  if (state.session?.token !== token) return;
  clearSession();
  clients.reset();
  opportunities.reset();
  activities.reset();
  summary.reset();
  update({ session: null, restoring: false, busy: false, fields: {}, error: '', notice: 'Su sesión venció o ya no tiene acceso. Inicie sesión de nuevo.' });
}

root.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id === 'summary-form') { event.preventDefault(); summary.load(form.elements.mes.value); return; }
  if (form.id === 'activity-create-form') { event.preventDefault(); activities.save(); return; }
  if (form.id === 'activity-filter-form') { event.preventDefault(); activities.loadList(form.elements.estado.value); return; }
  const opportunityForms = { 'op-filter-form': () => opportunities.list(form.elements.etapa.value), 'op-create-form': opportunities.saveCreate,
    'op-title-form': opportunities.title, 'op-add-form': opportunities.add, 'op-stage-form': () => opportunities.stage() };
  if (opportunityForms[form.id]) { event.preventDefault(); opportunityForms[form.id](); return; }
  if (form.hasAttribute('data-op-line-form')) { event.preventDefault(); opportunities.quantity(Number(form.dataset.lineId)); return; }
  if (event.target.id === 'client-search') {
    event.preventDefault(); clients.state.query = event.target.elements.q.value; clients.loadList(); return;
  }
  if (event.target.id === 'client-form-fields') { event.preventDefault(); clients.save(); return; }
  if (event.target.id !== 'login-form') return;
  event.preventDefault();
  if (state.busy) return;
  const correo = form.elements.correo.value.trim(), clave = form.elements.clave.value;
  form.elements.clave.value = ''; // La clave solo vive en esta petición, nunca en estado o almacenamiento.
  const fields = {};
  if (!correo || !correo.includes('@') || correo.length > 255) fields.correo = 'Ingrese su correo electrónico.';
  if (!clave) fields.clave = 'Ingrese su contraseña.';
  if (Object.keys(fields).length) { update({ correo, fields, error: '', notice: '' }); return; }
  update({ correo, fields: {}, error: '', notice: '', busy: true });
  try {
    const data = await api('/auth/login', { method: 'POST', body: { correo, clave }, authenticated: false });
    const { session, persisted } = saveSession(data);
    clients.reset();
    opportunities.reset();
    activities.reset();
    summary.reset();
    update({ session, busy: false, correo: '', notice: persisted ? '' : 'Su sesión se conservará mientras esta página permanezca abierta.' });
    clients.refresh();
    if (state.section === 'oportunidades') opportunities.list();
    if (state.section === 'actividades') activities.loadList();
    if (state.section === 'resumen') summary.load();
  } catch (error) {
    update({ busy: false, error: error.message, fields: error.fields || {} });
  }
});

// Conservar el borrador sin reconstruir el formulario mientras usted escribe.
root.addEventListener('input', event => {
  if (event.target.form?.id === 'client-search') clients.state.query = event.target.value;
  if (event.target.form?.id === 'client-form-fields' && Object.hasOwn(clients.state.form, event.target.name)) clients.state.form[event.target.name] = event.target.value;
  const form = event.target.form, field = event.target.name;
  if (form?.id === 'activity-create-form' && Object.hasOwn(activities.state.form, field)) activities.state.form[field] = event.target.value;
  if (form?.id === 'op-create-form') opportunities.state.create[field] = event.target.value;
  if (form?.id === 'op-title-form') opportunities.state.title = event.target.value;
  if (form?.id === 'op-add-form') opportunities.state.add[field] = event.target.value;
  if (form?.id === 'op-stage-form') opportunities.state.stage[field] = event.target.value;
  if (form?.hasAttribute('data-op-line-form')) opportunities.state.quantities[form.dataset.lineId] = event.target.value;
});
root.addEventListener('change', event => {
  if (event.target.form?.id === 'summary-form') { summary.load(event.target.value); return; }
  if (event.target.form?.id === 'op-stage-form' && event.target.name === 'etapa') {
    opportunities.state.stage.etapa = event.target.value; opportunities.cancelClosing();
  }
});

root.addEventListener('click', event => {
  const target = event.target.closest('[data-action], [data-section], [data-client-action], [data-op-action], [data-activity-action]');
  if (!target || !root.contains(target)) return;
  if (target.dataset.action === 'logout') {
    clients.reset();
    opportunities.reset();
    activities.reset();
    summary.reset();
    clearSession(); update({ session: null, restoring: false, busy: false, correo: '', fields: {}, error: '', notice: 'Ha cerrado su sesión.' });
  } else if (state.session && target.dataset.activityAction) {
    if (target.dataset.activityAction === 'new' && clients.state.selected) activities.openClient(clients.state.selected.id);
    else if (target.dataset.activityAction === 'toggle') activities.toggle(Number(target.dataset.id));
  } else if (state.session && target.dataset.opAction) {
    const action = target.dataset.opAction;
    if (action === 'list') opportunities.list();
    else if (action === 'create') opportunities.create();
    else if (action === 'detail') opportunities.detail(Number(target.dataset.id));
    else if (action === 'remove') opportunities.remove(Number(target.dataset.id));
    else if (action === 'confirm-stage') opportunities.stage(true);
    else if (action === 'cancel-stage') opportunities.cancelClosing();
  } else if (state.session && target.dataset.clientAction) {
    const action = target.dataset.clientAction;
    if (action === 'refresh') clients.refresh();
    else if (action === 'detail') clients.detail(Number(target.dataset.id));
    else if (action === 'take') clients.take(Number(target.dataset.id));
    else clients.open(action);
  } else if (state.session && target.dataset.section) {
    event.preventDefault(); location.hash = target.dataset.section;
  }
});
window.addEventListener('hashchange', () => {
  if (state.section === 'resumen' && selectedSection(location.hash) !== 'resumen') summary.leave();
  update({ section: selectedSection(location.hash) });
  if (state.session && state.section === 'clientes') clients.enter();
  if (state.session && state.section === 'oportunidades') opportunities.list();
  if (state.session && state.section === 'actividades') activities.loadList();
  if (state.session && state.section === 'resumen') summary.load();
});
window.addEventListener('storage', event => {
  if (event.key === 'crm-ferreteria.sesion' && event.newValue === null && state.session) expireSession(state.session.token);
});

async function start() {
  if (!state.session) { render(root, state); return; }
  const restoredSession = state.session;
  update({ restoring: true });
  try {
    // El perfil A6 de lectura permite resumen, sin ampliar permisos sobre productos.
    await api(state.section === 'resumen' ? '/reportes/resumen' : '/productos');
    if (state.session === restoredSession) {
      update({ restoring: false }); clients.refresh();
      if (state.section === 'oportunidades') opportunities.list();
      if (state.section === 'actividades') activities.loadList();
      if (state.section === 'resumen') summary.load();
    }
  } catch (error) {
    if (state.session === restoredSession) { clearSession(); update({ session: null, restoring: false, notice: error.message }); }
  }
}
start();
