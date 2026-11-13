import React, { useState, useMemo } from 'react';
import { AttendanceRecord, SchoolProfile, Student } from '../types';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { exportLiveReportExcel } from '../utils/excel';

interface LiveReportPageProps {
  attendance: AttendanceRecord[];
  students: Student[];
  profile: SchoolProfile;
}

export const LiveReportPage: React.FC<LiveReportPageProps> = ({
  attendance,
  students,
  profile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Unique classes for filtering
  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className));
    return Array.from(set).sort();
  }, [students]);

  // Filtered attendance: date match, class match, name/nis search
  // Sorted strictly descending by timestamp (newest attendance on top!)
  const filteredRecords = useMemo(() => {
    return attendance
      .filter((rec) => {
        const matchesDate = rec.date === selectedDate;
        const matchesClass = selectedClass === 'ALL' || rec.className === selectedClass;
        const matchesSearch =
          rec.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.studentNis.includes(searchQuery);
        return matchesDate && matchesClass && matchesSearch;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [attendance, selectedDate, selectedClass, searchQuery]);

  const onTimeCount = filteredRecords.filter((r) => r.status === 'TEPAT_WAKTU').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'TERLAMBAT').length;

  const handleDownloadExcel = () => {
    exportLiveReportExcel(filteredRecords, selectedDate, profile.name);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
                LIVE ATTENDANCE FEED
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Live Report Absensi Siswa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Urutan otomatis real-time: siswa yang baru saja melakukan scan QR berada di paling atas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              onClick={handlePrint}
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

          {/* Filter Tanggal */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-between sm:justify-end space-x-2 text-xs font-bold px-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
              {onTimeCount} Tepat
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800">
              {lateCount} Terlambat
            </span>
          </div>
        </div>
      </div>

      {/* Printable School Header (Only appears when printed) */}
      <div className="hidden print-only mb-6 text-center border-b-2 border-slate-900 pb-4">
        <h2 className="text-xl font-bold uppercase">{profile.name}</h2>
        <p className="text-xs">LAPORAN LIVE KEHADIRAN SISWA</p>
        <p className="text-xs">
          Tanggal: {selectedDate} | Batas Jam Masuk: {profile.entryTime} WIB
        </p>
      </div>

      {/* Live Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-32">NIS</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4 w-28">Kelas</th>
                <th className="py-3.5 px-4 w-36 text-center">Waktu Absensi</th>
                <th className="py-3.5 px-4 w-44 text-center">Keterangan</th>
                <th className="py-3.5 px-4 w-28 text-center no-print">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Belum ada siswa yang melakukan absensi pada filter tanggal ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const isOnTime = rec.status === 'TEPAT_WAKTU';
                  const isVeryRecent = idx === 0;

                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors ${
                        isVeryRecent
                          ? 'bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50 font-semibold'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-700/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400 dark:text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {rec.studentNis}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                        <span>{rec.studentName}</span>
                        {isVeryRecent && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white animate-pulse no-print">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Baru
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                          {rec.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        <div className="inline-flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.time}</span>
                          <span className="text-[10px] text-slate-400 font-sans">WIB</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            isOnTime
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isOnTime ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Hadir Tepat Waktu
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              Terlambat Hadir (+{rec.lateMinutes}m)
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-medium text-[11px] no-print">
                        {rec.method === 'KAMERA' ? 'Kamera Scan' : 'Scanner USB'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
