import { UserProfile } from '../types';
import SearchBar from '../components/SearchBar';
import { motion } from 'motion/react';
import { Search, Shield, Zap, Globe, Sparkles, Video, TrendingUp } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export default function HomePage({ userProfile }: { userProfile: UserProfile | null }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12 flex flex-col items-center gap-6"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-20 h-20 bg-black rounded-2xl flex items-center justify-center text-white font-extrabold text-4xl shadow-2xl border border-white/10">
            L
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white text-glow">
            Lattice
          </h1>
          <div className="flex items-center justify-center gap-3">
            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest px-2">Neural Engine v3.0</Badge>
            <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest opacity-60">Global Index</span>
          </div>
        </div>

        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed font-light">
          Experience the next generation of search. Powered by <span className="text-primary font-semibold">Neural Intelligence</span> to index the entire web and provide instant AI overviews.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-full max-w-[720px] relative px-4"
      >
        {userProfile?.role === 'admin' && (
          <div className="absolute -top-3 right-8 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] uppercase z-10 border border-white/20">
            Admin Access
          </div>
        )}
        <SearchBar size="large" autoFocus />
        
        <div className="flex justify-center gap-4 mt-10">
          <button className="px-8 py-3 rounded-full glass text-white text-sm font-medium hover:bg-white/10 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:scale-105">
            Neural Search
          </button>
          <button className="px-8 py-3 rounded-full glass text-white text-sm font-medium hover:bg-white/10 hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:scale-105">
            I'm Feeling Lucky
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-32 w-full max-w-6xl px-6"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-white/5"></div>
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-primary flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Neural Discoveries
          </span>
          <div className="h-px flex-1 bg-white/5"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Sparkles className="w-6 h-6" />, title: "AI Overviews", desc: "Get instant answers synthesized from billions of web pages." },
            { icon: <Video className="w-6 h-6" />, title: "Video Intelligence", desc: "Search and play videos directly within the neural interface." },
            { icon: <Globe className="w-6 h-6" />, title: "Global Index", desc: "Access real-time information from across the entire internet." }
          ].map((item, i) => (
            <div key={i} className="glass-dark p-8 rounded-3xl hover:border-primary/30 transition-all group cursor-pointer border border-white/5">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-primary">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-glow transition-all">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
