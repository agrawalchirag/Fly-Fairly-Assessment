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

app.get('/api/debug', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const rootDir = process.cwd();
    const dataPath = path.join(rootDir, 'data/raw');
    
    // Check files
    const files = ['airports.csv', 'regions.csv', 'countries.csv'];
    const fileStatus: Record<string, boolean> = {};
    files.forEach(f => {
      fileStatus[f] = fs.existsSync(path.join(dataPath, f));
    });

    const stats = await searchClient.getStats();
    const host = process.env.MEILI_HOST || 'not set';
    
    res.json({ 
      status: 'ready', 
      stats, 
      host_configured: host.replace(/:.+@/, ':***@'),
      data_files_present: fileStatus,
      isSeeding 
    });
  } catch (error: any) {
    console.error('DEBUG API ERROR:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      suggestion: 'Check if MEILI_HOST matches Render Dashboard exactly',
      current_target: meiliHost,
      host_env: process.env.MEILI_HOST || 'not set'
    });
  }
});

let isSeeding = false;

app.get('/api/seed', async (req, res) => {
  if (isSeeding) {
    return res.status(429).json({ status: 'error', message: 'Seeding already in progress' });
  }

  isSeeding = true;
  // Start seeding in background
  seed()
    .then(() => {
      console.log('Background seeding completed successfully');
      isSeeding = false;
    })
    .catch((err) => {
      console.error('Background seeding failed:', err);
      isSeeding = false;
    });

  res.status(202).json({ 
    status: 'accepted', 
    message: 'Seeding started in background. Please check /health or try searching in a minute.' 
  });
});

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
