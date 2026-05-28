import { Router, Request, Response } from 'express';
import { searchService } from '../services/searchService';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }

    const start = Date.now();
    const results = await searchService.search(query, limit);
    const took_ms = Date.now() - start;

    res.json({
      query,
      took_ms,
      total_found: results.length,
      results
    });
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
