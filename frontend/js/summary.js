export function currentGuatemalaMonth(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Guatemala', year: 'numeric', month: '2-digit' }).formatToParts(now);
  return parts.find(part => part.type === 'year').value + '-' + parts.find(part => part.type === 'month').value;
}

export function createSummary({ api, changed, updateCapacity }) {
  const state = {};
  let generation = 0, requestNumber = 0;
  function reset() {
    generation++;
    Object.assign(state, { month: currentGuatemalaMonth(), data: null, loading: false, error: '' });
  }
  function show(changes) { Object.assign(state, changes); changed(); }
  function leave() {
    requestNumber++; // No publicar una ocupación antigua después de volver a trabajar en Clientes.
    Object.assign(state, { data: null, loading: false });
  }
  async function load(month = state.month) {
    const version = ++requestNumber, session = generation;
    // No presentar importes del mes anterior bajo el selector nuevo, incluso si falla la consulta.
    show({ month, data: null, loading: true, error: '' });
    try {
      const data = await api('/reportes/resumen?mes=' + encodeURIComponent(month));
      if (session !== generation || version !== requestNumber) return;
      if (data.mes !== month) throw new Error('El mes recibido no coincide con su consulta. Actualice el resumen.');
      updateCapacity(data.cartera);
      show({ data, loading: false });
    } catch (error) {
      if (session === generation && version === requestNumber) show({ loading: false, error: error.message });
    }
  }
  reset();
  return { state, reset, load, leave };
}
