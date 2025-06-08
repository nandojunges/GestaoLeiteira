export function addEventoCalendario(evento) {
  const eventos = JSON.parse(localStorage.getItem('eventosExtras') || '[]');
  eventos.push({ prioridadeVisual: true, ...evento });
  localStorage.setItem('eventosExtras', JSON.stringify(eventos));
  window.dispatchEvent(new Event('eventosExtrasAtualizados'));
}
