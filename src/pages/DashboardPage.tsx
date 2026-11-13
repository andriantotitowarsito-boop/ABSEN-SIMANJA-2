import React, { useState, useEffect, useMemo } from 'react';
import { SchoolProfile, Student, AttendanceRecord } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Activity,
  Sliders,
  TrendingUp,
  UserCheck,
  UserX,
  Plus,
  Building2,
  QrCode,
  LayoutList,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardPageProps {
  profile: SchoolProfile;
  students: Student[];
  attendance: AttendanceRecord[];
  onUpdateProfile: (updated: SchoolProfile) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  students,
  attendance,
  onUpdateProfile,
  onNavigateToTab,
}) => {
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEditingEntryTime, setIsEditingEntryTime] = useState(false);
  const [tempEntryTime, setTempEntryTime] = useState(profile.entryTime);
  const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar');
  const [workTab, setWorkTab] = useState<'all' | 'ontime' | 'late' | 'live'>('all');
  const [workViewMode, setWorkViewMode] = useState<'histogram' | 'rows'>('histogram');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIndonesianDate = (d: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const todayStr = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(
    currentTime.getDate()
  ).padStart(2, '0')}`;
  const dateAttendance = attendance.filter((r) => r.date === todayStr);
  const onTimeCount = dateAttendance.filter((r) => r.status === 'TEPAT_WAKTU').length;
  const lateCount = dateAttendance.filter((r) => r.status === 'TERLAMBAT').length;
  const totalAttended = onTimeCount + lateCount;
  const notYetCount = Math.max(0, students.length - totalAttended);
  const attendanceRate = students.length > 0 ? Math.round((totalAttended / students.length) * 100) : 0;

  // Check current status against entry time
  const [entryH, entryM] = profile.entryTime.split(':').map(Number);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const entryMinutes = entryH * 60 + entryM;
  const isPastEntryTime = currentMinutes > entryMinutes;

  // =========================================================
  // Weekly Attendance Trends (Last 5 School Days) using Recharts
  // =========================================================
  const weeklyTrendsData = useMemo(() => {
    const days = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    let count = 0;
    let offset = 0;
    const maxSearchDays = 14;

    while (count < 5 && offset < maxSearchDays) {
      const d = new Date(currentTime);
      d.setDate(d.getDate() - offset);
      const dayOfWeek = d.getDay();

      // Only Monday (1) through Friday (5) - 5 days school week
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dateNum = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dateNum}`;

        const dayRecords = attendance.filter((r) => r.date === dateStr);
        const onTime = dayRecords.filter((r) => r.status === 'TEPAT_WAKTU').length;
        const late = dayRecords.filter((r) => r.status === 'TERLAMBAT').length;
        const present = onTime + late;
        const total = students.length;
        const absent = Math.max(0, total - present);
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        days.unshift({
          dateStr,
          dayName: fullDayNames[dayOfWeek],
          shortLabel: `${dayNames[dayOfWeek]} (${dateNum}/${m})`,
          present,
          onTime,
          late,
          absent,
          total,
          rate,
        });
        count++;
      }
      offset++;
    }
    return days;
  }, [attendance, students, currentTime]);

  const avgAttendanceRate = useMemo(() => {
    if (weeklyTrendsData.length === 0) return 0;
    const sumRate = weeklyTrendsData.reduce((acc, d) => acc + d.rate, 0);
    return Math.round(sumRate / weeklyTrendsData.length);
  }, [weeklyTrendsData]);

  // Group classes for Histogram
  const uniqueClasses = Array.from(new Set(students.map((s) => s.className))).sort();
  const classHistogramData = uniqueClasses.map((className, idx) => {
    const classStudents = students.filter((s) => s.className === className);
    const classTotal = classStudents.length;
    const classAttended = dateAttendance.filter((r) => r.className === className);
    const classOnTime = classAttended.filter((r) => r.status === 'TEPAT_WAKTU').length;
    const classLate = classAttended.filter((r) => r.status === 'TERLAMBAT').length;
    const classAbsent = Math.max(0, classTotal - (classOnTime + classLate));

    const accentBars = [
      'bg-rose-500',
      'bg-blue-500',
      'bg-amber-400',
      'bg-emerald-500',
      'bg-indigo-500',
    ];

    return {
      className,
      total: classTotal,
      onTime: classOnTime,
      late: classLate,
      absent: classAbsent,
      percentage: classTotal > 0 ? Math.round(((classOnTime + classLate) / classTotal) * 100) : 0,
      accentBar: accentBars[idx % accentBars.length],
    };
  });

  // Filtered histogram or live records for "My Work" section
  const filteredHistogram = useMemo(() => {
    if (workTab === 'ontime') return classHistogramData.filter((c) => c.onTime > 0);
    if (workTab === 'late') return classHistogramData.filter((c) => c.late > 0);
    return classHistogramData;
  }, [classHistogramData, workTab]);

  const filteredLiveRows = useMemo(() => {
    if (workTab === 'ontime') return dateAttendance.filter((r) => r.status === 'TEPAT_WAKTU');
    if (workTab === 'late') return dateAttendance.filter((r) => r.status === 'TERLAMBAT');
    return dateAttendance;
  }, [dateAttendance, workTab]);

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProfile({
      ...profile,
      semester: e.target.value as 'Ganjil' | 'Genap',
    });
  };

  const handleSaveEntryTime = () => {
    onUpdateProfile({
      ...profile,
      entryTime: tempEntryTime,
    });
    setIsEditingEntryTime(false);
  };

  const CustomWeeklyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-indigo-400">{data?.dayName}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data?.dateStr}</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" />
                Hadir:
              </span>
              <span className="font-mono font-black text-white">
                {data?.present} ({data?.rate}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-400 mr-1.5" />
                Tidak Hadir:
              </span>
              <span className="font-mono font-black text-rose-300">
                {data?.absent} ({100 - data?.rate}%)
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP FEATURED PROGRESS STRIP (Projector top task bar) */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 px-4 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-[#4f5ce8] dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                Absensi Harian — {profile.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 shrink-0">
                {attendanceRate}% Hadir
              </span>
            </div>
            <div className="mt-1.5 flex items-center space-x-3">
              <div className="w-36 sm:w-48 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4f5ce8] rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {totalAttended}/{students.length} Siswa
              </span>
            </div>
          </div>
        </div>

        {/* Right Avatars + Royal Blue CTA Button */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
          {/* Class Badges Avatars */}
          <div className="flex items-center -space-x-2">
            {uniqueClasses.slice(0, 3).map((cls, i) => (
              <div
                key={cls}
                title={`Kelas ${cls}`}
                className={`w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-black text-white ${
                  i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              >
                {cls.slice(0, 2)}
              </div>
            ))}
            {uniqueClasses.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-extrabold">
                +{uniqueClasses.length - 3}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('scanner')}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-[#4f5ce8] hover:bg-[#424fd4] text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Scan QR</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. LINEUP SECTION -> PROFIL SEKOLAH & JAM DIGITAL WIB */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center space-x-1.5">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Profil Sekolah & Waktu
          </h3>
          <span className="text-xs font-bold text-slate-400">(2)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Card 1: Profil Sekolah (Pink/Rose Left Vertical Stripe) */}
          <div className="md:col-span-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-2xs flex space-x-3.5 transition-colors">
            <div className="w-1.5 rounded-full bg-rose-500 shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {profile.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      NPSN: <strong className="text-slate-700 dark:text-slate-200">{profile.npsn}</strong> • {profile.status}
                    </p>
                  </div>
                  <Building2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                </div>

                <div className="mt-2.5 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="truncate">
                    <span className="text-slate-400">Kepala Sekolah:</span>{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-100">{profile.headmaster}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Tahun Pelajaran:</span>{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-100">{profile.schoolYear}</span>
                  </p>
                </div>
              </div>

              {/* Semester Dropdown (Ganjil / Genap) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Semester Aktif</span>
                <select
                  value={profile.semester}
                  onChange={handleSemesterChange}
                  className="text-xs font-extrabold text-[#4f5ce8] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900 cursor-pointer focus:outline-hidden"
                >
                  <option value="Ganjil" className="dark:bg-slate-800">Ganjil</option>
                  <option value="Genap" className="dark:bg-slate-800">Genap</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Large Digital Clock WIB & Editable Entry Time (Lime/Emerald Left Vertical Stripe) */}
          <div className="md:col-span-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-2xs flex space-x-3.5 transition-colors">
            <div className="w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Waktu Indonesia Barat (WIB)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-0.5 leading-none">
                    {String(currentTime.getHours()).padStart(2, '0')}:
                    {String(currentTime.getMinutes()).padStart(2, '0')}:
                    <span className="text-[#4f5ce8] dark:text-indigo-400">
                      {String(currentTime.getSeconds()).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {formatIndonesianDate(currentTime)}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isPastEntryTime
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {isPastEntryTime ? 'Lewat Masuk' : 'On-Time Window'}
                </span>
              </div>

              {/* Editable Jam Masuk */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Jam Masuk:
                </span>

                {isEditingEntryTime ? (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="time"
                      value={tempEntryTime}
                      onChange={(e) => setTempEntryTime(e.target.value)}
                      className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={handleSaveEntryTime}
                      className="px-2.5 py-1 bg-[#4f5ce8] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTempEntryTime(profile.entryTime);
                      setIsEditingEntryTime(true);
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    title="Klik untuk mengubah batas jam masuk sekolah"
                  >
                    <span className="font-mono">{profile.entryTime} WIB</span>
                    <Sliders className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Dashed Quick Action Card (like "+ Add Task" in Projector) */}
          <button
            type="button"
            onClick={() => onNavigateToTab('scanner')}
            className="md:col-span-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#4f5ce8] dark:hover:border-indigo-500 bg-white/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 p-4 flex flex-col items-center justify-center space-y-1.5 text-slate-500 dark:text-slate-400 hover:text-[#4f5ce8] dark:hover:text-indigo-400 transition-all cursor-pointer min-h-[120px]"
          >
            <div className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Buka Scanner</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TRENDING SECTION -> RINGKASAN HARIAN & WEEKLY TRENDS */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Statistik & Tren Mingguan
            </h3>
            <span className="text-xs font-bold text-slate-400">(3)</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('live-report')}
            className="text-xs font-bold text-[#4f5ce8] dark:text-indigo-400 hover:underline flex items-center cursor-pointer"
          >
            <span>Lihat Live Report</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* 3 Trending Cards matching Projector's Lime / Blue / Amber vertical stripe cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Tepat Waktu */}
          <div
            onClick={() => onNavigateToTab('live-report')}
            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-2xs flex space-x-3 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
          >
            <div className="w-1.5 rounded-full bg-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                Hadir Tepat Waktu
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Masuk sebelum {profile.entryTime} WIB
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {onTimeCount}
                </span>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Siswa</span>
                </span>
              </div>
            </div>
          </div>

          {/* Terlambat */}
          <div
            onClick={() => onNavigateToTab('kedisiplinan')}
            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-2xs flex space-x-3 cursor-pointer hover:border-amber-200 dark:hover:border-amber-800 transition-colors"
          >
            <div className="w-1.5 rounded-full bg-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                Terlambat Hadir
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Lewat dari {profile.entryTime} WIB
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {lateCount}
                </span>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Siswa</span>
                </span>
              </div>
            </div>
          </div>

          {/* Belum Hadir */}
          <div
            onClick={() => onNavigateToTab('rekap')}
            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 p-4 shadow-2xs flex space-x-3 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
          >
            <div className="w-1.5 rounded-full bg-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                Belum Hadir Hari Ini
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dari total {students.length} siswa aktif
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {notYetCount}
                </span>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-400">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Siswa</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Weekly Attendance Trends Card */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/80 shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#4f5ce8] dark:text-indigo-400" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Weekly Attendance Trends (5 Hari Sekolah)
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4f5ce8] dark:text-indigo-300">
                  Rata-rata {avgAttendanceRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Perbandingan total siswa Hadir (Present) vs Tidak Hadir (Absent) 5 hari aktif terakhir
              </p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-700/80 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartMode('bar')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  chartMode === 'bar'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Batang
              </button>
              <button
                type="button"
                onClick={() => setChartMode('area')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  chartMode === 'area'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Area Tren
              </button>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'bar' ? (
                <BarChart
                  data={weeklyTrendsData}
                  margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                  barGap={8}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? '#334155' : '#f1f5f9'}
                  />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, students.length || 30]}
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomWeeklyTooltip />}
                    cursor={{ fill: isDark ? 'rgba(51, 65, 85, 0.35)' : '#f8fafc' }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                    formatter={(value) =>
                      value === 'present' ? 'Siswa Hadir' : 'Tidak Hadir'
                    }
                  />
                  <Bar
                    dataKey="present"
                    name="present"
                    fill="#4f5ce8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="absent"
                    name="absent"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={weeklyTrendsData}
                  margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f5ce8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4f5ce8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={isDark ? '#334155' : '#f1f5f9'}
                  />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, students.length || 30]}
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomWeeklyTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                    formatter={(value) =>
                      value === 'present' ? 'Siswa Hadir' : 'Tidak Hadir'
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    name="present"
                    stroke="#4f5ce8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#presentGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="absent"
                    name="absent"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#absentGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MY WORK EQUIVALENT -> HISTOGRAM KEHADIRAN PER KELAS */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Histogram Kehadiran Per Kelas (Hari Ini)
            </h3>
            <span className="text-xs font-bold text-slate-400">
              ({classHistogramData.length})
            </span>
          </div>

          {/* View Mode Toggle (Histogram vs Live Rows) */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setWorkViewMode('histogram')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                workViewMode === 'histogram'
                  ? 'bg-[#161922] dark:bg-[#4f5ce8] text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Tampilan Histogram Kelas"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setWorkViewMode('rows')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                workViewMode === 'rows'
                  ? 'bg-[#161922] dark:bg-[#4f5ce8] text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Tampilan Daftar Scan Terbaru"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Projector Filter Pill Tabs (Semua | Tepat Waktu | Terlambat | Live Scan) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWorkTab('all')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              workTab === 'all'
                ? 'bg-[#4f5ce8] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
            }`}
          >
            <span>Semua</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                workTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700'
              }`}
            >
              {classHistogramData.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkTab('ontime')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              workTab === 'ontime'
                ? 'bg-[#4f5ce8] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
            }`}
          >
            <span>Tepat Waktu</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                workTab === 'ontime' ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {onTimeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkTab('late')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              workTab === 'late'
                ? 'bg-[#4f5ce8] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700'
            }`}
          >
            <span>Terlambat</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                workTab === 'late' ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}
            >
              {lateCount}
            </span>
          </button>
        </div>

        {/* Rows Container (My Work Horizontal Row Cards) */}
        <div className="space-y-2.5">
          {workViewMode === 'histogram' ? (
            filteredHistogram.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center text-xs text-slate-400">
                Belum ada data kehadiran pada kategori ini hari ini.
              </div>
            ) : (
              filteredHistogram.map((item) => {
                const onTimePct = item.total > 0 ? (item.onTime / item.total) * 100 : 0;
                const latePct = item.total > 0 ? (item.late / item.total) * 100 : 0;
                const absentPct = item.total > 0 ? (item.absent / item.total) * 100 : 0;

                return (
                  <div
                    key={item.className}
                    className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 px-4 py-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    {/* Left Accent + Class Title */}
                    <div className="flex items-center space-x-3 min-w-[160px]">
                      <div className={`w-1 h-9 rounded-full shrink-0 ${item.accentBar}`} />
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {profile.name} / {item.total} Siswa
                        </p>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                          Kelas {item.className}
                        </h4>
                      </div>
                    </div>

                    {/* Middle Stacked Histogram Bar */}
                    <div className="flex-1 max-w-md space-y-1">
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        {item.onTime > 0 && (
                          <div
                            style={{ width: `${onTimePct}%` }}
                            className="bg-emerald-500 transition-all"
                            title={`${item.onTime} Tepat Waktu`}
                          />
                        )}
                        {item.late > 0 && (
                          <div
                            style={{ width: `${latePct}%` }}
                            className="bg-amber-400 transition-all"
                            title={`${item.late} Terlambat`}
                          />
                        )}
                        {item.absent > 0 && (
                          <div
                            style={{ width: `${absentPct}%` }}
                            className="bg-slate-200 dark:bg-slate-600 transition-all"
                            title={`${item.absent} Belum Hadir`}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {item.onTime} Tepat
                        </span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {item.late} Terlambat
                        </span>
                        <span>{item.absent} Belum</span>
                      </div>
                    </div>

                    {/* Right Metric Summary */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                      <span className="text-xs font-mono font-black text-[#4f5ce8] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl">
                        {item.onTime + item.late}/{item.total} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })
            )
          ) : filteredLiveRows.length === 0 ? (
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center text-xs text-slate-400">
              Belum ada siswa yang melakukan scan absensi pada kategori ini hari ini.
            </div>
          ) : (
            filteredLiveRows.slice(0, 8).map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700/80 px-4 py-3 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-1 h-8 rounded-full shrink-0 ${
                      rec.status === 'TEPAT_WAKTU' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-medium">
                      NIS {rec.studentNis} • Kelas {rec.className}
                    </p>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {rec.studentName}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    {rec.time} WIB
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${
                      rec.status === 'TEPAT_WAKTU'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {rec.status === 'TEPAT_WAKTU' ? 'Tepat Waktu' : `Terlambat ${rec.lateMinutes}m`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
