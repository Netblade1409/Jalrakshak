import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  apiKey?: string;
}

interface Prediction {
  place_id: string;
  description: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, apiKey }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize autocomplete service
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps?.places) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    }
  }, [apiKey]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch predictions when query changes
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    if (!autocompleteServiceRef.current) {
      // Try to initialize again
      if (typeof google !== 'undefined' && google.maps?.places) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      } else {
        return;
      }
    }

    setIsLoadingPredictions(true);

    const timer = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: query,
          types: ['geocode', 'establishment'],
        },
        (results, status) => {
          setIsLoadingPredictions(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results.slice(0, 5).map((r) => ({
              place_id: r.place_id,
              description: r.description,
            })));
            setShowDropdown(true);
          } else {
            setPredictions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query.trim());
    }
  };

  const handlePredictionClick = (prediction: Prediction) => {
    setQuery(prediction.description);
    setShowDropdown(false);
    onSearch(prediction.description);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for an area..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => predictions.length > 0 && setShowDropdown(true)}
              className="pl-10 pr-4 h-12 bg-card/90 backdrop-blur-sm border-border/50 focus:border-primary shadow-glass"
            />
            {isLoadingPredictions && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="h-12 px-6 water-gradient hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Dropdown */}
        {showDropdown && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-12 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                type="button"
                onClick={() => handlePredictionClick(prediction)}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
              >
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm truncate">{prediction.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;