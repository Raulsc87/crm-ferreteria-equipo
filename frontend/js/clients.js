export function createClients({ api, changed }) {
  const state = {};
  let generation = 0, listRequest = 0, detailRequest = 0, availableRequest = 0, capacityRequest = 0;
  function reset() {
    generation++;
    Object.assign(state, { mode: 'list', query: '', items: [], available: [], capacity: null, loading: false,
      availableLoading: false, capacityLoading: false, detailLoading: false, selected: null,
      form: {}, fields: {}, error: '', listError: '', availableError: '', capacityError: '', notice: '', saving: false, taking: null });
  }
  function show(changes) { Object.assign(state, changes); changed(); }

  async function loadList() {
    const version = ++listRequest, session = generation, query = state.query;
    show({ loading: true, listError: '', items: [] });
    try {
      const items = await api('/clientes?q=' + encodeURIComponent(query));
      // Solo la última búsqueda de la sesión actual puede publicar resultados.
      if (session === generation && version === listRequest) show({ items, loading: false });
    } catch (error) {
      if (session === generation && version === listRequest) show({ loading: false, listError: error.message });
    }
  }
  async function loadAvailable() {
    const version = ++availableRequest, session = generation;
    show({ availableLoading: true, availableError: '' });
    try {
      const available = await api('/clientes/disponibles');
      if (session === generation && version === availableRequest) show({ available, availableLoading: false });
    } catch (error) {
      if (session === generation && version === availableRequest) show({ availableLoading: false, availableError: error.message });
    }
  }
  async function loadCapacity() {
    const version = ++capacityRequest, session = generation;
    show({ capacityLoading: true, capacityError: '' });
    try {
      const { cartera } = await api('/reportes/resumen');
      if (session === generation && version === capacityRequest) show({ capacity: cartera, capacityLoading: false });
    } catch (error) {
      if (session === generation && version === capacityRequest) show({ capacityLoading: false, capacityError: error.message });
    }
  }
  async function refresh() { await Promise.all([loadList(), loadAvailable(), loadCapacity()]); }
  async function enter() {
    if (state.saving || state.taking !== null) return;
    const session = generation, id = state.selected?.id;
    // El panel puede haber reasignado el cliente mientras usted estaba en otra sección.
    if (id && ['detail', 'edit'].includes(state.mode)) await detail(id);
    if (session === generation) await refresh();
  }
  function updateCapacity(capacity) {
    capacityRequest++; // Un resumen nuevo invalida una consulta anterior de ocupación aún pendiente.
    show({ capacity, capacityLoading: false, capacityError: '' });
  }

  async function detail(id) {
    if (state.saving || state.taking !== null) return;
    const version = ++detailRequest, session = generation;
    show({ mode: 'detail', detailLoading: true, selected: null, error: '', notice: '', fields: {} });
    try {
      const selected = await api('/clientes/' + id);
      if (session === generation && version === detailRequest) show({ selected, detailLoading: false });
    } catch (error) {
      if (session === generation && version === detailRequest) show({ detailLoading: false, error: error.message });
    }
  }
  function open(mode) {
    if (state.saving || state.taking !== null) return;
    detailRequest++; // Cancelar la publicación de un detalle que ya no se está consultando.
    const form = mode === 'create' ? { nombre: '', nit: 'CF', telefono: '', correo: '' }
      : mode === 'edit' && state.selected ? clientFields(state.selected) : state.form;
    show({ mode, form, fields: {}, error: '', notice: '', detailLoading: false });
  }
  async function save() {
    if (state.saving || !['create', 'edit'].includes(state.mode)) return;
    const session = generation, editing = state.mode === 'edit';
    const body = clientFields(state.form);
    if (editing) {
      const original = clientFields(state.selected);
      for (const key of Object.keys(body)) if (body[key] === original[key]) delete body[key];
    }
    show({ saving: true, error: '', fields: {}, notice: '' });
    try {
      const selected = await api('/clientes' + (editing ? '/' + state.selected.id : ''), { method: editing ? 'PATCH' : 'POST', body });
      if (session !== generation) return;
      show({ selected, mode: 'detail', saving: false, query: '', notice: editing ? 'Los cambios se guardaron correctamente.' : 'El cliente se incorporó a su cartera.' });
      await refresh();
    } catch (error) {
      if (session === generation) {
        show({ saving: false, error: error.message, fields: error.fields || {} });
        if (error.status === 409) await loadCapacity();
      }
    }
  }
  async function take(id) {
    if (state.taking !== null || state.saving) return;
    const session = generation;
    show({ taking: id, error: '', notice: '' });
    try {
      await api('/clientes/' + id + '/tomar', { method: 'POST' });
      if (session !== generation) return;
      show({ taking: null, query: '', notice: 'El cliente se incorporó a su cartera.' });
      await refresh();
    } catch (error) {
      if (session === generation) {
        show({ taking: null, error: error.message });
        await Promise.all([loadAvailable(), loadCapacity()]);
      }
    }
  }
  reset();
  return { state, reset, refresh, enter, loadList, detail, open, save, take, updateCapacity };
}

function clientFields(value) {
  // Lista explícita del contrato: nunca enviar propietario ni propiedades de la respuesta.
  return { nombre: value.nombre ?? '', nit: value.nit ?? 'CF', telefono: value.telefono ?? '', correo: value.correo ?? '' };
}
