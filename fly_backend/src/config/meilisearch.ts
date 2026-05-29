import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

let meiliHost = process.env.MEILI_HOST || 'http://localhost:7700';

// Render specific fix: If host is just a hostname, add http and port.
// If it's already a full URL (https://...), use it as is.
if (!meiliHost.startsWith('http')) {
    meiliHost = `http://${meiliHost}:7700`;
}

console.log(`Connecting to Meilisearch at: ${meiliHost}`);

export const searchClient = new Meilisearch({
  host: meiliHost,
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});
