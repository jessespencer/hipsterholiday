// Everything about the upcoming party that guests read on the site.
// Edit the copy here; the components only lay it out.

export const event = {
    year: 2026,
    date: 'Friday, December 11th',
    time: '6 PM',
    location: 'At the Spencer home',

    details: [
        {
            label: 'When',
            value: 'Friday, December 11th · 6 PM',
            note: 'Doors open at six. Pajamas on by seven.',
        },
        {
            label: 'Where',
            value: 'At the Spencer home',
            note: 'You know the one. Follow the smell of cookies.',
        },
        {
            label: 'Dress code',
            value: 'Your coziest Christmas pajamas',
            note: 'Matching sets encouraged. Slippers are not optional.',
        },
        {
            label: 'Gift exchange',
            value: 'One gift per person, $30 limit',
            note: 'Wrap it. Nobody’s stirring until it’s opened.',
        },
        {
            label: 'On the table',
            value: 'Cookies, glühwein, and dangerously good food',
            note: 'Bring an appetite. The baby is not sharing.',
        },
    ],
} as const;

// Google Apps Script web-app URL that writes RSVPs into the Google Sheet.
// Set it up with scripts/rsvp-sheet.gs (steps in the README), then paste the
// deployment URL here. Until then the form explains that RSVPs aren't open yet.
export const RSVP_ENDPOINT = '';
