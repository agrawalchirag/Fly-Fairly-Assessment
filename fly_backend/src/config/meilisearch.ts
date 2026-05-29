import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

export let meiliHost = process.env.MEILI_HOST || 'http://localhost:7700';

// Bulletproof host resolution for Render
if (meiliHost.includes('onrender.com')) {
    // If it's an external URL, ensure it starts with https:// and has NO PORT
    if (!meiliHost.startsWith('http')) meiliHost = `https://${meiliHost}`;
    // Clean up if the user mistakenly added 7700 to the external URL
    meiliHost = meiliHost.replace(':7700', '');
} else if (!meiliHost.startsWith('http')) {
    // If it's internal (like 'fly-meilisearch'), force http and port 7700
    meiliHost = `http://${meiliHost}:7700`;
}

console.log('-------------------------------------------');
console.log(`DATABASE LOG: Connecting to Meilisearch at: ${meiliHost}`);
console.log('-------------------------------------------');

export const searchClient = new Meilisearch({
  host: meiliHost,
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});
