import { Meilisearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

export const searchClient = new Meilisearch({
  host: process.env.MEILI_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
});
