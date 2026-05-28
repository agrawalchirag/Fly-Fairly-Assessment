import React, { useState, useEffect, useCallback } from 'react';
import { Plane, Building2, Map as MapIcon, Loader2, Search } from 'lucide-react';
import './App.css';

interface SearchResult {
  id: string;
  type: 'airport' | 'city' | 'region';
  iata_code?: string;
  city_code?: string;
  name: string;
  city?: string;
  country: string;
  state_province?: string;
  airports?: { iata: string; name: string }[];
}

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL 
        ? (import.meta.env.VITE_API_URL.startsWith('http') 
            ? import.meta.env.VITE_API_URL 
            : `https://${import.meta.env.VITE_API_URL}`)
        : 'http://localhost:3001';

      const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      setResults(data.results);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) performSearch(query);
      else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setFocusedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      handleSelect(results[focusedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSelect = (item: SearchResult) => {
    setQuery(item.name);
    setShowDropdown(false);
    setFocusedIndex(-1);
    console.log('Selected:', item);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'airport': return <Plane size={20} className="text-blue-400" />;
      case 'city': return <Building2 size={20} className="text-emerald-400" />;
      case 'region': return <MapIcon size={20} className="text-amber-400" />;
      default: return <Plane size={20} />;
    }
  };

  return (
    <div className="hero-section">
      <h1 className="logo">Fly Fairly</h1>
      <p className="tagline">Where next? Unmatched flexibility for the post-COVID generation.</p>
      
      <div className="search-container">
        <div className="input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search airports, cities, or regions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
          />
          {loading && <Loader2 className="loading-spinner animate-spin" size={20} />}
        </div>

        {showDropdown && results.length > 0 && (
          <div className="dropdown">
            {results.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`dropdown-item ${focusedIndex === index ? 'active' : ''}`}
                onMouseEnter={() => setFocusedIndex(index)}
                onClick={() => handleSelect(item)}
              >
                <div className="item-main">
                  <div className="icon-bg">{getIcon(item.type)}</div>
                  <div className="item-info">
                    <div className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className={`item-type-badge ${item.type}`}>{item.type}</span>
                    </div>
                    <span className="item-sub">
                      {item.city ? `${item.city}, ` : ''}
                      {item.state_province ? `${item.state_province}, ` : ''}
                      {item.country}
                    </span>
                    {item.type === 'city' && item.airports && (
                      <div className="multi-airports">
                        {item.airports.map(a => (
                          <span key={a.iata} className="airport-chip">{a.iata}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="iata-badge">
                  {item.type === 'city' ? item.city_code : item.iata_code}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && results.length === 0 && query.length >= 2 && !loading && (
          <div className="dropdown no-results">
            No airports or cities found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
