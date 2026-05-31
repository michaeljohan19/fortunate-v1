import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';

// --- TYPES ---
// 👇 NEW: Added 'choose-username' to our views
type AuthView = 'login' | 'signup' | 'forgot' | 'choose-username';

interface AuthScreenProps {
  onLoginSuccess: (user: { username: string; email: string; uid: string }) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [view, setView] = useState<AuthView>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // 👇 NEW: Temporary state to hold the Google email while they pick a username
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- AUTO LOGIN LOGIC ---
  useEffect(() => {
    const savedSession = localStorage.getItem('arcade_user_session');
    if (savedSession) {
      const user = JSON.parse(savedSession);
      onLoginSuccess(user);
    }
  }, [onLoginSuccess]);

  // --- STANDARD EMAIL/PASSWORD HANDLER ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      if (view === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // 👇 UPDATE: Grab the UID and pass it to the saved user
        const loggedInUser = { username, email, uid: cred.user.uid };
        localStorage.setItem('arcade_user_session', JSON.stringify(loggedInUser));
        onLoginSuccess(loggedInUser);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // 👇 UPDATE: Grab the UID (Mocking username since Firebase email login doesn't store it by default)
        const loggedInUser = { username: 'Student', email, uid: cred.user.uid };
        localStorage.setItem('arcade_user_session', JSON.stringify(loggedInUser));
        onLoginSuccess(loggedInUser);
      }

    } catch (error: any) {
      console.error("Auth Error:", error);
      setErrorMsg(error.message.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  // --- GOOGLE HANDLER (INTERCEPTED) ---
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Trigger the Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Save their email temporarily
      setPendingGoogleEmail(result.user.email || '');
      
      // 3. Switch to the Username selection screen! (DO NOT log them in yet)
      setView('choose-username');

    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      setErrorMsg("Google Sign-In failed or was closed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 NEW: FINAL GOOGLE SUBMIT HANDLER
  const handleGoogleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. THE FIX: Check if Firebase actually has the user before proceeding!
    if (!auth.currentUser) {
      setErrorMsg("Authentication lost. Please try signing in again.");
      return;
    }

    if (!username.trim()) {
      setErrorMsg("Please enter a valid username.");
      return;
    }

    // 2. Combine their chosen username with their Google Email
    const finalGoogleUser = { 
      username: username.trim(), 
      email: pendingGoogleEmail,
      // 3. THE FIX: Because of the check above, TypeScript now 100% KNOWS this is a string!
      uid: auth.currentUser.uid 
    };
    
    // 4. Save and enter the game!
    localStorage.setItem('arcade_user_session', JSON.stringify(finalGoogleUser));
    onLoginSuccess(finalGoogleUser);
  };

  // --- PASSWORD RESET ---
  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address first!");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');

    try {
      await sendPasswordResetEmail(auth, email);
      alert("System Override Link sent! Check your email inbox.");
      setView('login');
    } catch (error: any) {
      setErrorMsg(error.message.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderInput = (type: string, placeholder: string, value: string, onChange: (val: string) => void) => (
    <input
      type={type}
      required
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
    />
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 fade-in">
        
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] tracking-tighter">
            FORTUNATE
          </h1>
          <p className="text-slate-400 font-bold tracking-widest text-sm uppercase mt-2">
            Execute your Luck!
          </p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md border-4 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-xs font-bold text-center animate-pulse">
              ⚠️ {errorMsg}
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <div className="flex bg-slate-900 rounded-xl p-1 mb-8 border-2 border-slate-700">
              <button 
                onClick={() => { setView('login'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg font-black text-sm uppercase tracking-widest transition-all ${view === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => { setView('signup'); setErrorMsg(''); }}
                className={`flex-1 py-2 rounded-lg font-black text-sm uppercase tracking-widest transition-all ${view === 'signup' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* STANDARD LOG IN / SIGN UP FORMS */}
          {(view === 'login' || view === 'signup') && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {view === 'signup' && renderInput('text', 'Username', username, setUsername)}
              {renderInput('email', 'Email Address', email, setEmail)}
              {renderInput('password', 'Password', password, setPassword)}
              
              {view === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={() => setView('forgot')} className="text-xs font-black text-yellow-400 hover:text-yellow-300 uppercase tracking-wider transition-colors">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-lg uppercase tracking-widest py-4 rounded-xl transform transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] mt-4 ${isLoading ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isLoading ? 'Processing...' : (view === 'login' ? 'Initiate Link' : 'Register Account')}
              </button>

              <div className="flex items-center gap-4 my-6 opacity-50">
                <div className="h-0.5 flex-1 bg-slate-600 rounded-full" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">OR</span>
                <div className="h-0.5 flex-1 bg-slate-600 rounded-full" />
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full bg-white hover:bg-slate-100 text-slate-900 font-black text-sm uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Gmail
              </button>
            </form>
          )}

          {/* 👇 NEW: GOOGLE USERNAME INTERCEPT VIEW */}
          {view === 'choose-username' && (
            <form onSubmit={handleGoogleUsernameSubmit} className="text-center animate-fade-in space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Welcome!</h3>
              <p className="text-sm text-slate-400 font-bold mb-6">
                Google account linked successfully. <br/> Please choose a unique Gamer Tag to continue.
              </p>
              
              {renderInput('text', 'Enter Username', username, setUsername)}
              
              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-lg uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Complete Link
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  auth.signOut(); // Clean up the firebase session if they cancel
                  setView('login');
                }} 
                className="text-xs font-bold text-slate-500 hover:text-yellow-400 uppercase tracking-widest pt-4 transition-colors"
              >
                Cancel Authentication
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <div className="text-center animate-fade-in space-y-4">
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">System Override</h3>
              <p className="text-sm text-slate-400 font-bold mb-6">Enter your email and the system will send an override link.</p>
              
              {renderInput('email', 'Email Address', email, setEmail)}
              
              <button 
                type="button" 
                onClick={handleResetPassword}
                disabled={isLoading} 
                className={`w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-lg uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.3)] mt-4 transition-all ${isLoading ? 'opacity-50' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isLoading ? 'Processing...' : 'Send Link'}
              </button>
              <button type="button" onClick={() => setView('login')} className="text-xs font-bold text-slate-500 hover:text-purple-400 uppercase tracking-widest pt-4 transition-colors">
                Cancel Override
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}