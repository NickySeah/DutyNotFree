// Helper function to format date to YYYY-MM-DD
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// API dates describe a calendar day, rather than an instant in UTC.
export function parseCalendarDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
