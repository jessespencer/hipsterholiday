// Builds /hipster-holiday.ics: the "Add to calendar" file for this year's party.
// Apple Calendar, Google Calendar and Outlook all open it.
import { event } from '../data/event';

const SITE = 'https://hipsterholiday.com/';

// iCalendar wants 20261212T010000Z, not an ISO string
const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d+/, '');

// Escape text values (backslash, semicolon, comma, newline)
const text = (value: string) =>
    value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// Lines longer than 75 bytes must be folded onto continuation lines
function fold(line: string): string {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    const parts: string[] = [];
    let current = '';
    for (const ch of line) {
        const limit = parts.length === 0 ? 75 : 74;
        if (new TextEncoder().encode(current + ch).length > limit) {
            parts.push(current);
            current = ch;
        } else {
            current += ch;
        }
    }
    parts.push(current);
    return parts.join('\r\n ');
}

export function GET() {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Hipster Holiday//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:hipster-holiday-${event.year}@hipsterholiday.com`,
        `DTSTAMP:${stamp(new Date().toISOString())}`,
        `DTSTART:${stamp(event.startUtc)}`,
        `DTEND:${stamp(event.endUtc)}`,
        `SUMMARY:${text(`The Spencer Family’s Hipster Holiday ${event.year}`)}`,
        `LOCATION:${text(event.location)}`,
        `DESCRIPTION:${text(
            `’Twas the night before Christmas, and not a creature was stirring… except for a baby.\nPajamas on, cookies out.\nDetails and RSVP: ${SITE}`,
        )}`,
        `URL:${SITE}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${text(`Hipster Holiday is tomorrow at ${event.time}`)}`,
        'TRIGGER:-P1D',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ];

    return new Response(lines.map(fold).join('\r\n') + '\r\n', {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    });
}
