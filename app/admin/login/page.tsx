'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("adminLogin.error"));
        return;
      }

      // ✅ FIX : vérifier role ET isAdmin
     if (data.role?.toUpperCase() !== 'ADMIN' && !data.isAdmin) {
      setError(t("adminLogin.accessDenied"));
      return;
      }

      router.push('/admin');

    } catch {
      setError(t("adminLogin.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 px-4">

      {/* Card */}
      <div className="w-full max-w-md">

        {/* Logo / Icon */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-500/40 bg-amber-700/20 shadow-lg shadow-amber-900/30">
            <Shield className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">{t("adminLogin.title")}</h1>
          <p className="mt-1 text-sm text-stone-400">Ny Herin'ny Boky — Espace sécurisé</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-300">
                {t("adminLogin.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@nyherinyboky.mg"
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-stone-500 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-300">
                {t("adminLogin.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-stone-500 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-amber-700 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/40 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  {t("adminLogin.loading")}
                </span>
              ) : t("adminLogin.submit")}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-stone-600">
          Accès réservé aux administrateurs — Ny Herin'ny Boky © 2025
        </p>
      </div>
    </div>
  );
}