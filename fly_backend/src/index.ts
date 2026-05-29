import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRouter from './routes/search.js';
import { searchClient, meiliHost } from './config/meilisearch.js';
import { seed } from '../scripts/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/search', searchRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'meilisearch' });
});

let isSeeding = false;
let lastSeedError: string | null = null;

app.get('/', (req, res) => {
  res.send('<h1>Fly Fairly Backend is Running</h1><p>Check <a href="/health">/health</a> or use <code>/api/search?q=query</code></p>');
});

app.listen(PORT, async () => {
  console.log(`Fly Fairly Backend listening on port ${PORT}`);
  
  // Auto-seed check for Render's ephemeral storage
  try {
    const stats = await searchClient.getStats();
    const airportCount = stats.indexes.airports?.numberOfDocuments || 0;
    
    if (airportCount === 0) {
      console.log('Meilisearch index empty. Starting auto-seed...');
      await seed();
    } else {
      console.log(`Meilisearch ready with ${airportCount} airports.`);
    }
  } catch (error) {
    console.log('Meilisearch not yet reachable or setup. Skipping auto-seed check.');
  }
});
