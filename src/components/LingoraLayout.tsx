import React, { useState, useEffect, useMemo } from 'react';
import { SchoolProfile, Student, AttendanceRecord } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Activity,
  CalendarDays,
  Award,
  Settings,
  QrCode,
  Usb,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  Moon,
  LogOut,
  Plus,
  Crown,
  FolderOpen,
  Clock,
} from 'lucide-react';
import mascotImg from '../assets/images/school_mascot_bird_1794402953726.jpg';

export type ActiveTab =
  | 'dashboard'
  | 'database'
  | 'live-report'
  | 'rekap'
  | 'kedisiplinan'
  | 'pengaturan'
  | 'scanner';

interface LingoraLayoutProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  profile: SchoolProfile;
  students: Student[];
  attendance: AttendanceRecord[];
  onGlobalSearchSelect?: (student: Student) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const LingoraLayout: React.FC<LingoraLayoutProps> = ({
  activeTab,
  onTabChange,
  profile,
  students,
  attendance,
  onLogout,
  children,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isClassesGroupOpen, setIsClassesGroupOpen] = useState(true);
  const [isReportsGroupOpen, setIsReportsGroupOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'agenda' | 'live' | 'calendar'>('calendar');
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsRightPanelOpen(false);
      } else {
        setIsSidebarOpen(true);
        if (activeTab === 'rekap') {
          setIsRightPanelOpen(false);
        } else {
          setIsRightPanelOpen(true);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => {
      if (isSearchFocused) {
        setTimeout(() => setIsSearchFocused(false), 150);
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isSearchFocused]);

  // Today's attendance numbers
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;
  const todayRecords = attendance.filter((r) => r.date === todayStr);
  const totalAttendedToday = todayRecords.length;
  const onTimeToday = todayRecords.filter((r) => r.status === 'TEPAT_WAKTU').length;

  // Search results
  const searchResults = searchQuery.trim()
    ? students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nis.includes(searchQuery) ||
            s.className.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Main Navigation Items (top section like Home, Notes, Goals, Activity)
  const primaryNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'database', label: 'Database Siswa', icon: <Users className="w-4 h-4" />, badge: students.length },
    {
      id: 'live-report',
      label: 'Live Report',
      icon: <Activity className="w-4 h-4" />,
      badge: totalAttendedToday > 0 ? totalAttendedToday : undefined,
    },
    { id: 'kedisiplinan', label: 'Kedisiplinan', icon: <Award className="w-4 h-4" /> },
  ];

  // Secondary Navigation Items
  const utilityNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'rekap', label: 'Rekap Spreadsheet', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'scanner', label: 'Terminal Scanner', icon: <QrCode className="w-4 h-4" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  // Unique classes for sidebar Spaces-style tree
  const uniqueClasses = useMemo(
    () => Array.from(new Set(students.map((s) => s.className))).sort(),
    [students]
  );

  const classDotColors = [
    'bg-rose-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-cyan-500',
  ];

  // Right panel: 5-day date strip around today + selected day
  const calendarDays = useMemo(() => {
    const dayShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + selectedDayOffset);

    const list = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${dayNum}`;
      list.push({
        iso,
        dayName: dayShort[d.getDay()],
        dateNum: d.getDate(),
        isCenter: i === 0,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        monthLabel: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      });
    }
    return list;
  }, [selectedDayOffset]);

  const activeCalendarDay = calendarDays[2];
  const selectedDateRecords = useMemo(
    () => attendance.filter((r) => r.date === activeCalendarDay.iso),
    [attendance, activeCalendarDay]
  );

  // Per-class timeline progress items for right panel (matching Projector right timeline bars)
  const timelineClassProgress = useMemo(() => {
    const colors = [
      { ring: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/90 dark:bg-indigo-950/40', bar: 'border-indigo-200 dark:border-indigo-800/60' },
      { ring: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50/90 dark:bg-sky-950/40', bar: 'border-sky-200 dark:border-sky-800/60' },
      { ring: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/90 dark:bg-emerald-950/40', bar: 'border-emerald-200 dark:border-emerald-800/60' },
      { ring: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/90 dark:bg-amber-950/40', bar: 'border-amber-200 dark:border-amber-800/60' },
      { ring: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/90 dark:bg-rose-950/40', bar: 'border-rose-200 dark:border-rose-800/60' },
    ];

    return uniqueClasses.slice(0, 5).map((cls, idx) => {
      const clsStudents = students.filter((s) => s.className === cls);
      const clsRecords = selectedDateRecords.filter((r) => r.className === cls);
      const pct = clsStudents.length > 0 ? Math.round((clsRecords.length / clsStudents.length) * 100) : 0;
      const onTime = clsRecords.filter((r) => r.status === 'TEPAT_WAKTU').length;

      return {
        className: cls,
        total: clsStudents.length,
        present: clsRecords.length,
        onTime,
        pct,
        style: colors[idx % colors.length],
        offsetClass: idx % 3 === 0 ? 'ml-0 mr-4' : idx % 3 === 1 ? 'ml-4 mr-1' : 'ml-2 mr-2',
      };
    });
  }, [uniqueClasses, students, selectedDateRecords]);

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  // Shared Sidebar Content Component (Projector Left Rail)
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full bg-white dark:bg-slate-900 select-none">
      <div className="space-y-5">
        {/* Top Brand Row */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4f5ce8] to-[#38bdf8] flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5 bg-white" />
              ) : (
                <QrCode className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                SI-ABSENSI
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                SMAN 1 Majalaya
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isMobile) setMobileMenuOpen(false);
              else setIsSidebarOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Menu"
          >
            {isMobile ? <X className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Nav (Dark charcoal active pill like Projector "Home") */}
        <nav className="space-y-1">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#161922] dark:bg-[#4f5ce8] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider & Spaces-style Collapsible Sections */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              Ruang Akademik
            </span>
            <button
              type="button"
              onClick={() => handleSelectTab('database')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              title="Kelola Kelas & Siswa"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expandable Group: Daftar Kelas */}
          <div>
            <button
              type="button"
              onClick={() => setIsClassesGroupOpen(!isClassesGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <FolderOpen className="w-4 h-4 text-slate-400" />
                <span>Daftar Kelas</span>
              </div>
              {isClassesGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isClassesGroupOpen && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-100 dark:border-slate-800 space-y-0.5">
                {uniqueClasses.slice(0, 6).map((cls, idx) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleSelectTab('rekap')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-2 truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          classDotColors[idx % classDotColors.length]
                        }`}
                      />
                      <span className="truncate">{cls}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {students.filter((s) => s.className === cls).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Expandable Group: Tools & Laporan */}
          <div>
            <button
              type="button"
              onClick={() => setIsReportsGroupOpen(!isReportsGroupOpen)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Usb className="w-4 h-4 text-emerald-500" />
                <span>Status Scanner USB</span>
              </div>
              {isReportsGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isReportsGroupOpen && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-100 dark:border-slate-800 px-2.5 py-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Listener aktif di semua halaman. Siswa cukup menempelkan kartu QR.
              </div>
            )}
          </div>
        </div>

        {/* Utility Nav Items (like Docs, Dashboards, Settings) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          {utilityNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#161922] dark:bg-[#4f5ce8] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Area (+ Scan QR Cepat button like "+ New Space") */}
      <div className="pt-4 mt-4 space-y-2.5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleSelectTab('scanner')}
          className="w-full py-2.5 px-4 rounded-xl bg-[#4f5ce8] hover:bg-[#4350d8] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Scan QR Cepat</span>
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Admin</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9e4ff] via-[#eff2ff] to-[#d9efff] dark:from-[#090c15] dark:via-[#0e1222] dark:to-[#0a101d] text-slate-800 dark:text-slate-100 flex justify-center p-2 sm:p-4 lg:p-6 font-sans transition-colors duration-200">
      {/* Main Floating Workspace Window (Projector Aesthetic) */}
      <div className="w-full max-w-[1560px] bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[28px] shadow-[0_24px_60px_-15px_rgba(30,41,59,0.14)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)] border border-white/90 dark:border-slate-800 overflow-hidden flex min-h-[91vh] relative transition-colors duration-200">
        {/* ========================================================= */}
        {/* 1. LEFT SIDEBAR (Collapsible Desktop Rail) */}
        {/* ========================================================= */}
        <aside
          className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 overflow-y-auto ${
            isSidebarOpen
              ? 'w-60 p-4 opacity-100'
              : 'w-0 p-0 border-r-0 opacity-0 overflow-hidden pointer-events-none'
          }`}
        >
          {isSidebarOpen && renderSidebarContent(false)}
        </aside>

        {/* ========================================================= */}
        {/* 2. MOBILE OFF-CANVAS DRAWER SIDEBAR */}
        {/* ========================================================= */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-68 max-w-[82vw] bg-white dark:bg-slate-900 h-full shadow-2xl p-4 z-50 flex flex-col justify-between overflow-y-auto">
              {renderSidebarContent(true)}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. CENTER + RIGHT CONTAINER */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#fbfcfe] dark:bg-[#0d121f]">
          {/* TOP HEADER BAR (Projector Clean Top Strip) */}
          <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
            {/* Left: Menu Toggle & Sleek Search Bar */}
            <div className="flex items-center space-x-3 flex-1 max-w-xl">
              {!isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden lg:inline-flex items-center px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  title="Buka Menu Samping"
                >
                  <PanelLeftOpen className="w-4 h-4 mr-1.5" />
                  <span>Menu</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden inline-flex items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                aria-label="Buka Menu"
              >
                <Menu className="w-4 h-4" />
              </button>

              {/* Universal Search Input */}
              <div
                className="relative flex-1 max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari siswa, NIS, atau kelas..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#f3f5f9] dark:bg-slate-800 border border-transparent focus:border-indigo-300 dark:focus:border-indigo-700 rounded-xl text-xs font-medium placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 transition-all"
                />

                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                      Hasil Pencarian Cepat
                    </div>
                    {searchResults.map((s) => (
                      <div
                        key={s.nis}
                        onClick={() => {
                          handleSelectTab('database');
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="px-3 py-2 hover:bg-indigo-50 dark:hover:bg-slate-700/60 rounded-xl cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{s.name}</p>
                          <p className="text-[10px] text-slate-400">
                            NIS: {s.nis} • Kelas: {s.className}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                          Buka &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Top Controls: Theme, Settings, Bell, User Profile, Right-Panel Switcher */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Settings Shortcut */}
              <button
                type="button"
                onClick={() => handleSelectTab('pengaturan')}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:inline-flex"
                title="Pengaturan Sekolah"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => handleSelectTab('live-report')}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                title="Live Report Absensi"
              >
                <Bell className="w-4 h-4" />
                {totalAttendedToday > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Operator Name & Avatar (like Rafael Davis) */}
              <div className="hidden md:flex items-center space-x-2.5 pl-2 border-l border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                    Admin Operator
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {profile.semester} {profile.schoolYear}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-indigo-50 dark:bg-slate-800 shrink-0">
                  <img
                    src={profile.logoUrl || mascotImg}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Panel Segmented Header (Agenda | Live | Kalender) */}
              <div className="hidden xl:flex items-center space-x-1 pl-3 border-l border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setRightPanelTab('agenda');
                    setIsRightPanelOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isRightPanelOpen && rightPanelTab === 'agenda'
                      ? 'bg-[#161922] dark:bg-[#4f5ce8] text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Agenda
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRightPanelTab('live');
                    setIsRightPanelOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    isRightPanelOpen && rightPanelTab === 'live'
                      ? 'bg-[#161922] dark:bg-[#4f5ce8] text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Live</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold">
                    {totalAttendedToday}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRightPanelTab('calendar');
                    setIsRightPanelOpen(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isRightPanelOpen && rightPanelTab === 'calendar'
                      ? 'bg-[#161922] dark:bg-[#4f5ce8] text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Kalender
                </button>
                <button
                  type="button"
                  onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ml-1"
                  title={isRightPanelOpen ? 'Tutup Panel Kanan' : 'Buka Panel Kanan'}
                >
                  {isRightPanelOpen ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRightOpen className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* CENTER + RIGHT BODY */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Center Scrollable View */}
            <section className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
              {children}
            </section>

            {/* ========================================================= */}
            {/* 4. RIGHT PANEL (Calendar Timeline + Purple Pro Card) */}
            {/* ========================================================= */}
            {isRightPanelOpen && (
              <aside className="hidden xl:flex w-80 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-5 shrink-0 flex-col justify-between space-y-5 overflow-y-auto transition-colors duration-200">
                <div className="space-y-5">
                  {/* Calendar Month Header & Controls */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {activeCalendarDay.monthLabel}
                    </h3>
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400">
                      <button
                        type="button"
                        onClick={() => setSelectedDayOffset((d) => d - 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        title="Hari Sebelumnya"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDayOffset(0)}
                        className="px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDayOffset((d) => d + 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        title="Hari Berikutnya"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 5-Day Horizontal Date Strip */}
                  <div className="grid grid-cols-5 gap-1 text-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    {calendarDays.map((d, idx) => (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setSelectedDayOffset((prev) => prev + (idx - 2))}
                        className={`py-2 rounded-xl transition-all cursor-pointer ${
                          d.isCenter
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4f5ce8] dark:text-indigo-400'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <p className="text-[10px] font-semibold opacity-75">{d.dayName}</p>
                        <p
                          className={`text-sm font-black mt-0.5 ${
                            d.isCenter
                              ? 'text-[#4f5ce8] dark:text-indigo-400'
                              : d.isWeekend
                              ? 'text-rose-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {d.dateNum}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content: Calendar Timeline / Live Feed / Agenda */}
                  {rightPanelTab === 'live' ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>Absensi Masuk Terbaru</span>
                        <span>{selectedDateRecords.length} Siswa</span>
                      </div>
                      {selectedDateRecords.length === 0 ? (
                        <div className="py-10 text-center text-xs text-slate-400">
                          Belum ada absensi pada tanggal ini.
                        </div>
                      ) : (
                        selectedDateRecords.slice(0, 6).map((rec) => (
                          <div
                            key={rec.id}
                            className="p-2.5 rounded-2xl bg-[#f8f9fc] dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                {rec.studentName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {rec.className} • {rec.time} WIB
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                rec.status === 'TEPAT_WAKTU'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {rec.status === 'TEPAT_WAKTU' ? 'Tepat' : `+${rec.lateMinutes}m`}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : rightPanelTab === 'agenda' ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-[#f8f9fc] dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70 space-y-2">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                          <Clock className="w-4 h-4 text-[#4f5ce8]" />
                          <span>Jadwal Masuk Sekolah</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Batas waktu tepat waktu: <strong className="text-slate-800 dark:text-white">{profile.entryTime} WIB</strong>. Sistem aktif 5 hari sekolah (Senin–Jumat).
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#f8f9fc] dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/70 space-y-1.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Ringkasan Hari Ini
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {onTimeToday} tepat waktu, {totalAttendedToday - onTimeToday} terlambat dari {students.length} siswa terdaftar.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Timeline Horizontal Cards matching Projector screenshot */
                    <div className="space-y-3 relative">
                      {timelineClassProgress.map((item) => (
                        <div
                          key={item.className}
                          onClick={() => handleSelectTab('rekap')}
                          className={`${item.offsetClass} ${item.style.bg} border ${item.style.bar} rounded-2xl p-2.5 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {/* Percentage Circle */}
                            <div
                              className={`w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-current ${item.style.ring} flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs`}
                            >
                              {item.pct}%
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                Kelas {item.className}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {item.present}/{item.total} Hadir • {activeCalendarDay.dateNum}{' '}
                                {activeCalendarDay.dayName}
                              </p>
                            </div>
                          </div>

                          <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {item.onTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Vibrant Purple Card matching "Projector Pro" */}
                <div className="rounded-2xl bg-gradient-to-br from-[#a855f7] via-[#7c3aed] to-[#4f46e5] p-5 text-white text-center shadow-lg shadow-indigo-500/25 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/25">
                    <Crown className="w-7 h-7 text-white stroke-[1.75]" />
                  </div>
                  <h4 className="text-xs font-bold leading-relaxed text-white/95 px-1">
                    Kelola absensi QR & cetak kartu siswa lebih cepat dengan SI-ABSENSI Pro
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSelectTab('database')}
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#5b21b6] text-xs font-extrabold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Cetak Kartu QR
                  </button>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
