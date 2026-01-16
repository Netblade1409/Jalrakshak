import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for an area..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 h-12 bg-card/90 backdrop-blur-sm border-border/50 focus:border-primary shadow-glass"
          />
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
    </form>
  );
};

export default SearchBar;
