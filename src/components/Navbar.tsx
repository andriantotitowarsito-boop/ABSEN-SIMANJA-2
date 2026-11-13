import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import {
  LayoutDashboard,
  Users,
  Activity,
  CalendarDays,
  Award,
  Settings,
  QrCode,
  Usb,
  Menu,
  X,
  School,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'database'
  | 'live-report'
  | 'rekap'
  | 'kedisiplinan'
  | 'pengaturan'
  | 'scanner';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  profile: SchoolProfile;
  totalStudents: number;
  todayAttendanceCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  profile,
  todayAttendanceCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'database', label: 'Database Siswa', icon: <Users className="w-4 h-4" /> },
    {
      id: 'live-report',
      label: 'Live Report',
      icon: <Activity className="w-4 h-4" />,
      badge: todayAttendanceCount > 0 ? todayAttendanceCount : undefined,
    },
    { id: 'rekap', label: 'Rekap Kehadiran', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'kedisiplinan', label: 'Kedisiplinan', icon: <Award className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
    { id: 'scanner', label: 'Kamera Scanner', icon: <QrCode className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      {/* Top Banner / Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo & School Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-500/20 overflow-hidden border-2 border-white">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo SMAN 1 Majalaya" className="w-full h-full object-contain p-1" />
              ) : (
                <School className="w-6 h-6 text-blue-100" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  KAB. KARAWANG
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  NPSN: {profile.npsn}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sistem Absensi Digital QR Code & Scanner USB
              </p>
            </div>
          </div>

          {/* Right Header Status Widget */}
          <div className="flex items-center space-x-3">
            {/* Global USB Scanner Ready Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <Usb className="w-3.5 h-3.5 text-emerald-600" />
              <span>USB Scanner Aktif (Global)</span>
            </div>

            {/* Jam Masuk quick badge */}
            <div className="hidden lg:flex flex-col text-right pr-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Jam Masuk</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {profile.entryTime} WIB
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 border-t border-slate-100 pt-1 pb-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 font-bold'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="flex items-center space-x-2 px-3 py-2 mb-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
            <Usb className="w-4 h-4 text-emerald-600" />
            <span>Scanner USB Selalu Aktif di Semua Halaman</span>
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
