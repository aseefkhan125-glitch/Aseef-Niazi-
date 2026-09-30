import React, { useState } from 'react';
import { Shield, Lock, User, KeyRound, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';
import { UserRole } from '../types/tracker';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (role: UserRole, username: string) => void;
  onClose?: () => void;
}

export function LoginModal({ isOpen, onLoginSuccess, onClose }: LoginModalProps) {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = loginId.trim();
    const cleanPass = password.trim();

    // Check User credentials specified by user:
    // Id: AumberGull03019721327
    // Password: 03001696099
    if (
      cleanId.toLowerCase() === 'aumbergull03019721327'.toLowerCase() &&
      cleanPass === '03001696099'
    ) {
      setSuccessMsg('Authentication Successful: Welcome Aumber Gull (03019721327)');
      setTimeout(() => {
        onLoginSuccess('customer', 'Aumber Gull (03019721327)');
      }, 700);
      return;
    }

    // Check Admin credentials
    if (
      (cleanId.toLowerCase() === 'admin' || cleanId.toLowerCase() === 'aseefkhan125@gmail.com') &&
      (cleanPass.toLowerCase() === 'admin' || cleanPass === '03001696099' || cleanPass.toLowerCase() === 'admin123')
    ) {
      setSuccessMsg('Authentication Successful: Welcome Admin Officer Aseef Khan');
      setTimeout(() => {
        onLoginSuccess('admin', 'Officer Aseef Khan (Admin)');
      }, 700);
      return;
    }

    setErrorMsg('Invalid Credentials. Please enter Id: AumberGull03019721327 and Password: 03001696099');
  };

  const handleQuickFillCustomer = () => {
    setLoginId('AumberGull03019721327');
    setPassword('03001696099');
    setErrorMsg(null);
  };

  const handleQuickFillAdmin = () => {
    setLoginId('aseefkhan125@gmail.com');
    setPassword('admin');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-2">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            Secure Portal Authentication
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access Live Cellular Tracking & Voice Dispatch Grid
          </p>
        </div>

        {/* Quick Fill Helpers */}
        <div className="mb-4 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Quick Auto-Fill Credentials:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickFillCustomer}
              className="py-1.5 px-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Aumber Gull (User)</span>
            </button>
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="py-1.5 px-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>Officer Aseef (Admin)</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Login ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="AumberGull03019721327"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Required: <span className="text-amber-400 font-mono">AumberGull03019721327</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="03001696099"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Required: <span className="text-amber-400 font-mono">03001696099</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Authenticate & Enter Grid</span>
          </button>
        </form>
      </div>
    </div>
  );
}
