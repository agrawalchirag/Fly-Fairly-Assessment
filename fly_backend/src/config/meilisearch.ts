import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

const meiliHost = process.env.MEILI_HOST || 'http://localhost:7700';

export const searchClient = new Meilisearch({
  host: meiliHost.startsWith('http') ? meiliHost : `https://${meiliHost}`,
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});
