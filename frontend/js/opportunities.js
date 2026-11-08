export const stageNames = { prospecto: 'Prospecto', calificado: 'Calificado', propuesta: 'Propuesta', negociacion: 'Negociación', ganada: 'Ganada', perdida: 'Perdida' };
export const isClosed = stage => ['ganada', 'perdida'].includes(stage);
export function allowedStages(stage) {
  const next = { prospecto: 'calificado', calificado: 'propuesta', propuesta: 'negociacion', negociacion: 'ganada' };
  return next[stage] ? [next[stage], 'perdida'] : [];
}

export function createOpportunities({ api, changed }) {
  const state = {};
  let generation = 0, listRequest = 0, detailRequest = 0, choiceRequest = 0;
  function reset() {
    generation++;
    Object.assign(state, { mode: 'list', filter: '', items: [], loading: false, listError: '', detailLoading: false,
      selected: null, busy: '', error: '', fields: {}, errorForm: '', notice: '', choicesLoading: false, choicesError: '',
      clients: [], products: [], create: { cliente_id: '', titulo: '' }, title: '', add: { producto_id: '', cantidad: '1' },
      quantities: {}, stage: { etapa: '', motivo_perdida: '' }, confirming: false });
  }
  function show(changes) { Object.assign(state, changes); changed(); }
  async function loadList() {
    const version = ++listRequest, session = generation, filter = state.filter;
    show({ loading: true, items: [], listError: '' });
    try {
      const items = await api('/oportunidades' + (filter ? '?etapa=' + encodeURIComponent(filter) : ''));
      if (session === generation && version === listRequest) show({ items, loading: false });
    } catch (error) {
      if (session === generation && version === listRequest) show({ loading: false, listError: error.message });
    }
  }
  async function choices(kind) {
    const version = ++choiceRequest, session = generation;
    show({ choicesLoading: true, choicesError: '' });
    try {
      const rows = await api(kind === 'clients' ? '/clientes' : '/productos');
      if (session === generation && version === choiceRequest) show({ [kind]: rows.map(row => kind === 'clients' ? { id: row.id, nombre: row.nombre } : row), choicesLoading: false });
    } catch (error) {
      if (session === generation && version === choiceRequest) show({ choicesLoading: false, choicesError: error.message });
    }
  }
  function selectDetail(selected) {
    state.selected = selected; state.title = selected.titulo;
    state.quantities = Object.fromEntries(selected.productos.map(line => [line.id, String(line.cantidad)]));
    state.stage = { etapa: allowedStages(selected.etapa)[0] || '', motivo_perdida: '' };
  }
  async function detail(id) {
    if (state.busy) return;
    const version = ++detailRequest, session = generation;
    choiceRequest++;
    show({ mode: 'detail', selected: null, detailLoading: true, error: '', fields: {}, notice: '', confirming: false, choicesLoading: false, choicesError: '' });
    try {
      const selected = await api('/oportunidades/' + id);
      if (session !== generation || version !== detailRequest) return;
      selectDetail(selected); show({ detailLoading: false });
      if (!isClosed(selected.etapa)) await choices('products');
    } catch (error) {
      if (session === generation && version === detailRequest) show({ detailLoading: false, error: error.message });
    }
  }
  function list(filter = state.filter) {
    if (state.busy) return;
    detailRequest++; choiceRequest++;
    show({ mode: 'list', filter, selected: null, detailLoading: false, confirming: false, error: '', fields: {}, notice: '' });
    return loadList();
  }
  function create() {
    if (state.busy) return;
    detailRequest++;
    show({ mode: 'create', selected: null, create: { cliente_id: '', titulo: '' }, error: '', fields: {}, notice: '', confirming: false });
    return choices('clients');
  }
  async function write(path, method, body, form) {
    if (state.busy) return;
    const session = generation;
    show({ busy: form, error: '', fields: {}, errorForm: form, notice: '', confirming: false });
    try {
      let selected = await api(path, { method, ...(body === undefined ? {} : { body }) });
      // DELETE devuelve 204: consultar el detalle, nunca restar importes en el navegador.
      if (selected === null && session === generation) selected = await api('/oportunidades/' + state.selected.id);
      if (session !== generation) return;
      selectDetail(selected);
      show({ mode: 'detail', detailLoading: false, notice: 'La operación se guardó correctamente.', add: { producto_id: '', cantidad: '1' } });
      await loadList();
      if (session === generation && form === 'create') await choices('products');
    } catch (error) {
      if (session === generation) show({ error: error.message, fields: error.fields || {} });
    } finally { if (session === generation) show({ busy: '' }); }
  }
  function saveCreate() { return write('/oportunidades', 'POST', { cliente_id: Number(state.create.cliente_id), titulo: state.create.titulo }, 'create'); }
  function title() { return write('/oportunidades/' + state.selected.id, 'PATCH', { titulo: state.title }, 'title'); }
  function add() { return write('/oportunidades/' + state.selected.id + '/productos', 'POST', { producto_id: Number(state.add.producto_id), cantidad: Number(state.add.cantidad) }, 'add'); }
  function quantity(id) { return write('/oportunidades/' + state.selected.id + '/productos/' + id, 'PATCH', { cantidad: Number(state.quantities[id]) }, 'quantity-' + id); }
  function remove(id) { return write('/oportunidades/' + state.selected.id + '/productos/' + id, 'DELETE', undefined, 'quantity-' + id); }
  function stage(confirmed = false) {
    if (state.busy) return;
    if (isClosed(state.stage.etapa) && !confirmed) { show({ confirming: true }); return; }
    const body = { etapa: state.stage.etapa };
    if (body.etapa === 'perdida') body.motivo_perdida = state.stage.motivo_perdida;
    return write('/oportunidades/' + state.selected.id + '/etapa', 'PATCH', body, 'stage');
  }
  function cancelClosing() { show({ confirming: false }); }
  reset();
  return { state, reset, loadList, list, detail, create, saveCreate, title, add, quantity, remove, stage, cancelClosing };
}
