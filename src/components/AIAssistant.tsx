import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Minus, Sparkles, User, BrainCircuit } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { UserProfile, ChatMessage } from '../types';
import { getAIAssistantResponse } from '../services/aiAssistantService';
import Markdown from 'react-markdown';

export default function AIAssistant({ userProfile }: { userProfile: UserProfile | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleExternalMessage = (event: any) => {
      const { text, autoSend } = event.detail;
      setIsOpen(true);
      setIsMinimized(false);
      setInput(text);
      if (autoSend) {
        // Trigger send after a small delay to ensure state update
        setTimeout(() => {
          const sendBtn = document.getElementById('ai-send-btn');
          sendBtn?.click();
        }, 100);
      }
    };

    window.addEventListener('ai-assistant-message', handleExternalMessage);
    return () => window.removeEventListener('ai-assistant-message', handleExternalMessage);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await getAIAssistantResponse(messages, userMessage, userProfile?.settings?.aiTone || 'professional');
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
       setMessages(prev => [...prev, { role: 'model', text: "Forgive me, my neural circuits are currently experiencing a slight desync. Let us try that again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center hover:scale-110 transition-all border border-white/20 group"
          >
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`flex flex-col glass-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden ${
              isMinimized ? 'h-16 w-80' : 'h-[600px] w-[400px]'
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Neural Assistant</h3>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Synced</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-lg hover:bg-white/5 text-muted-foreground"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8 rounded-lg hover:bg-white/5 text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                        <Sparkles className="w-8 h-8 text-primary/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Lattice Neural Intelligence</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          Ask me anything about the global index, search patterns, or general knowledge.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {["Current trends", "Explain quantum", "Summarize AI"].map((text) => (
                          <button 
                            key={text}
                            onClick={() => setInput(text)}
                            className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] text-muted-foreground hover:text-white hover:border-primary/30 transition-all"
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white'
                        }`}>
                          {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                          ? 'bg-primary text-white font-medium rounded-tr-sm' 
                          : 'bg-white/5 border border-white/10 text-muted-foreground rounded-tl-sm'
                        }`}>
                          <div className="markdown-body">
                            <Markdown>
                              {msg.text}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                         <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                         <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                         <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/5">
                  <div className="relative group">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your query..."
                      className="glass-dark border-white/10 h-12 pr-12 rounded-2xl focus:border-primary/50 transition-all text-white placeholder:text-muted-foreground/50"
                    />
                    <Button 
                      id="ai-send-btn"
                      disabled={loading}
                      type="submit"
                      className={`absolute right-1.5 top-1.5 h-9 w-9 p-0 rounded-xl transition-all ${
                        input.trim() ? 'bg-primary scale-100 opacity-100' : 'bg-transparent scale-90 opacity-0'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[9px] text-center text-muted-foreground/30 mt-3 font-mono tracking-widest uppercase">
                    Quantum Secured Neural Link
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
