/**
 * Parsea un string "YYYY-MM-DD" forzando mediodía UTC.
 * Con T12:00:00Z incluso en UTC-12 (el timezone más extremo) el día
 * sigue siendo el mismo, por lo que Postgres (@db.Date) siempre trunca
 * al día correcto independientemente del timezone del servidor o cliente.
 *
 * ❌ new Date("2026-03-02")        → UTC midnight → en UTC-4 = 2026-03-01
 * ❌ new Date(2026, 2, 2)          → local midnight → depende del OS/Docker
 * ✅ new Date("2026-03-02T12:00Z") → mediodía UTC  → siempre 2026-03-02
 */
export function parseLocalDate(value: string): Date {
  return new Date(`${value.substring(0, 10)}T12:00:00.000Z`);
}
