import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

const meiliHost = process.env.MEILI_HOST || 'http://localhost:7700';

// Smarter resolution for Render internal networking
let finalHost = meiliHost;
if (!finalHost.startsWith('http')) {
  // If it's a simple hostname like 'fly-meilisearch', assume http and port 7700
  finalHost = `http://${finalHost}${finalHost.includes(':') ? '' : ':7700'}`;
}

export const searchClient = new Meilisearch({
  host: finalHost,
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});
