import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

const meiliHost = process.env.MEILI_HOST || 'http://localhost:7700';

let finalHost = meiliHost;
// If user provided just 'fly-meilisearch' or it doesn't have a protocol
if (!finalHost.startsWith('http')) {
  finalHost = `http://${finalHost}`;
}

// Ensure port if it's an internal host
if (!finalHost.includes(':') && finalHost.includes('fly-meilisearch') && !finalHost.includes('.onrender.com')) {
  finalHost = `${finalHost}:7700`;
}

export const searchClient = new Meilisearch({
  host: finalHost,
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});
