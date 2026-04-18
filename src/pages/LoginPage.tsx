import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Search, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create default profile
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'employee',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      await updateProfile(user, { displayName });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        role: email.includes('admin') ? 'admin' : 'employee', // Simple heuristic for demo
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-2xl border border-white/10 mx-auto mb-6 group hover:border-primary/50 transition-all">
            L
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter text-glow">Neural Access</h1>
          <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-widest opacity-60">Lattice IntraSearch // Identity Protocol</p>
        </div>

        <Card className="glass-dark border-white/5 shadow-2xl rounded-3xl overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-white/5 p-1 rounded-none border-b border-white/5">
              <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all py-4">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all py-4">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-8 space-y-6">
              <form onSubmit={handleEmailSignIn} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Identity Email</label>
                    <Input 
                      type="email" 
                      placeholder="name@lattice.corp" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Access Key</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-all text-white"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/80 h-12 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all" disabled={loading}>
                  {loading ? 'Authorizing...' : 'Authorize Access'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="p-8 space-y-6">
              <form onSubmit={handleEmailSignUp} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <Input 
                      placeholder="Ansh Raj" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Corporate Email</label>
                    <Input 
                      type="email" 
                      placeholder="name@lattice.corp" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-1">Create Access Key</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary/50 transition-all text-white"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/80 h-12 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all" disabled={loading}>
                  {loading ? 'Initializing...' : 'Initialize Protocol'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-8 text-center">
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center gap-3 mx-auto px-6 py-3 rounded-xl glass hover:bg-white/10 transition-all group disabled:opacity-50"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-1">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            </div>
            <span className="text-sm font-medium text-white group-hover:text-glow transition-all">Continue with Neural ID</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
