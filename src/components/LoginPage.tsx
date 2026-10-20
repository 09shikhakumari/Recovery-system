import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  BookOpen,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    loginAsDemoStudent 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [major, setMajor] = useState('Computer Science');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name, studentId, major);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      if (errorMsg.includes('user-not-found') || errorMsg.includes('wrong-password') || errorMsg.includes('invalid-credential')) {
        setError('Invalid university email or password. You can also try instant 1-Click Demo Login below.');
      } else if (errorMsg.includes('email-already-in-use')) {
        setError('This university email is already registered. Please sign in instead.');
      } else {
        setError(errorMsg.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Google sign-in error';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Campus Mesh */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-200/50 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Logo with Modern Vibrant Gradient */}
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-3">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
          NPP Institute
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Student Portal · Missed Class Recovery & Attendance Tracker
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/90 space-y-6">
          {/* Auth Mode Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (SSO)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register Student
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('demo');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'demo'
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ 1-Click Demo
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Mode 1 & 2: Email Sign In or Registration Form */}
          {mode !== 'demo' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Alex Mercer"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student ID #
                      </label>
                      <input
                        type="text"
                        placeholder="#8492019"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Major / Program
                      </label>
                      <input
                        type="text"
                        placeholder="Computer Science"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University (.edu) Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setError('Contact campus IT or use 1-Click Demo student mode.')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Student Portal' : 'Create Student Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Campus SSO Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Workspace for Education</span>
              </button>
            </form>
          ) : (
            /* Mode 3: Instant 1-Click Demo Profiles */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select a Test Student Persona
                </div>
                <p className="text-xs text-slate-500">
                  Instant access pre-loaded with realistic undergraduate course schedules, absences, and recovery milestones.
                </p>
              </div>

              <div className="space-y-3">
                {/* Profile 1: Alex Mercer */}
                <div
                  onClick={() => loginAsDemoStudent('alex')}
                  className="p-3.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={DEMO_PROFILES.alex.avatarUrl}
                      alt="Alex Mercer"
                      className="w-10 h-10 rounded-full object-cover border border-indigo-300"
                    />
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Alex Mercer
                      </div>
                      <div className="text-xs text-slate-500">
                        Junior · CS Major · 2 Active Recovery Plans
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-600 text-white rounded-lg shadow-xs group-hover:bg-indigo-700">
                    Sign In
                  </span>
                </div>

                {/* Profile 2: Jordan Taylor */}
                <div
                  onClick={() => loginAsDemoStudent('jordan')}
                  className="p-3.5 bg-rose-50/40 hover:bg-rose-50/70 border border-rose-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center font-bold text-rose-700 text-sm">
                      JT
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                        Jordan Taylor
                      </div>
                      <div className="text-xs text-slate-500">
                        Sophomore · Pre-Med · <strong className="text-rose-600">Debarment Risk (75%)</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded-lg group-hover:bg-slate-800">
                    Sign In
                  </span>
                </div>

                {/* Profile 3: Taylor Reed */}
                <div
                  onClick={() => loginAsDemoStudent('taylor')}
                  className="p-3.5 bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-700 text-sm">
                      TR
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        Taylor Reed
                      </div>
                      <div className="text-xs text-slate-500">
                        Senior · Economics · 100% Attendance Safe
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded-lg group-hover:bg-slate-800">
                    Sign In
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Institutional Trust markers */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>FERPA Compliant</span>
            </span>
            <span>·</span>
            <span>University SSO Protocol</span>
          </div>
        </div>

        {/* Feature Pills under card */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <span className="font-semibold block text-slate-900">72-Hour Catchup</span>
            <span className="text-[11px] text-slate-500">Structured roadmap</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <BookOpen className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <span className="font-semibold block text-slate-900">Peer Notes</span>
            <span className="text-[11px] text-slate-500">Classmate network</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <span className="font-semibold block text-slate-900">Email Drafts</span>
            <span className="text-[11px] text-slate-500">Professor ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
