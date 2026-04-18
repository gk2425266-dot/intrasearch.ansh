import { useState, useEffect } from 'react';
import { UserProfile, UserSettings } from '../types';
import { auth, db } from '../lib/firebase';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Bell, Eye, Shield, Save, CheckCircle2, Moon, Sun, Sparkles, SortAsc, ShieldCheck, MessageSquareText } from 'lucide-react';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  searchSortDefault: 'relevance',
  notificationsEnabled: true,
  safeSearch: true,
  aiTone: 'professional'
};

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance';

export default function SettingsPage({ userProfile }: { userProfile: UserProfile | null }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [settings, setSettings] = useState<UserSettings>(userProfile?.settings || DEFAULT_SETTINGS);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state if userProfile changes
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      if (userProfile.settings) {
        setSettings(userProfile.settings);
      }
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !userProfile) return;

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await updateProfile(auth.currentUser, { displayName });
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { displayName });
      setSuccess('Profile identity updated');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { settings });
      setSuccess('Settings persisted across sessions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setSuccess('Security credentials updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check current password.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 bg-background p-6 md:p-10 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-white tracking-tighter text-glow">Neural Interface Settings</h1>
          <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-widest opacity-60">
            Node: {auth.currentUser?.uid?.substring(0, 8)} | Global Access Persistence
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <nav className="flex flex-col gap-2 sticky top-24">
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'security', icon: Lock, label: 'Security' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'appearance', icon: Eye, label: 'Appearance' },
              ].map((tab) => (
                <Button 
                  key={tab.id}
                  variant="ghost" 
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`justify-start rounded-xl font-medium transition-all ${
                    activeTab === tab.id 
                    ? 'text-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-3" /> {tab.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="md:col-span-3 space-y-8">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-dark border-white/5 overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      Profile Configuration
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Base identification data synced across all neural nodes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Synthetic Identity (Display Name)</label>
                        <Input 
                          className="glass-dark border-white/10 h-14 rounded-xl focus:border-primary/50 transition-all text-white placeholder:text-muted-foreground/30"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Node Alias"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Neural Link (Email)</label>
                        <Input 
                          className="glass-dark border-white/10 h-14 rounded-xl opacity-40 cursor-not-allowed text-white"
                          value={userProfile?.email || ''}
                          disabled
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/80 h-14 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all font-bold">
                        {loading ? 'Transmitting...' : 'Commit Profile Updates'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass-dark border-white/5 overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-500" />
                      </div>
                      Encryption Protocols
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage cryptographic access and account lockdown.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Current Access Key</label>
                        <Input 
                          type="password"
                          className="glass-dark border-white/10 h-14 rounded-xl focus:border-primary/50 transition-all text-white"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">New Cipher</label>
                          <Input 
                            type="password"
                            className="glass-dark border-white/10 h-14 rounded-xl focus:border-primary/50 transition-all text-white"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Confirm Cipher</label>
                          <Input 
                            type="password"
                            className="glass-dark border-white/10 h-14 rounded-xl focus:border-primary/50 transition-all text-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-red-500/10 hover:bg-red-500/20 h-14 rounded-xl border border-red-500/20 transition-all text-red-400 font-bold">
                        {loading ? 'Re-encrypting...' : 'Rotate Security Keys'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <Card className="glass-dark border-white/5 overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-purple-500" />
                      </div>
                      Visual Interface
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Calibration of the neural display environment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Theme Mode</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'dark', icon: Moon, label: 'Obsidian' },
                          { id: 'light', icon: Sun, label: 'Luminescence' },
                          { id: 'neural', icon: Sparkles, label: 'Neural' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => updateSetting('theme', t.id as any)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                              settings.theme === t.id 
                              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
                            }`}
                          >
                            <t.icon className="w-6 h-6 mb-2" />
                            <span className="text-xs font-medium">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <SortAsc className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight">Default Search Lattice</p>
                          <p className="text-[10px] text-muted-foreground font-mono">Preferred ranking algorithm</p>
                        </div>
                      </div>
                      <select 
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                        value={settings.searchSortDefault}
                        onChange={(e) => updateSetting('searchSortDefault', e.target.value as any)}
                      >
                        <option value="relevance">By Significance</option>
                        <option value="date">By Freshness</option>
                      </select>
                    </div>

                    <Button onClick={handleSaveSettings} disabled={loading} className="w-full bg-primary h-14 rounded-xl font-bold">
                      {loading ? 'Processing...' : 'Sync Interface Settings'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <Card className="glass-dark border-white/5 overflow-hidden rounded-3xl">
                  <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-orange-500" />
                      </div>
                      Neural Link Feedback
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Configure how the system communicates with your node.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer" onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}>
                        <div className="flex items-center gap-3">
                          <Bell className={`w-5 h-5 ${settings.notificationsEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="text-sm font-bold text-white tracking-tight">Active Transmissions</p>
                            <p className="text-[10px] text-muted-foreground font-mono tracking-wider">Enable real-time neural alerts</p>
                          </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all relative ${settings.notificationsEnabled ? 'bg-primary' : 'bg-white/10'}`}>
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notificationsEnabled ? 'left-7' : 'left-1'}`} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer" onClick={() => updateSetting('safeSearch', !settings.safeSearch)}>
                        <div className="flex items-center gap-3">
                          <ShieldCheck className={`w-5 h-5 ${settings.safeSearch ? 'text-green-500' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="text-sm font-bold text-white tracking-tight">Neural Filter (Safe Search)</p>
                            <p className="text-[10px] text-muted-foreground font-mono tracking-wider">Protect node from hazardous content</p>
                          </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all relative ${settings.safeSearch ? 'bg-green-500' : 'bg-white/10'}`}>
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.safeSearch ? 'left-7' : 'left-1'}`} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <MessageSquareText className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-sm font-bold text-white tracking-tight">Assistant Harmonic Tune</p>
                            <p className="text-[10px] text-muted-foreground font-mono">Conversational behavioral model</p>
                          </div>
                        </div>
                        <select 
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                          value={settings.aiTone}
                          onChange={(e) => updateSetting('aiTone', e.target.value as any)}
                        >
                          <option value="professional">Professional</option>
                          <option value="technical">Technical</option>
                          <option value="creative">Creative</option>
                        </select>
                      </div>
                    </div>

                    <Button onClick={handleSaveSettings} disabled={loading} className="w-full bg-primary h-14 rounded-xl font-bold">
                      {loading ? 'Transmitting Data...' : 'Persist Node Preferences'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
