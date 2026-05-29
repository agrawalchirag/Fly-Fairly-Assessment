import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

// MEILI_HOST must be a full URL like http://fly-meilisearch:7700
const meiliHost = process.env.MEILI_HOST || 'http://localhost:7700';

console.log(`Meilisearch connecting to: ${meiliHost}`);

export const searchClient = new Meilisearch({
  host: meiliHost,
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});
