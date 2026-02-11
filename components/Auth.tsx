
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { generateId } from '../services/storageService';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (user: User) => void;
}

const ADMIN_EMAIL = 'aljon9353@gmail.com';
const ADMIN_PASSWORD = 'admin123';

const Auth: React.FC<AuthProps> = ({ onLogin, users, onRegister }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const cleanEmail = email.trim().toLowerCase();
    
    // 1. HARDCODED ADMIN BYPASS
    // This ensures the admin can ALWAYS log in even if the database sync is pending or broken.
    if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = {
            id: 'admin1',
            name: 'Aljon Admin',
            email: ADMIN_EMAIL,
            role: UserRole.ADMIN,
            isVerified: true,
            password: ADMIN_PASSWORD
        };
        onLogin(adminUser);
        setIsLoading(false);
        return;
    }

    // 2. Standard user check
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    
    if (!user) {
      setError('Access Denied: Account does not exist. Please create an account to sign in.');
      setIsLoading(false);
      return;
    }
    
    // Verify password
    if (user.password !== password) {
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
      return;
    }
    
    onLogin(user);
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === ADMIN_EMAIL) {
      setError('This email is reserved for Administrator access. Please log in using the default credentials.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Check for existing user to prevent duplicates
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      setError('This email is already registered. Please log in instead.');
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const defaultName = cleanEmail.split('@')[0];
    
    const newUser: User = {
      id: generateId(),
      name: defaultName,
      email: cleanEmail,
      role: UserRole.STUDENT,
      password,
      isVerified: false,
    };

    onRegister(newUser);
    onLogin(newUser);
    setIsLoading(false);
  };

  const resetForm = (newMode: 'LOGIN' | 'SIGNUP') => {
    setMode(newMode);
    setShowPassword(false);
    setPassword('');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* RICH ANIMATED BACKGROUND - GREEN THEME */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 animate-gradient-xy"></div>
      
      {/* Decorative Geometric Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative z-10 transition-all duration-300 hover:shadow-emerald-500/20 mt-4 md:mt-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
          
          <div className="relative z-10 pt-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1 tracking-tight">SLSU Gu App</h1>
            <p className="text-emerald-50 text-sm mt-2 font-medium">
                {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">

          {error && (
            <div className="bg-red-50 text-red-600 text-xs md:text-sm p-4 rounded-xl mb-6 flex items-start animate-fadeIn border border-red-100">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
           {successMsg && !error && (
            <div className="bg-green-50 text-green-600 text-xs md:text-sm p-4 rounded-xl mb-6 flex items-center animate-fadeIn border border-green-100">
              <CheckCircle size={18} className="mr-2 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 md:space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 focus:bg-white font-medium text-slate-800 text-sm md:text-base"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-slate-50/50 focus:bg-white font-medium text-slate-800 text-sm md:text-base"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 md:py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-sm md:text-base"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} strokeWidth={3} />
                  </>
                )}
              </button>

              {/* ADMIN LOGIN HINT */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start animate-fadeIn">
                <Info size={16} className="text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                  <p className="font-bold uppercase tracking-wider mb-1">Administrator Access</p>
                  <p>Email: <span className="font-bold underline">aljon9353@gmail.com</span></p>
                  <p>Password: <span className="font-bold underline">admin123</span></p>
                </div>
              </div>
              
              <div className="text-center mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 font-medium">
                  New to the platform?{' '}
                  <button 
                    type="button" 
                    onClick={() => resetForm('SIGNUP')} 
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: SIGNUP */}
          {mode === 'SIGNUP' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full pl-10 md:pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50/50 focus:bg-white transition-all font-medium text-sm md:text-base"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50/50 focus:bg-white transition-all font-medium text-sm md:text-base"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700 font-medium leading-relaxed">
                Note: You will set your Full Name and Role (Student/Staff) when you create your first request.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 md:py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center mt-4 text-sm md:text-base"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </button>

              <div className="text-center mt-4 pt-4 border-t border-slate-100">
                 <p className="text-sm text-slate-500 font-medium">
                   Already have an account?{' '}
                   <button 
                     type="button" 
                     onClick={() => resetForm('LOGIN')} 
                     className="text-emerald-600 font-bold hover:underline"
                   >
                     Log in
                   </button>
                 </p>
              </div>
            </form>
          )}

        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-4 text-center w-full z-10 pointer-events-none">
        <p className="text-[10px] text-white/50 font-medium">© 2025 SLSU Gu App</p>
      </div>
    </div>
  );
};

export default Auth;
