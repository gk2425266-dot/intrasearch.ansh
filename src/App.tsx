import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import AIAssistant from './components/AIAssistant';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { LogOut, User as UserIcon, Settings, Search } from 'lucide-react';

function Layout({ children, userProfile }: { children: React.ReactNode, userProfile: UserProfile | null }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/30">
      <header className="flex justify-end py-6 px-10 gap-8 items-center sticky top-0 bg-background/40 backdrop-blur-xl z-50 border-b border-white/5">
        <Link to="/" className="text-[13px] text-muted-foreground hover:text-primary transition-all hover:text-glow">Directory</Link>
        <Link to="/" className="text-[13px] text-muted-foreground hover:text-primary transition-all hover:text-glow">Help</Link>
        
        {userProfile ? (
          <div className="flex items-center gap-5">
            {userProfile.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-primary transition-all h-auto p-0">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all hover:border-primary/50 group">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    {userProfile.email[0].toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium group-hover:text-glow">{userProfile.displayName || 'User'}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-dark border-white/10">
                <DropdownMenuLabel>
                  <div className="flex flex-col py-1">
                    <span className="font-semibold text-sm">{userProfile.displayName || 'User'}</span>
                    <span className="text-xs text-muted-foreground truncate">{userProfile.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => navigate('/')} className="focus:bg-white/5">
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="focus:bg-white/5">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link to="/login">
            <Button variant="default" size="sm" className="rounded-full bg-primary hover:bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.4)]">Sign In</Button>
          </Link>
        )}
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <AIAssistant userProfile={userProfile} />
      <footer className="py-8 px-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] text-muted-foreground bg-black/20">
        <div className="flex gap-8">
          <Link to="/" className="hover:text-primary transition-all">Privacy</Link>
          <Link to="/" className="hover:text-primary transition-all">Terms</Link>
          <Link to="/settings" className="hover:text-primary transition-all">Settings</Link>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center font-mono tracking-widest text-[10px] uppercase opacity-50">
            Engine v3.0 // Lattice Neural Index
          </div>
          <div className="text-[11px] font-medium text-primary/80">
            Made by <span className="text-white hover:text-primary transition-colors cursor-default">Ansh Raj</span>
          </div>
        </div>

        <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
          <span className="tracking-tight">System Operational</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          }
        }, (error) => {
          console.error("Profile sync error:", error);
        });
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route 
          path="/" 
          element={
            user ? (
              <Layout userProfile={userProfile}>
                <HomePage userProfile={userProfile} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/search" 
          element={
            user ? (
              <Layout userProfile={userProfile}>
                <ResultsPage userProfile={userProfile} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            user && userProfile?.role === 'admin' ? (
              <Layout userProfile={userProfile}>
                <AdminPage userProfile={userProfile} />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/settings" 
          element={
            user ? (
              <Layout userProfile={userProfile}>
                <SettingsPage userProfile={userProfile} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
