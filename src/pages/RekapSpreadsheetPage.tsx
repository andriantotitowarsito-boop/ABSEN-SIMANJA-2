import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, HolidayRange, SchoolProfile } from '../types';
import {
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpDown,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { isDateHoliday } from '../utils/storage';
import { exportRekapSpreadsheetExcel } from '../utils/excel';

interface RekapSpreadsheetPageProps {
  students: Student[];
  attendance: AttendanceRecord[];
  holidays: HolidayRange[];
  profile: SchoolProfile;
}

export const RekapSpreadsheetPage: React.FC<RekapSpreadsheetPageProps> = ({
  students,
  attendance,
  holidays,
  profile,
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A' | 'NIS'>('A-Z');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const dayNamesIndo = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Calendar days array with day names and holiday check
  const calendarDays = useMemo(() => {
    const list = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
      const dayName = dayNamesIndo[dayOfWeek];
      const { isHoliday, reason } = isDateHoliday(dateStr, holidays);

      list.push({
        dayNumber: day,
        dayName,
        dateStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday,
        holidayReason: reason,
      });
    }
    return list;
  }, [selectedYear, selectedMonth, daysInMonth, holidays]);

  // Unique classes
  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className));
    return Array.from(set).sort();
  }, [students]);

  // Fast map lookup for attendance records: key `${nis}_${dateStr}`
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendance.forEach((r) => {
      map.set(`${r.studentNis}_${r.date}`, r);
    });
    return map;
  }, [attendance]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.includes(searchQuery);
        return matchesClass && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'A-Z') return a.name.localeCompare(b.name);
        if (sortOrder === 'Z-A') return b.name.localeCompare(a.name);
        return a.nis.localeCompare(b.nis);
      });
  }, [students, selectedClass, searchQuery, sortOrder]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleDownloadExcel = () => {
    exportRekapSpreadsheetExcel(
      filteredStudents,
      attendance,
      selectedYear,
      selectedMonth,
      holidays,
      profile.name
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Rekap Kehadiran Siswa (Format Spreadsheet)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kalender tahun berjalan dengan format 5 hari sekolah (Senin - Jumat). Hari Sabtu, Minggu, dan Libur diwarnai merah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            {/* Month & Year Navigation */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl border border-slate-200 dark:border-slate-600">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-xl text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1">
                <span>{monthNames[selectedMonth - 1]}</span>
                <span>{selectedYear}</span>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-xl text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Cetak
            </button>

            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Rekap (.xlsx)
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 no-print">
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

          {/* Sort A-Z */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="A-Z">Nama Siswa (A - Z)</option>
              <option value="Z-A">Nama Siswa (Z - A)</option>
              <option value="NIS">NIS Siswa</option>
            </select>
          </div>

          {/* Month Selector dropdown */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  Bulan {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 no-print">
          <span className="text-[11px] font-bold uppercase text-slate-400">Keterangan:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-6 h-5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] border border-emerald-300 dark:border-emerald-700">
              H
            </span>
            <span>Hadir Tepat Waktu</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-6 h-5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-[10px] border border-amber-300 dark:border-amber-700">
              DT
            </span>
            <span>Datang Terlambat</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-6 h-5 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 font-bold flex items-center justify-center text-[10px] border border-rose-300 dark:border-rose-700">
              TA
            </span>
            <span>Tidak Absen</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-6 h-5 rounded bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold flex items-center justify-center text-[10px] border border-rose-400">
              -
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">Kolom Merah: Libur (Sabtu/Minggu/Khusus)</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              {/* Row 1: Day Names above the dates */}
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th
                  rowSpan={2}
                  className="py-2 px-3 w-10 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 sticky left-0 z-20 text-slate-600 dark:text-slate-300"
                >
                  No
                </th>
                <th
                  rowSpan={2}
                  className="py-2 px-3 w-28 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 sticky left-10 z-20 text-slate-600 dark:text-slate-300"
                >
                  NIS
                </th>
                <th
                  rowSpan={2}
                  className="py-2 px-4 w-48 border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 sticky left-38 z-20 shadow-xs text-slate-600 dark:text-slate-300"
                >
                  Nama Siswa
                </th>
                <th
                  rowSpan={2}
                  className="py-2 px-3 w-24 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                >
                  Kelas
                </th>

                {/* Day Name Columns */}
                {calendarDays.map((d) => (
                  <th
                    key={`name-${d.dayNumber}`}
                    className={`py-1.5 px-1 text-center font-extrabold border-r border-slate-200 dark:border-slate-700 min-w-[32px] ${
                      d.isHoliday
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {d.dayName}
                  </th>
                ))}

                {/* Summary Totals */}
                <th colSpan={3} className="py-1 px-3 text-center bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-l border-blue-200 dark:border-blue-900 font-black">
                  Total Rekap Bulanan
                </th>
              </tr>

              {/* Row 2: Date Numbers (1, 2, 3... 31) */}
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {calendarDays.map((d) => (
                  <th
                    key={`num-${d.dayNumber}`}
                    className={`py-1.5 px-1 text-center font-mono font-bold border-r border-slate-200 dark:border-slate-700 min-w-[32px] ${
                      d.isHoliday
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                    title={d.isHoliday ? `${d.dateStr}: ${d.holidayReason || 'Libur'}` : d.dateStr}
                  >
                    {d.dayNumber}
                  </th>
                ))}

                <th className="py-1.5 px-2 text-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold border-l border-slate-200 dark:border-slate-700 min-w-[50px]">
                  H
                </th>
                <th className="py-1.5 px-2 text-center bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold border-l border-slate-200 dark:border-slate-700 min-w-[50px]">
                  DT
                </th>
                <th className="py-1.5 px-2 text-center bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-extrabold border-l border-slate-200 dark:border-slate-700 min-w-[50px]">
                  TA
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={calendarDays.length + 7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Tidak ada siswa yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  let totalH = 0;
                  let totalDT = 0;
                  let totalTA = 0;

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                      {/* Sticky Columns for Excel-like Frozen Panes */}
                      <td className="py-2.5 px-3 text-center text-slate-400 dark:text-slate-500 font-medium bg-white dark:bg-slate-800 sticky left-0 z-10 border-r border-slate-100 dark:border-slate-700">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 sticky left-10 z-10 border-r border-slate-100 dark:border-slate-700">
                        {std.nis}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 sticky left-38 z-10 border-r border-slate-200 dark:border-slate-700 shadow-xs truncate max-w-[200px]">
                        {std.name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40">
                        {std.className}
                      </td>

                      {/* Day Cells */}
                      {calendarDays.map((d) => {
                        const rec = attendanceMap.get(`${std.nis}_${d.dateStr}`);
                        let cellContent = '-';
                        let cellClass = 'text-slate-400 dark:text-slate-600';

                        if (d.isHoliday) {
                          cellContent = '';
                          cellClass = 'bg-rose-500/15 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60';
                        } else if (rec) {
                          if (rec.status === 'TEPAT_WAKTU') {
                            cellContent = 'H';
                            cellClass = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold';
                            totalH++;
                          } else {
                            cellContent = 'DT';
                            cellClass = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold';
                            totalDT++;
                          }
                        } else {
                          // Check if day is today or in the past
                          const targetDate = new Date(selectedYear, selectedMonth - 1, d.dayNumber, 23, 59, 59);
                          if (targetDate.getTime() <= Date.now()) {
                            cellContent = 'TA';
                            cellClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold';
                            totalTA++;
                          }
                        }

                        return (
                          <td
                            key={d.dayNumber}
                            className={`py-2 px-1 text-center font-mono text-[11px] border-r border-slate-100 dark:border-slate-700/60 ${cellClass}`}
                            title={`${std.name} - ${d.dateStr}: ${cellContent || (d.isHoliday ? 'Libur' : '-')}`}
                          >
                            {cellContent}
                          </td>
                        );
                      })}

                      {/* Totals */}
                      <td className="py-2.5 px-2 text-center font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-l border-slate-200 dark:border-slate-700">
                        {totalH}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold font-mono text-amber-700 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/20 border-l border-slate-100 dark:border-slate-700">
                        {totalDT}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 border-l border-slate-100 dark:border-slate-700">
                        {totalTA}
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
