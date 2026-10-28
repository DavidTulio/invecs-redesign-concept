// CSV files for staff, opened in Excel or Google Sheets.

/**
 * Spreadsheets treat a cell starting with = + - @ (or a tab / line break before them)
 * as a formula. Anyone can type into the inquiry form, so a spammer could plant one
 * that runs when staff open the file ("CSV injection"). A leading apostrophe makes
 * the spreadsheet show it as plain text instead.
 */
export function safeCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

/** One CSV field: quoted when it contains a comma, quote or line break; quotes doubled. */
function field(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Rows → CSV text. Starts with a byte-order mark so Excel reads ₱ and ñ correctly,
 * and uses Windows line endings, which every spreadsheet understands.
 */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  return "﻿" + rows.map((row) => row.map((cell) => field(safeCell(cell))).join(",")).join("\r\n") + "\r\n";
}
