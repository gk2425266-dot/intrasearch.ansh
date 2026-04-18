import { useState, useEffect } from 'react';
import { UserProfile, Document, SourceType, FileType } from '../types';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Database, Globe, Github, Slack, Search, Trash2, Edit2, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminPage({ userProfile }: { userProfile: UserProfile | null }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [newDoc, setNewDoc] = useState({
    title: '',
    description: '',
    url: '',
    sourceType: 'wiki' as SourceType,
    department: '',
    fileType: 'link' as FileType,
    tags: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'documents'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
      setDocuments(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docData = {
        ...newDoc,
        tags: newDoc.tags.split(',').map(t => t.trim()).filter(t => t),
        updatedAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, 'documents'), docData);
      setIsAdding(false);
      setNewDoc({
        title: '',
        description: '',
        url: '',
        sourceType: 'wiki',
        department: '',
        fileType: 'link',
        tags: ''
      });
      fetchDocuments();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'documents');
    }
  };

  return (
    <div className="flex-1 bg-background p-10 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter text-glow">Admin Terminal</h1>
            <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-widest opacity-60">Lattice IntraSearch // Neural Index Management</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/80 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] px-6">
            <Plus className="w-4 h-4 mr-2" /> Index New Content
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Global Index', value: '4.2B', change: '+1.2M today', icon: <Globe className="w-4 h-4" /> },
            { label: 'Search Latency', value: '12ms', change: '-4ms avg', icon: <Search className="w-4 h-4" /> },
            { label: 'AI Throughput', value: '85k/s', change: 'Optimal', icon: <Sparkles className="w-4 h-4" /> },
            { label: 'Neural Accuracy', value: '99.8%', change: '+0.6% boost', icon: <CheckCircle2 className="w-4 h-4" /> }
          ].map((stat, i) => (
            <Card key={i} className="glass-dark border-white/5 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/5 rounded-lg text-primary">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-mono text-blue-400">{stat.change}</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-8">
              <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Indexed Content</TabsTrigger>
              <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">User Access</TabsTrigger>
              <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Search Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-24 glass-dark rounded-3xl border-white/5">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {documents.map(doc => (
                    <Card key={doc.id} className="glass-dark border-white/5 hover:border-primary/30 transition-all group overflow-hidden">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-primary group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                            <Search className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white group-hover:text-primary transition-all text-lg">{doc.title}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-widest bg-white/5 border-white/10 text-muted-foreground">
                                {doc.sourceType}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono opacity-60">{doc.department}</span>
                              <span className="text-xs text-muted-foreground font-mono opacity-30">•</span>
                              <span className="text-xs text-muted-foreground font-mono opacity-60">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 glass-dark rounded-3xl border-dashed border-white/10">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No documents indexed yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                    Start by indexing your first document to populate the neural search engine.
                  </p>
                  <Button variant="outline" onClick={() => setIsAdding(true)} className="rounded-full border-white/10 hover:bg-white/5">
                    Index your first document
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="users">
              <Card className="glass-dark border-white/5 p-12 text-center rounded-3xl">
                <p className="text-muted-foreground font-mono text-sm">User management interface coming soon.</p>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="glass-dark border-white/5 p-12 text-center rounded-3xl">
                <p className="text-muted-foreground font-mono text-sm">Real-time search logs coming soon.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Document Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <form onSubmit={handleAddDocument}>
              <div className="p-8 border-b border-white/5 bg-white/5">
                <h2 className="text-2xl font-bold text-white tracking-tight">Index New Content</h2>
                <p className="text-muted-foreground text-sm uppercase tracking-widest font-mono opacity-60">Neural Search Entry Port</p>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Title</label>
                    <Input 
                      placeholder="e.g. Neural Architecture Spec" 
                      className="glass border-white/10 h-11 rounded-xl text-white"
                      value={newDoc.title}
                      onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Internal URL</label>
                    <Input 
                      placeholder="https://neural.lattice.corp/..." 
                      className="glass border-white/10 h-11 rounded-xl text-white"
                      value={newDoc.url}
                      onChange={e => setNewDoc({...newDoc, url: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Description</label>
                  <Input 
                    placeholder="Brief semantic summary for the index..." 
                    className="glass border-white/10 h-11 rounded-xl text-white"
                    value={newDoc.description}
                    onChange={e => setNewDoc({...newDoc, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Source Stream</label>
                    <select 
                      className="w-full h-11 px-3 rounded-xl glass border-white/10 text-sm text-white"
                      value={newDoc.sourceType}
                      onChange={e => setNewDoc({...newDoc, sourceType: e.target.value as SourceType})}
                    >
                      <option value="web" className="bg-black">Web Page</option>
                      <option value="video" className="bg-black">Video</option>
                      <option value="wiki" className="bg-black">Wiki</option>
                      <option value="drive" className="bg-black">Google Drive</option>
                      <option value="slack" className="bg-black">Slack</option>
                      <option value="github" className="bg-black">GitHub</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Sector</label>
                    <Input 
                      placeholder="e.g. Engineering" 
                      className="glass border-white/10 h-11 rounded-xl text-white"
                      value={newDoc.department}
                      onChange={e => setNewDoc({...newDoc, department: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Type</label>
                    <select 
                      className="w-full h-11 px-3 rounded-xl glass border-white/10 text-sm text-white"
                      value={newDoc.fileType}
                      onChange={e => setNewDoc({...newDoc, fileType: e.target.value as FileType})}
                    >
                      <option value="link" className="bg-black">Link</option>
                      <option value="video" className="bg-black">Video</option>
                      <option value="pdf" className="bg-black">PDF</option>
                      <option value="doc" className="bg-black">Document</option>
                      <option value="message" className="bg-black">Message</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Tags (comma separation)</label>
                  <Input 
                    placeholder="neural, data, global" 
                    className="glass border-white/10 h-11 rounded-xl text-white"
                    value={newDoc.tags}
                    onChange={e => setNewDoc({...newDoc, tags: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-8 bg-white/5 border-t border-white/5 flex justify-end gap-3">
                <Button type="button" variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5" onClick={() => setIsAdding(false)}>Abort</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/80 rounded-xl px-10 shadow-[0_0_20px_rgba(59,130,246,0.3)]">Inject into Index</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
