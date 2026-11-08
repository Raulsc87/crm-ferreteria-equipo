export const activityTypes = { llamada: 'Llamada', reunion: 'Reunión', tarea: 'Tarea' };
const zone = 'America/Guatemala';
export function formatDeadline(value) {
  return value ? new Intl.DateTimeFormat('es-GT', { timeZone: zone, dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'Sin vencimiento';
}
export function deadlineFromGuatemala(value) {
  if (!value) return undefined; // El contrato admite omitir el campo, no enviar null ni vacío.
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  const invalid = () => { throw Object.assign(new Error('Revise el vencimiento.'), { fields: { vence_en: 'Ingrese una fecha y hora válidas de Guatemala, o deje el campo vacío.' } }); };
  if (!match) return invalid();
  const [, year, month, day, hour, minute] = match.map(Number);
  const wallTime = Date.UTC(year, month - 1, day, hour, minute);
  if (year < 1000 || year > 9999 || new Date(wallTime).toISOString().slice(0, 16) !== value) return invalid();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  function localTime(instant) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(part => [part.type, part.value]));
    return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
  }
  // Ajustar con la zona explícita, nunca con la zona local del equipo.
  let instant = wallTime;
  for (let attempt = 0; attempt < 3; attempt++) instant += wallTime - localTime(instant);
  if (localTime(instant) !== wallTime || new Date(instant).getUTCFullYear() > 9999) return invalid();
  return new Date(instant).toISOString();
}

export function createActivities({ api, changed, missingClient }) {
  const state = {};
  let generation = 0, listRequest = 0;
  function reset() {
    generation++;
    Object.assign(state, { filter: '', items: [], loading: false, listError: '', error: '', notice: '', busy: '',
      clientId: null, form: { tipo: 'llamada', descripcion: '', vence_en: '' }, fields: {} });
  }
  function show(changes) { Object.assign(state, changes); changed(); }
  function openClient(id) {
    if (state.busy) return;
    show({ clientId: id, form: { tipo: 'llamada', descripcion: '', vence_en: '' }, fields: {}, error: '', notice: '' });
  }
  async function loadList(filter = state.filter) {
    const version = ++listRequest, session = generation;
    show({ filter, loading: true, items: [], listError: '' });
    try {
      const items = await api('/actividades' + (filter ? '?estado=' + encodeURIComponent(filter) : ''));
      if (session === generation && version === listRequest) show({ items, loading: false });
    } catch (error) {
      if (session === generation && version === listRequest) show({ loading: false, listError: error.message });
    }
  }
  async function save() {
    if (state.busy || state.clientId === null) return;
    const session = generation, clientId = state.clientId;
    show({ busy: 'create', fields: {}, error: '', notice: '' });
    try {
      const body = { tipo: state.form.tipo, descripcion: state.form.descripcion };
      const deadline = deadlineFromGuatemala(state.form.vence_en);
      if (deadline !== undefined) body.vence_en = deadline;
      await api('/clientes/' + clientId + '/actividades', { method: 'POST', body });
      if (session !== generation) return;
      show({ form: { tipo: 'llamada', descripcion: '', vence_en: '' }, notice: 'La actividad se registró correctamente.' });
      await loadList();
    } catch (error) {
      if (session === generation) {
        show({ error: error.status === 404 ? 'El cliente ya no está disponible en su cartera. Se actualizó la vista.' : error.message, fields: error.fields || {} });
        if (error.status === 404) { await loadList(); if (session === generation) await missingClient(clientId); }
      }
    } finally { if (session === generation) show({ busy: '' }); }
  }
  async function toggle(id) {
    const row = state.items.find(item => item.id === id);
    if (state.busy || !row) return;
    const session = generation;
    show({ busy: 'toggle-' + id, error: '', notice: '' });
    try {
      await api('/actividades/' + id, { method: 'PATCH', body: { completada: !row.completada } });
      if (session !== generation) return;
      show({ notice: 'El estado de la actividad se actualizó correctamente.' });
      await loadList();
    } catch (error) {
      if (session === generation) {
        show({ error: error.status === 404 ? 'La actividad ya no está disponible en su cartera. Se actualizó la lista.' : error.message });
        if (error.status === 404) { await loadList(); if (session === generation) await missingClient(row.cliente.id); }
      }
    } finally { if (session === generation) show({ busy: '' }); }
  }
  reset();
  return { state, reset, openClient, loadList, save, toggle };
}
