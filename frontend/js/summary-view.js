export function renderSummary(container, state) {
  const content = document.getElementById('summary-view').content.cloneNode(true);
  content.querySelector('[name=mes]').value = state.month;
  const status = content.querySelector('[data-summary-status]');
  status.textContent = state.loading ? 'Consultando el resumen de ' + (state.month || 'su mes seleccionado') + '…' : '';
  status.hidden = !state.loading;
  const error = content.querySelector('[data-summary-error]'); error.textContent = state.error; error.hidden = !state.error;
  const results = content.querySelector('[data-summary-results]'); results.hidden = !state.data;
  if (state.data) {
    const money = value => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(value);
    content.querySelector('[data-summary-month]').textContent = 'Datos del mes: ' + state.data.mes + ' (Guatemala)';
    content.querySelector('[data-summary-sales]').textContent = String(state.data.ventas);
    content.querySelector('[data-summary-total]').textContent = money(state.data.total);
    content.querySelector('[data-summary-forecast]').textContent = money(state.data.pronostico);
    content.querySelector('[data-summary-capacity]').textContent = state.data.cartera.clientes + ' / ' + state.data.cartera.maximo;
  }
  container.replaceChildren(content);
}
