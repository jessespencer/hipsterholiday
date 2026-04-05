import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://hipsterholiday.com',
  integrations: [react()],
});
