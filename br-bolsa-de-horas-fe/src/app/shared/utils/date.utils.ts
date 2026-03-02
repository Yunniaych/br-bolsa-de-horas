/**
 * Convierte un Date object a string YYYY-MM-DD usando la zona horaria LOCAL,
 * evitando el problema de UTC offset que adelanta/atrasa el día.
 */
export function toDateString(value: Date | string | null | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value.substring(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna la fecha de hoy como string YYYY-MM-DD en zona horaria local.
 */
export function todayString(): string {
  return toDateString(new Date());
}
