import { searchClient } from '../config/meilisearch.js';
import { SearchResult } from '../models/types.js';

export class SearchService {
  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!query) return [];

    const isIataCode = /^[A-Z]{3}$/.test(query.toUpperCase());

    // Multi-search across airports, cities, and regions
    const { results } = await searchClient.multiSearch({
      queries: [
        { indexUid: 'airports', q: query, limit: 50 },
        { indexUid: 'cities', q: query, limit: 10 },
        { indexUid: 'regions', q: query, limit: 10 },
      ]
    });

    let merged: SearchResult[] = [];
    
    // Flatten and tag results
    for (const r of results) {
      if (r.hits) {
        merged = [...merged, ...r.hits as unknown as SearchResult[]];
      }
    }

    // Deduplicate (some airports might be in multiple results if we had overlaps, though currently indexes are discrete)
    const seen = new Set<string>();
    merged = merged.filter(item => {
      const key = `${item.type}_${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Custom Ranking Logic
    merged.sort((a, b) => {
      const q = query.toLowerCase();
      
      // 1. Exact IATA code match always wins
      if (isIataCode) {
        if (a.type === 'airport' && a.iata_code === query.toUpperCase()) return -1;
        if (b.type === 'airport' && b.iata_code === query.toUpperCase()) return 1;
      }

      // 2. Exact query match on region name should prioritize region
      const aRegionExact = a.type === 'region' && a.name.toLowerCase() === q;
      const bRegionExact = b.type === 'region' && b.name.toLowerCase() === q;
      if (aRegionExact && !bRegionExact) return -1;
      if (bRegionExact && !aRegionExact) return 1;

      // 3. Exact name or alias match
      const aExact = a.name.toLowerCase() === q || a.aliases?.some(al => al.toLowerCase() === q);
      const bExact = b.name.toLowerCase() === q || b.aliases?.some(al => al.toLowerCase() === q);
      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;

      // 4. Multi-airport city groups rank high
      if (a.type === 'city' && b.type !== 'city') return -1;
      if (b.type === 'city' && a.type !== 'city') return 1;

      // 4. Then by popularity / Meilisearch natural ranking
      const aScore = a.popularity_score || 0;
      const bScore = b.popularity_score || 0;
      
      return bScore - aScore;
    });

    return merged.slice(0, limit);
  }
}

export const searchService = new SearchService();
