// Everything about the upcoming party that guests read on the site.
// Edit the copy here; the components only lay it out.

export const event = {
    year: 2026,
    date: 'Friday, December 11th',
    time: '6 PM',
    location: 'At the Spencer home',

    // For the "Add to calendar" file: 6–11 PM Mountain time, written in UTC
    startUtc: '2026-12-12T01:00:00Z',
    endUtc: '2026-12-12T06:00:00Z',

    details: [
        {
            label: 'When',
            value: 'Friday, December 11th · 6 PM',
            note: 'Show up in your best pajama threads.',
        },
        {
            label: 'Where',
            value: 'At the Spencer home',
            note: 'You know the one. Follow the smell of cookies.',
        },
        {
            label: 'Dress code',
            value: 'Your coziest sleepwear',
            note: 'Pajamas, fun socks, whatever’s comfiest. Slippers not optional.',
        },
        {
            label: 'Gift exchange',
            value: 'One gift per person, $30 limit',
            note: 'Wrap it and get ready for a hilarious gift exchange.',
        },
        {
            label: 'On the table',
            value: 'Cookies, glühwein, and dangerously good food',
            note: 'Bring an appetite. The baby is not sharing.',
        },
        {
            label: 'The fun',
            value: 'Games, music, and good company',
            note: 'This won’t be a night for napping.',
        },
        {
            label: 'Grown-ups only',
            value: 'A night off for the parents',
            note: 'Unless your tiny human is still powered by mama’s liquid gold, this is a night for grown-ups to stay up past bedtime.',
        },
    ],
} as const;

// Google Apps Script web-app URL that writes RSVPs into the Google Sheet.
// Set up with scripts/rsvp-sheet.gs (steps in the README). Anyone can post here;
// the script only appends rows, so the URL is safe to publish. Empty = RSVPs closed.
export const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwLW_IVvEzDUqm20nZNCBd8Mnk7kPOGm3O3Z8UHhi9cipwPlkesQy5pYDGY4nGr9_PU/exec';
