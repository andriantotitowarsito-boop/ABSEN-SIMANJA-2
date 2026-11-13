import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, SchoolProfile } from '../types';
import {
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpDown,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Award,
  Clock,
} from 'lucide-react';
import { exportDisciplineExcel } from '../utils/excel';

interface DisciplinePageProps {
  students: Student[];
  attendance: AttendanceRecord[];
  profile: SchoolProfile;
}

export const DisciplinePage: React.FC<DisciplinePageProps> = ({
  students,
  attendance,
  profile,
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'MOST_LATE' | 'NAME_ASC' | 'NAME_DESC' | 'MINUTES_DESC'>('MOST_LATE');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Unique classes
  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className));
    return Array.from(set).sort();
  }, [students]);

  // Aggregate student discipline stats for the selected month & year
  const disciplineStats = useMemo(() => {
    const monthStr = String(selectedMonth).padStart(2, '0');
    const prefix = `${selectedYear}-${monthStr}`;

    // Filter records for this month
    const monthlyRecords = attendance.filter((r) => r.date.startsWith(prefix));

    return students.map((std) => {
      const studentMonthAtt = monthlyRecords.filter((r) => r.studentNis === std.nis);
      const lateRecords = studentMonthAtt.filter((r) => r.status === 'TERLAMBAT');
      const lateCount = lateRecords.length;
      const totalLateMinutes = lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);

      // Determine discipline status
      let disciplineStatus = 'Sangat Disiplin';
      let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

      if (lateCount === 0) {
        disciplineStatus = 'Sangat Disiplin (0x Terlambat)';
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (lateCount <= 2) {
        disciplineStatus = 'Disiplin Baik (1-2x)';
        badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
      } else if (lateCount <= 4) {
        disciplineStatus = 'Perlu Pembinaan (3-4x)';
        badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      } else {
        disciplineStatus = 'Peringatan / Panggilan Orang Tua (>4x)';
        badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
      }

      return {
        nis: std.nis,
        name: std.name,
        className: std.className,
        gender: std.gender,
        lateCount,
        totalLateMinutes,
        disciplineStatus,
        badgeColor,
      };
    });
  }, [students, attendance, selectedYear, selectedMonth]);

  // Filtered & Sorted
  const filteredData = useMemo(() => {
    return disciplineStats
      .filter((item) => {
        const matchesClass = selectedClass === 'ALL' || item.className === selectedClass;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.nis.includes(searchQuery);
        return matchesClass && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'MOST_LATE') {
          return b.lateCount - a.lateCount || b.totalLateMinutes - a.totalLateMinutes;
        } else if (sortOrder === 'MINUTES_DESC') {
          return b.totalLateMinutes - a.totalLateMinutes;
        } else if (sortOrder === 'NAME_ASC') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
  }, [disciplineStats, selectedClass, searchQuery, sortOrder]);

  // Aggregate metrics
  const totalDisciplined = disciplineStats.filter((s) => s.lateCount === 0).length;
  const totalNeedsGuidance = disciplineStats.filter((s) => s.lateCount >= 3).length;
  const totalLateRecorded = disciplineStats.reduce((sum, s) => sum + s.lateCount, 0);

  const handleDownloadExcel = () => {
    exportDisciplineExcel(
      filteredData,
      monthNames[selectedMonth - 1],
      selectedYear,
      profile.name
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800">
                EVALUASI KETERTIBAN & KEDISIPLINAN
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Kedisiplinan & Keterlambatan Siswa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Laporan akumulasi keterlambatan datang, total menit terlambat, dan klasifikasi pembinaan per bulan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Cetak Laporan
            </button>
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Laporan (.xlsx)
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Siswa Sangat Disiplin</p>
              <p className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
                {totalDisciplined} <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">siswa (0x terlambat)</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-600 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Total Keterlambatan Bulan Ini</p>
              <p className="text-xl font-black text-amber-950 dark:text-amber-100 mt-0.5">
                {totalLateRecorded} <span className="text-xs font-normal text-amber-700 dark:text-amber-400">kejadian terlambat</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Perlu Pembinaan Khusus</p>
              <p className="text-xl font-black text-rose-950 dark:text-rose-100 mt-0.5">
                {totalNeedsGuidance} <span className="text-xs font-normal text-rose-700 dark:text-rose-400">siswa (≥3x terlambat)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama Siswa atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bulan */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  Bulan {name} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="MOST_LATE">Terbanyak Terlambat</option>
              <option value="MINUTES_DESC">Total Menit Terbanyak</option>
              <option value="NAME_ASC">Nama Siswa (A - Z)</option>
              <option value="NAME_DESC">Nama Siswa (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discipline Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-32">NIS</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4 w-28">Kelas</th>
                <th className="py-3.5 px-4 w-36 text-center">Total Terlambat</th>
                <th className="py-3.5 px-4 w-36 text-center">Total Menit</th>
                <th className="py-3.5 px-4 w-56 text-center">Status Kedisiplinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data kedisiplinan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.nis} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {item.nis}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {item.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs ${
                          item.lateCount === 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.lateCount <= 2
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700 font-extrabold'
                        }`}
                      >
                        {item.lateCount} Kali
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                      {item.totalLateMinutes > 0 ? (
                        <span className="text-amber-700 font-bold">
                          {item.totalLateMinutes} Menit
                        </span>
                      ) : (
                        <span className="text-slate-400">0 Menit</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${item.badgeColor}`}
                      >
                        {item.disciplineStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
