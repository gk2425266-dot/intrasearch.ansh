import { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, Mic, Camera } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  initialValue?: string;
  autoFocus?: boolean;
  size?: 'default' | 'large';
}

export default function SearchBar({ initialValue = '', autoFocus = false, size = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Q1 Financial Report",
    "Employee Handbook 2026",
    "Lattice Design System",
    "Project Phoenix Roadmap",
    "Internal API Documentation"
  ].filter(s => s.toLowerCase().includes(debouncedQuery.toLowerCase()) && debouncedQuery.length > 0);

  const handleSearch = (e?: React.FormEvent, selectedQuery?: string) => {
    e?.preventDefault();
    const finalQuery = selectedQuery || query;
    if (finalQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[640px] mx-auto">
      <form 
        onSubmit={handleSearch}
        className={`relative flex items-center transition-all duration-500 ${
          isFocused ? 'shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-1 ring-primary/30 border-primary/30' : 'shadow-lg border-white/10'
        } rounded-full bg-black/40 backdrop-blur-2xl overflow-hidden border`}
      >
        <div className="absolute left-6 text-primary animate-pulse">
          <Search className={size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} />
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask anything or search documents..."
          className={`border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent ${
            size === 'large' ? 'h-16 text-base pl-16 pr-32' : 'h-12 text-sm pl-14 pr-24'
          } w-full text-white placeholder:text-white/20 font-medium tracking-wide`}
          autoFocus={autoFocus}
        />
        
        <div className="absolute right-6 flex items-center gap-4">
          {query && (
            <button 
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="button" className="text-white/30 hover:text-primary transition-all hover:scale-110">
            <Mic className="w-5 h-5" />
          </button>
          <button type="button" className="text-white/30 hover:text-primary transition-all hover:scale-110">
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || (isFocused && query.length === 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[60]"
          >
            <div className="py-2">
              {query.length === 0 ? (
                <>
                  <div className="px-4 py-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-3 h-3" /> Recent Searches
                    </div>
                    <button className="hover:text-primary transition-colors cursor-pointer capitalize font-sans tracking-normal">Clear</button>
                  </div>
                  {["Benefits enrollment", "Holiday calendar", "Expense policy"].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(undefined, item)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-3 transition-colors text-white/70 hover:text-white"
                    >
                      <History className="w-4 h-4 text-white/20" />
                      <span>{item}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <div className="px-4 py-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Suggestions
                  </div>
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(undefined, item)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center gap-3 transition-colors text-white/70 hover:text-white"
                    >
                      <Search className="w-4 h-4 text-white/20" />
                      <span>{item}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
