export function formatPercentage(value = 0) {
  return `${Number(value).toFixed(0)}%`;
}

export function formatMinutes(minutes = 0) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;

  return `${hours}h ${mins}m`;
}