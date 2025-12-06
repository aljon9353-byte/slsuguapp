import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { generateId } from '../services/storageService';
import { Mail, Lock, ArrowRight, CheckCircle, Loader2, AlertCircle, RefreshCw, Eye, EyeOff, Facebook, Database, Smartphone } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (user: User) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Auth: React.FC<AuthProps> = ({ onLogin, users, onRegister }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'VERIFY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Helper: Simulate sending email API
  const simulateSendEmail = async (targetEmail: string, code: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`SLSU Gu App Verification Code: ${code}\n\n(This is a demo. In a real app, this code would be sent to ${targetEmail})`);
    setIsLoading(false);
    return true;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSocialLogin = async (provider: 'GOOGLE' | 'FACEBOOK') => {
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const socialEmail = provider === 'GOOGLE' ? 'demo.google@slsu.edu' : 'demo.facebook@slsu.edu';
    const socialName = provider === 'GOOGLE' ? 'Google User' : 'Facebook User';

    // Check if user exists
    let user = users.find(u => u.email === socialEmail);

    if (!user) {
        // Create new if not exists
        user = {
            id: generateId(),
            name: socialName,
            email: socialEmail,
            role: UserRole.STUDENT,
            course: '', 
            isVerified: true,
            password: 'social-login-autogen', // Dummy password
        };
        onRegister(user);
    }

    onLogin(user);
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const cleanEmail = email.trim();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    
    if (!user) {
      setError('User not found. Please sign up or check your spelling.');
      return;
    }
    if (user.password !== password) {
      setError('Invalid password.');
      return;
    }
    if (!user.isVerified) {
      setTempUser(user);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      await simulateSendEmail(user.email, code);
      setMode('VERIFY');
      return;
    }
    onLogin(user);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const cleanEmail = email.trim();

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    
    // Default Name derived from email
    const defaultName = cleanEmail.split('@')[0];

    if (existingUser) {
      if (existingUser.isVerified) {
        setMode('LOGIN');
        setPassword('');
        setError('');
        setSuccessMsg(`Welcome back! Please enter your password to log in.`);
        return;
      } else {
        setTempUser({ 
          ...existingUser, 
          password 
        });
      }
    } else {
      const newUser: User = {
        id: generateId(),
        name: defaultName, // Placeholder name
        email: cleanEmail,
        role: UserRole.STUDENT, // Default role, user updates this in RequestForm
        password,
        isVerified: false,
      };
      setTempUser(newUser);
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    await simulateSendEmail(cleanEmail, code);
    setMode('VERIFY');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (verificationCode === generatedCode && tempUser) {
      const verifiedUser = { ...tempUser, isVerified: true };
      onRegister(verifiedUser);
      onLogin(verifiedUser);
    } else {
      setError('Invalid verification code.');
    }
  };

  const handleResendCode = async () => {
    if (!tempUser) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    await simulateSendEmail(tempUser.email, code);
    setSuccessMsg('New code sent!');
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
      
      {/* RICH ANIMATED BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 animate-gradient-xy"></div>
      
      {/* Decorative Geometric Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* 
          WATERMARK BACKGROUND
      */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
         <img 
           src="/slsu_gumaca_seal.png" 
           onError={(e) => { e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/en/3/36/Southern_Luzon_State_University_seal.svg"; }}
           alt="SLSU Background" 
           className="w-[120%] md:w-[60%] max-w-[800px] object-contain opacity-[0.2]"
         />
      </div>

      {/* STORAGE INFO BANNER */}
      <div className="absolute top-0 left-0 w-full z-50 bg-indigo-900/80 backdrop-blur-md text-white py-2 px-4 text-center text-xs font-medium border-b border-indigo-500/30 flex items-center justify-center">
         <Database size={14} className="mr-2 text-indigo-300" />
         <span>
           <span className="font-bold text-indigo-200">Local Demo Mode:</span> Data is stored on this device only. It will not sync to other devices.
         </span>
         <Smartphone size={14} className="ml-2 text-indigo-300" />
      </div>

      <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative z-10 transition-all duration-300 hover:shadow-indigo-500/20 mt-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md mb-4 border border-white/20 shadow-lg transform rotate-3">
              <span className="text-3xl font-black text-white tracking-tighter">SL</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">SLSU Gu</h1>
            <p className="text-indigo-100 text-sm font-semibold tracking-wide uppercase opacity-90">App Portal</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start animate-fadeIn border border-red-100">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
           {successMsg && (
            <div className="bg-green-50 text-green-600 text-sm p-4 rounded-xl mb-6 flex items-center animate-fadeIn border border-green-100">
              <CheckCircle size={18} className="mr-2 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 focus:bg-white font-medium text-slate-800"
                    placeholder="student@slsu.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 focus:bg-white font-medium text-slate-800"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
              </button>
              
              {/* Social Login Section */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                    type="button"
                    onClick={() => handleSocialLogin('GOOGLE')}
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all bg-white text-slate-600 font-bold text-sm shadow-sm active:scale-95"
                >
                    <GoogleIcon />
                    <span className="ml-2">Google</span>
                </button>
                <button 
                    type="button"
                    onClick={() => handleSocialLogin('FACEBOOK')}
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all bg-white text-slate-600 font-bold text-sm shadow-sm group active:scale-95"
                >
                    <Facebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" fillOpacity={0.1} />
                    <span className="ml-2">Facebook</span>
                </button>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 font-medium">
                  New to the platform?{' '}
                  <button 
                    type="button" 
                    onClick={() => resetForm('SIGNUP')} 
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {mode === 'SIGNUP' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50/50 focus:bg-white transition-all font-medium"
                    placeholder="student@slsu.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50/50 focus:bg-white transition-all font-medium"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-700 font-medium">
                Note: You will set your Full Name and Role (Student/Staff) when you create your first request.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
              </button>

              {/* Social Login Section */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                    type="button"
                    onClick={() => handleSocialLogin('GOOGLE')}
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all bg-white text-slate-600 font-bold text-sm shadow-sm active:scale-95"
                >
                    <GoogleIcon />
                    <span className="ml-2">Google</span>
                </button>
                <button 
                    type="button"
                    onClick={() => handleSocialLogin('FACEBOOK')}
                    disabled={isLoading}
                    className="flex items-center justify-center py-3 px-4 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all bg-white text-slate-600 font-bold text-sm shadow-sm group active:scale-95"
                >
                    <Facebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" fillOpacity={0.1} />
                    <span className="ml-2">Facebook</span>
                </button>
              </div>

              <div className="text-center mt-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => resetForm('LOGIN')} 
                  className="text-sm text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {mode === 'VERIFY' && (
            <div className="animate-fadeIn">
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-center">
                 <p className="text-xs text-amber-800 font-extrabold uppercase tracking-wider mb-2">Demo Mode</p>
                 <p className="text-sm text-amber-700 font-medium">Your verification code is: <span className="font-mono font-bold text-lg bg-amber-100 px-3 py-1 rounded ml-2 text-amber-900 border border-amber-200">{generatedCode}</span></p>
               </div>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-green-50 shadow-inner">
                  <Mail className="text-green-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Verify Email</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  We sent a code to <span className="text-slate-900 font-bold">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full text-center text-4xl font-mono font-bold tracking-[0.5em] py-5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-indigo-600 bg-slate-50"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                />

                <button
                  type="submit"
                  disabled={verificationCode.length !== 6}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <CheckCircle size={20} strokeWidth={3} />
                  <span>Verify Account</span>
                </button>

                <div className="flex items-center justify-between text-sm pt-4">
                   <button 
                    type="button" 
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                   >
                     {isLoading ? <Loader2 size={14} className="animate-spin mr-1.5"/> : <RefreshCw size={14} className="mr-1.5"/>}
                     Resend Code
                   </button>
                   <button 
                    type="button" 
                    onClick={() => {
                      setMode('SIGNUP');
                      setVerificationCode('');
                    }}
                    className="text-slate-400 hover:text-slate-600 font-medium"
                   >
                     Change Email
                   </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;