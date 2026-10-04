import { parseCalendarDate, formatDateToYYYYMMDD } from "@/utils/dateUtils";
test("API dates retain their calendar day through display and mutation formatting", () => {
  const day = parseCalendarDate("2026-10-04");
  expect(day.getFullYear()).toBe(2026);
  expect(day.getMonth()).toBe(9);
  expect(day.getDate()).toBe(4);
  expect(day.getHours()).toBe(0);
  expect(formatDateToYYYYMMDD(day)).toBe("2026-10-04");
});
