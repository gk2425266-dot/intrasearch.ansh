import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { UserProfile, Document, SourceType, AIOverview } from '../types';
import SearchBar from '../components/SearchBar';
import { performAISearch } from '../services/aiSearchService';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { 
  Search,
  FileText, 
  ExternalLink, 
  Clock, 
  Filter, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  MoreHorizontal,
  Github,
  Slack,
  Database,
  Globe,
  FileCode,
  MessageSquare,
  Video,
  Play,
  Sparkles,
  BrainCircuit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

const SOURCE_ICONS: Record<SourceType, any> = {
  wiki: Globe,
  drive: Database,
  slack: MessageSquare,
  github: Github,
  web: Globe,
  video: Video
};

const SOURCE_COLORS: Record<SourceType, string> = {
  wiki: 'bg-blue-50 text-blue-600 border-blue-100',
  drive: 'bg-green-50 text-green-600 border-green-100',
  slack: 'bg-purple-50 text-purple-600 border-purple-100',
  github: 'bg-gray-50 text-gray-600 border-gray-100',
  web: 'bg-blue-50 text-blue-600 border-blue-100',
  video: 'bg-red-50 text-red-600 border-red-100'
};

export default function ResultsPage({ userProfile }: { userProfile: UserProfile | null }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Document[]>([]);
  const [aiOverview, setAiOverview] = useState<AIOverview | null>(null);
  const [activeFilters, setActiveFilters] = useState<SourceType[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>(userProfile?.settings?.searchSortDefault || 'relevance');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [showAIOverview, setShowAIOverview] = useState(true);

  // Sync sortBy if settings change
  useEffect(() => {
    if (userProfile?.settings?.searchSortDefault) {
      setSortBy(userProfile.settings.searchSortDefault);
    }
  }, [userProfile?.settings?.searchSortDefault]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setAiOverview(null);
      
      try {
        const response = await performAISearch(query);
        
        let allResults = [...response.webResults, ...response.videoResults];
        
        // Sorting
        const sorted = allResults.sort((a, b) => {
          if (sortBy === 'date') {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        });

        setResults(sorted);
        setAiOverview(response.overview);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query, sortBy]);

  const filteredResults = useMemo(() => {
    if (activeFilters.length === 0) return results;
    return results.filter(doc => activeFilters.includes(doc.sourceType));
  }, [results, activeFilters]);

  const toggleFilter = (filter: SourceType) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-primary px-0.5 rounded">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="border-b border-white/5 py-8 px-10 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-2/3">
            <SearchBar initialValue={query} />
          </div>
          <div className="flex items-center gap-3 text-[13px] text-muted-foreground font-mono uppercase tracking-wider">
            <span>Sort:</span>
            <button 
              onClick={() => setSortBy('relevance')}
              className={`px-4 py-1.5 rounded-full border transition-all ${sortBy === 'relevance' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 border-white/10 hover:border-primary/50'}`}
            >
              Relevance
            </button>
            <button 
              onClick={() => setSortBy('date')}
              className={`px-4 py-1.5 rounded-full border transition-all ${sortBy === 'date' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 border-white/10 hover:border-primary/50'}`}
            >
              Freshness
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 py-12 flex flex-col lg:flex-row gap-16">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-10">
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary mb-6 flex items-center gap-2">
              <Filter className="w-3 h-3" /> Source Type
            </h4>
            <div className="space-y-2">
              {(['web', 'video', 'wiki', 'drive', 'slack', 'github'] as SourceType[]).map(source => {
                const Icon = SOURCE_ICONS[source];
                const isActive = activeFilters.includes(source);
                return (
                  <button
                    key={source}
                    onClick={() => toggleFilter(source)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all group ${
                      isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{source}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-white/5" />

          <div className="glass-dark p-6 rounded-2xl border-white/5">
            <h5 className="text-[10px] font-mono tracking-[0.3em] uppercase text-primary mb-4">Neural AI</h5>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Our AI analyzes billions of data points to provide the most accurate answers in real-time.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-primary animate-pulse">
              <Sparkles className="w-3 h-3" /> SYSTEM ONLINE
            </div>
          </div>
        </aside>

        {/* Results List */}
        <div className="flex-1">
          {/* AI Overview Section */}
          <AnimatePresence>
            {aiOverview && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <div className="glass-dark border-primary/20 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                  <div className="bg-primary/10 px-8 py-4 flex items-center justify-between border-b border-primary/20">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">AI Overview</h3>
                    </div>
                    <button 
                      onClick={() => setShowAIOverview(!showAIOverview)}
                      className="text-muted-foreground hover:text-white transition-colors"
                    >
                      {showAIOverview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {showAIOverview && (
                    <div className="p-8 space-y-6">
                      <p className="text-lg text-white leading-relaxed font-medium">
                        {aiOverview.summary}
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-primary">Key Insights</h4>
                          <ul className="space-y-2">
                            {aiOverview.keyPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-primary">Suggested Queries</h4>
                          <div className="flex flex-wrap gap-2">
                            {aiOverview.suggestedQuestions.map((q, i) => (
                              <Link 
                                key={i} 
                                to={`/results?q=${encodeURIComponent(q)}`}
                                className="text-xs bg-white/5 border border-white/10 hover:border-primary/50 px-3 py-1.5 rounded-full text-muted-foreground hover:text-white transition-all"
                              >
                                {q}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Neural indexing...' : (
                <>Found <span className="text-white font-mono">{filteredResults.length}</span> results for <span className="text-primary font-medium">"{query}"</span></>
              )}
            </p>
          </div>

          <div className="space-y-8">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4 glass-dark p-6 rounded-2xl border-white/5">
                  <div className="h-6 bg-white/5 rounded-md w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
                  <div className="h-20 bg-white/5 rounded-xl w-full"></div>
                </div>
              ))
            ) : filteredResults.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredResults.map((doc, index) => {
                  const Icon = SOURCE_ICONS[doc.sourceType];
                  const isVideo = doc.sourceType === 'video';
                  
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`glass-dark border-white/5 hover:border-primary/30 transition-all group overflow-hidden p-6 rounded-2xl ${isVideo ? 'border-red-500/10' : ''}`}>
                        <CardContent className="p-0 space-y-4">
                          <div className="flex flex-col md:flex-row gap-6">
                            {isVideo && doc.thumbnail && (
                              <div className="w-full md:w-64 h-36 rounded-xl overflow-hidden relative flex-shrink-0 group/video cursor-pointer" onClick={() => setActiveVideo(doc.videoUrl || null)}>
                                <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover transition-transform group-hover/video:scale-110" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                                    <Play className="w-6 h-6 text-white fill-current" />
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                                  VIDEO
                                </div>
                              </div>
                            )}
                            
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3 mb-1">
                                    <Badge variant="outline" className={`bg-white/5 border-white/10 text-[10px] font-mono uppercase tracking-widest text-muted-foreground py-0.5 ${isVideo ? 'text-red-400 border-red-400/20' : ''}`}>
                                      <Icon className={`w-3 h-3 mr-1.5 ${isVideo ? 'text-red-500' : 'text-primary'}`} />
                                      {doc.sourceType}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono opacity-50 truncate max-w-[200px]">{doc.url}</span>
                                  </div>
                                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-all leading-tight">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                      {highlightText(doc.title, query)}
                                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                    </a>
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-full bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const event = new CustomEvent('ai-assistant-message', { 
                                        detail: { 
                                          text: `Can you tell me more about this result: "${doc.title}"? Here is the description: ${doc.description}`,
                                          autoSend: true 
                                        } 
                                      });
                                      window.dispatchEvent(event);
                                    }}
                                  >
                                    <BrainCircuit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                                    <Bookmark className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl line-clamp-2">
                                {highlightText(doc.description, query)}
                              </p>

                              {activeVideo === doc.videoUrl && isVideo && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="pt-4"
                                >
                                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
                                    <iframe 
                                      src={doc.videoUrl?.replace('watch?v=', 'embed/')} 
                                      className="w-full h-full"
                                      allowFullScreen
                                      title={doc.title}
                                    />
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setActiveVideo(null)}
                                    className="mt-2 text-xs text-muted-foreground hover:text-white"
                                  >
                                    Close Player
                                  </Button>
                                </motion.div>
                              )}
                              
                              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-6 text-[11px] text-muted-foreground font-mono">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 opacity-50" />
                                    <span>{doc.updatedAt}</span>
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono text-primary/60">
                                  {Math.round((doc.relevanceScore || 0) * 100)}% RELEVANCE
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="text-center py-24 glass-dark rounded-3xl border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No neural matches found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
                  We couldn't find anything matching "{query}". Try different keywords or check your filters.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-full border-white/10 hover:bg-white/5"
                  onClick={() => setActiveFilters([])}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
