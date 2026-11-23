/**
 * Hipster Holiday RSVPs → Google Sheet
 *
 * Paste into the Sheet's Apps Script editor (Extensions → Apps Script),
 * deploy as a web app, and put the deployment URL in src/data/event.ts.
 * Full steps are in the README under "RSVPs".
 */

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Submitted', 'Year', 'Attending', 'Name', 'Email', 'Guests', 'Note'];

/**
 * Run this once from the editor (pick "setup" in the toolbar, then Run).
 * It creates the RSVPs tab with headers and triggers Google's permission
 * prompt there, so deploying afterwards doesn't need to ask again.
 */
function setup() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
}

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot: real visitors never fill this field (`company` is its old name,
  // dropped because browser autofill filled it for real guests)
  if (p.hh_trap || p.company) return ok();

  // The site requires these, so anything without them isn't a real RSVP
  if (!String(p.name || '').trim() || !String(p.email || '').trim()) return ok();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    sheet.appendRow([
      new Date(),
      clean(p.year, 8),
      p.attending === 'no' ? 'No' : 'Yes',
      clean(p.name, 120),
      clean(p.email, 160),
      Math.max(0, Math.min(12, parseInt(p.guests, 10) || 0)),
      clean(p.note, 500),
    ]);
  } finally {
    lock.releaseLock();
  }
  return ok();
}

// Trim, cap length, and stop anything that looks like a spreadsheet formula
function clean(value, max) {
  const text = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function ok() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
