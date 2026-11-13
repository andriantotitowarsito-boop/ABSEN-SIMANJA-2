import React, { useState } from 'react';
import { SchoolProfile, HolidayRange, AttendanceRecord } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  School,
  Clock,
  Calendar,
  Image,
  Upload,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle,
  FileDown,
  FileUp,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

interface SettingsPageProps {
  profile: SchoolProfile;
  holidays: HolidayRange[];
  attendance: AttendanceRecord[];
  onUpdateProfile: (updated: SchoolProfile) => void;
  onUpdateHolidays: (updated: HolidayRange[]) => void;
  onResetData: () => void;
  onImportFullBackup: (data: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  holidays,
  attendance,
  onUpdateProfile,
  onUpdateHolidays,
  onResetData,
  onImportFullBackup,
}) => {
  const { theme, setTheme } = useTheme();

  // Local profile form state
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [holidayList, setHolidayList] = useState<HolidayRange[]>([...holidays]);

  // New Holiday form
  const [newHolStart, setNewHolStart] = useState('');
  const [newHolEnd, setNewHolEnd] = useState('');
  const [newHolDesc, setNewHolDesc] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [holidayError, setHolidayError] = useState<string | null>(null);

  // Status feedback
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleInputChange = (field: keyof SchoolProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    onUpdateHolidays(holidayList);
    setSaveSuccessMsg('Pengaturan sekolah dan hari libur berhasil disimpan!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Add holiday range
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    setHolidayError(null);
    if (!newHolStart || !newHolEnd || !newHolDesc.trim()) {
      setHolidayError('Lengkapi tanggal mulai, tanggal selesai, dan keterangan libur.');
      return;
    }
    if (newHolStart > newHolEnd) {
      setHolidayError('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.');
      return;
    }

    const newH: HolidayRange = {
      id: `hol-${Date.now()}`,
      startDate: newHolStart,
      endDate: newHolEnd,
      description: newHolDesc.trim(),
    };

    const updated = [...holidayList, newH];
    setHolidayList(updated);
    onUpdateHolidays(updated);
    setNewHolStart('');
    setNewHolEnd('');
    setNewHolDesc('');
    setSaveSuccessMsg('Rentang hari libur baru berhasil ditambahkan.');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeleteHoliday = (id: string) => {
    const updated = holidayList.filter((h) => h.id !== id);
    setHolidayList(updated);
    onUpdateHolidays(updated);
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          handleInputChange('logoUrl', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Background Upload
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          handleInputChange('bgUrl', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Export full backup JSON
  const handleBackupJson = () => {
    const backupObj = {
      profile: formData,
      holidays: holidayList,
      attendance,
      timestamp: new Date().toISOString(),
      school: profile.name,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SI_Absensi_SMAN1Majalaya_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import backup JSON
  const handleImportBackupJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.profile) {
            onImportFullBackup(parsed);
            setFormData(parsed.profile);
            if (parsed.holidays) setHolidayList(parsed.holidays);
            setSaveSuccessMsg('Data backup JSON berhasil di-restore!');
            setTimeout(() => setSaveSuccessMsg(null), 3500);
          }
        } catch (err) {
          setHolidayError('Format file backup JSON tidak valid.');
          setTimeout(() => setHolidayError(null), 3500);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Pengaturan Sistem & Profil Sekolah
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Atur identitas SMAN 1 Majalaya, jam masuk sekolah terintegrasi, kalender rentang libur, dan tema tampilan aplikasi
            </p>
          </div>

          {saveSuccessMsg && (
            <div className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
              {saveSuccessMsg}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Profil Sekolah & Jam Masuk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-700 space-y-4 transition-colors">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Informasi & Profil Sekolah
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  NPSN (Nomor Pokok Sekolah Nasional) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.npsn}
                  onChange={(e) => handleInputChange('npsn', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Status Sekolah
                </label>
                <input
                  type="text"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Kepala Sekolah *
                </label>
                <input
                  type="text"
                  required
                  value={formData.headmaster}
                  onChange={(e) => handleInputChange('headmaster', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Semester Berjalan
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) => handleInputChange('schoolYear', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Alamat Sekolah
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Jam Masuk Setting Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                  Pengaturan Jam Masuk
                </h3>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-center">
                <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-2">
                  Batas Jam Masuk Siswa (WIB)
                </label>
                <input
                  type="time"
                  required
                  value={formData.entryTime}
                  onChange={(e) => handleInputChange('entryTime', e.target.value)}
                  className="text-center text-4xl font-mono font-black text-slate-900 dark:text-white py-2 px-4 bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-2 font-medium">
                  Perubahan jam masuk ini akan <span className="font-bold underline">langsung menyinkronkan</span> seluruh halaman (Dashboard, Live Report, Rekap Kehadiran, & Kedisiplinan)!
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. THEME SWITCHER CARD: Light Mode / Dark Mode Global */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 space-y-4 transition-colors">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Tema Tampilan Aplikasi (Theme Mode)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih preferensi tampilan global. Pilihan akan tersimpan otomatis di browser (localStorage) untuk sesi berikutnya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Option 1: Light Mode */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3.5 cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-50/70 dark:bg-slate-700/60 border-amber-500 text-slate-900 dark:text-white shadow-xs ring-2 ring-amber-400/30'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  theme === 'light'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Mode Terang (Light Mode)
                  </span>
                  {theme === 'light' && (
                    <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-amber-500 text-white">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Tampilan cerah, bersih, dan kontras cerah yang cocok untuk pemakaian siang hari di ruangan terang.
                </p>
              </div>
            </button>

            {/* Option 2: Dark Mode */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3.5 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-xs ring-2 ring-indigo-400/30'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Mode Gelap (Dark Mode)
                  </span>
                  {theme === 'dark' && (
                    <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Tampilan gelap elegan beraksen slate yang nyaman bagi mata saat pencahayaan redup dan menghemat baterai.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Pengaturan Hari Libur (Rentang Tanggal) */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 space-y-5 transition-colors">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Pengaturan Hari Libur Khusus (Rentang Tanggal)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Catatan: Hari Sabtu & Minggu otomatis berstatus libur (Sistem 5 Hari Sekolah). Tambahkan rentang libur lainnya di bawah ini.
              </p>
            </div>
          </div>

          {/* Form Tambah Rentang Tanggal Libur */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
              <Plus className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
              Tambah Rentang Tanggal Libur Baru:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Dari Tanggal (Mulai)
                </label>
                <input
                  type="date"
                  value={newHolStart}
                  onChange={(e) => setNewHolStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Sampai Tanggal (Selesai)
                </label>
                <input
                  type="date"
                  value={newHolEnd}
                  onChange={(e) => setNewHolEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Keterangan Libur
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Libur Awal Ramadhan / UAS"
                  value={newHolDesc}
                  onChange={(e) => setNewHolDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  + Tambah Rentang
                </button>
              </div>
            </div>
            {holidayError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-2">
                {holidayError}
              </p>
            )}
          </div>

          {/* List of configured holiday ranges */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Daftar Rentang Hari Libur Terdaftar ({holidayList.length}):
            </h4>
            {holidayList.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 italic">
                Belum ada rentang libur khusus yang ditambahkan selain Sabtu & Minggu.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {holidayList.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                        {h.description}
                      </span>
                      <span className="text-[11px] font-mono text-rose-700 dark:text-rose-400 mt-0.5 block">
                        {h.startDate} s/d {h.endDate}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHoliday(h.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors cursor-pointer"
                      title="Hapus Rentang Libur"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Upload Logo Sekolah & Background Aplikasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Sekolah */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-700 space-y-4 transition-colors">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <Image className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Upload Logo Sekolah
              </h3>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo SMAN 1 Majalaya" className="w-full h-full object-contain p-1" />
                ) : (
                  <School className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload-input"
                />
                <label
                  htmlFor="logo-upload-input"
                  className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Pilih Gambar Logo (.png / .jpg)
                </label>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('logoUrl', '')}
                    className="block text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    Hapus Logo Kustom (Gunakan Emblem Default)
                  </button>
                )}
                <p className="text-[10px] text-slate-400">
                  Logo akan ditampilkan di Navbar dan seluruh Kartu QR Siswa.
                </p>
              </div>
            </div>
          </div>

          {/* Background Aplikasi */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-700 space-y-4 transition-colors">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Image className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Upload Background Aplikasi
              </h3>
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="hidden"
                id="bg-upload-input"
              />
              <label
                htmlFor="bg-upload-input"
                className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Pilih Background Wallpaper
              </label>

              {formData.bgUrl ? (
                <div className="relative rounded-xl overflow-hidden h-16 border border-slate-200 dark:border-slate-700">
                  <img src={formData.bgUrl} alt="Preview Background" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleInputChange('bgUrl', '')}
                    className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Background saat ini menggunakan tema default clean educational.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 5. Backup, Restore, and Reset */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Pemeliharaan Data & Backup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simpan cadangan data absensi ke file JSON, atau pulihkan data jika berpindah perangkat
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBackupJson}
                className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 mr-1.5" />
                Download Backup JSON
              </button>

              <label className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors">
                <FileUp className="w-3.5 h-3.5 mr-1.5" />
                Restore Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackupJson}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="inline-flex items-center px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Demo Data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kembalikan ke data bawaan awal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tindakan ini akan mengembalikan profil sekolah, daftar siswa, dan riwayat absensi ke data awal SMAN 1 Majalaya. Seluruh perubahan manual akan diatur ulang.
            </p>

            <div className="mt-5 flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetModal(false);
                  setSaveSuccessMsg('Data sistem absensi SMAN 1 Majalaya telah di-reset ke nilai default.');
                  setTimeout(() => setSaveSuccessMsg(null), 3500);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
