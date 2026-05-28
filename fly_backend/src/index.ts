import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRouter from './routes/search';

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

app.listen(PORT, () => {
  console.log(`Fly Fairly Backend listening on port ${PORT}`);
});
