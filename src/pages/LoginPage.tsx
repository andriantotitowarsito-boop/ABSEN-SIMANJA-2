import React, { useState, useEffect } from 'react';
import { SchoolProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
  QrCode,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import mascotImg from '../assets/images/school_mascot_bird_1794402953726.jpg';

interface LoginPageProps {
  profile: SchoolProfile;
  onLoginSuccess: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ profile, onLoginSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const wibTime = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(now)
    .replace(/\./g, ':');

  const wibDate = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError('Mohon isi username dan password terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    // Small responsive feedback delay
    setTimeout(() => {
      if (trimmedUser === 'admin' && password === '@dmin123') {
        onLoginSuccess(trimmedUser);
      } else {
        setError('Username atau password salah. Silakan periksa kembali.');
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#e9e4ff] via-[#eff2ff] to-[#d9efff] dark:from-[#090c15] dark:via-[#0e1222] dark:to-[#0a101d] text-slate-800 dark:text-slate-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 font-sans transition-colors duration-200"
      style={
        profile.bgUrl
          ? {
              backgroundImage: `url(${profile.bgUrl})`,
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Floating SaaS Window matching Projector Layout */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[1060px] bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[28px] shadow-[0_24px_60px_-15px_rgba(30,41,59,0.14)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)] border border-white/90 dark:border-slate-800 overflow-hidden flex flex-col relative transition-colors duration-200"
      >
        {/* Main Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Panel: Vibrant Indigo-Purple Gradient Hero matching Projector Pro Card */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-[#dbeafe] dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
            {/* Soft decorative orbs */}
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/50 dark:bg-indigo-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-12 w-64 h-64 rounded-full bg-indigo-400/20 dark:bg-purple-500/15 blur-3xl pointer-events-none" />

            {/* Top School Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {profile.logoUrl ? (
                    <img
                      src={profile.logoUrl}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <img
                      src={mascotImg}
                      alt="Mascot SMAN 1 Majalaya"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/80 dark:bg-slate-800/90 text-sky-700 dark:text-sky-300 shadow-2xs">
                    NPSN: {profile.npsn}
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 leading-tight">
                    {profile.name}
                  </h2>
                </div>
              </div>

              {/* Theme Toggle on Login */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 shadow-sm border border-white/60 dark:border-slate-700 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Center Mascot & Headline */}
            <div className="relative z-10 my-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/85 dark:bg-slate-800/85 p-2 shadow-xl border-2 border-white dark:border-slate-700 mb-5 flex items-center justify-center overflow-hidden">
                <img
                  src={mascotImg}
                  alt="Mascot SI-ABSENSI"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-600/15 dark:bg-sky-400/15 text-sky-900 dark:text-sky-300 text-[11px] font-extrabold mb-3">
                <QrCode className="w-3.5 h-3.5" />
                <span>Sistem Absensi QR Code Siswa</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                Selamat Datang di <br className="hidden sm:inline" />
                <span className="text-sky-700 dark:text-sky-400">SI-ABSENSI PRO</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mt-2.5 max-w-md leading-relaxed">
                Aplikasi manajemen absensi QR Code harian, laporan live feed, rekap matriks 5 hari sekolah, dan evaluasi kedisiplinan {profile.regency}.
              </p>
            </div>

            {/* Bottom Live Clock Card */}
            <div className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-white/70 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Waktu Indonesia Barat
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{wibDate}</p>
                </div>
              </div>
              <div className="font-mono text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wider">
                {wibTime}
              </div>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Akses Administrator Terverifikasi</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Masuk ke Dashboard
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Silakan masukkan username dan password operator untuk mengelola absensi sekolah.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start space-x-2.5 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-username"
                    className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="login-username"
                      type="text"
                      autoComplete="username"
                      autoFocus
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Masukkan username"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Masukkan password"
                      className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#4f5ce8] hover:bg-[#4350d8] active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                <span>Tahun Pelajaran {profile.schoolYear}</span>
                <span>Semester {profile.semester}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
