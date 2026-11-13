import React, { useEffect, useState, useMemo } from 'react';
import { Student, SchoolProfile } from '../types';
import { generateQrDataUrl } from '../utils/qrcode';
import { downloadStudentCardPng } from '../utils/cardCanvas';
import {
  X,
  Printer,
  Download,
  QrCode as QrIcon,
  Filter,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Scissors,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface StudentCardModalProps {
  student: Student | null;
  allStudents?: Student[];
  initialClass?: string;
  profile: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  student,
  allStudents = [],
  initialClass = 'ALL',
  profile,
  isOpen,
  onClose,
}) => {
  // Mode: individual single student vs class/bulk print
  const isSingleMode = Boolean(student && (!allStudents || allStudents.length === 0));

  // Filters within modal
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCutLines, setShowCutLines] = useState(true);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [selectedNisList, setSelectedNisList] = useState<string[]>([]);

  // Unique classes from students
  const classOptions = useMemo(() => {
    const list = isSingleMode && student ? [student] : allStudents;
    const set = new Set(list.map((s) => s.className));
    return Array.from(set).sort();
  }, [allStudents, student, isSingleMode]);

  // Filter students based on modal filters
  const filteredStudents = useMemo(() => {
    if (isSingleMode && student) return [student];

    return allStudents.filter((s) => {
      const matchClass = selectedClass === 'ALL' || s.className === selectedClass;
      const matchQuery =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      return matchClass && matchQuery;
    });
  }, [allStudents, student, isSingleMode, selectedClass, searchQuery]);

  // Initialize selected checkboxes when filtered students change
  useEffect(() => {
    if (isOpen) {
      if (isSingleMode && student) {
        setSelectedNisList([student.nis]);
      } else {
        setSelectedNisList(filteredStudents.map((s) => s.nis));
      }
    }
  }, [isOpen, isSingleMode, student, selectedClass]);

  // Target students to actually render for print
  const targetStudents = useMemo(() => {
    if (isSingleMode && student) return [student];
    return filteredStudents.filter((s) => selectedNisList.includes(s.nis));
  }, [filteredStudents, selectedNisList, isSingleMode, student]);

  // Generate QR codes
  useEffect(() => {
    if (!isOpen || targetStudents.length === 0) return;

    let isMounted = true;
    async function loadQrs() {
      const newMap: Record<string, string> = {};
      for (const s of targetStudents) {
        if (!qrMap[s.nis]) {
          const url = await generateQrDataUrl(s.qrData || s.nis);
          newMap[s.nis] = url;
        }
      }
      if (isMounted && Object.keys(newMap).length > 0) {
        setQrMap((prev) => ({ ...prev, ...newMap }));
      }
    }
    loadQrs();

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetStudents]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleToggleSelectAll = () => {
    if (selectedNisList.length === filteredStudents.length) {
      setSelectedNisList([]);
    } else {
      setSelectedNisList(filteredStudents.map((s) => s.nis));
    }
  };

  const handleToggleNis = (nis: string) => {
    setSelectedNisList((prev) =>
      prev.includes(nis) ? prev.filter((id) => id !== nis) : [...prev, nis]
    );
  };

  const handleDownloadSingleQrCode = (nis: string, name: string) => {
    const dataUrl = qrMap[nis];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_Code_${nis}_${name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handleDownloadSingleCardPng = async (s: Student) => {
    const qrUrl = qrMap[s.nis] || (await generateQrDataUrl(s.qrData || s.nis));
    await downloadStudentCardPng(s, profile, qrUrl);
  };

  const handleDownloadAllCards = async () => {
    if (targetStudents.length === 0) return;
    setIsGeneratingAll(true);

    for (let i = 0; i < targetStudents.length; i++) {
      const s = targetStudents[i];
      const qrUrl = qrMap[s.nis] || (await generateQrDataUrl(s.qrData || s.nis));
      await downloadStudentCardPng(s, profile, qrUrl);
      // Small delay between downloads so browser doesn't block multi-download
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsGeneratingAll(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 dark:bg-black/80 backdrop-blur-xs print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:max-h-none print:max-w-none">
        {/* ========================================================= */}
        {/* MODAL HEADER (Hidden during Print) */}
        {/* ========================================================= */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
              <QrIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full">
                  SI-ABSENSI PRINT
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {targetStudents.length} Kartu Terpilih
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {isSingleMode && student
                  ? `Kartu Absensi QR: ${student.name}`
                  : `Cetak Kartu QR Siswa / Kelas`}
              </h3>
            </div>
          </div>

          {/* Action Buttons: Print & Download Batch */}
          <div className="flex items-center space-x-2">
            {!isSingleMode && targetStudents.length > 0 && (
              <button
                type="button"
                disabled={isGeneratingAll}
                onClick={handleDownloadAllCards}
                className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                title="Unduh seluruh kartu yang dipilih sebagai gambar PNG beresolusi tinggi"
              >
                <Download className="w-4 h-4 mr-1.5 text-slate-600 dark:text-slate-300" />
                <span>{isGeneratingAll ? 'Mengunduh...' : 'Unduh Semua HD'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              disabled={targetStudents.length === 0}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2" />
              <span>Cetak {targetStudents.length} Kartu (A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FILTER & PRINT SETTINGS BAR (Hidden during Print) */}
        {/* ========================================================= */}
        {!isSingleMode && (
          <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            {/* Class Filter & Search */}
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden pr-2 cursor-pointer"
                >
                  <option value="ALL" className="dark:bg-slate-800">Semua Kelas ({allStudents.length} Siswa)</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls} className="dark:bg-slate-800">
                      Kelas {cls} ({allStudents.filter((s) => s.className === cls).length} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Inside Modal */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari siswa/NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium w-40 sm:w-48 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Select All Checkbox */}
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:text-sky-900 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-xl cursor-pointer"
              >
                {selectedNisList.length === filteredStudents.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Pilih Semua ({filteredStudents.length})</span>
              </button>
            </div>

            {/* Print Options: Cut Lines */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-semibold select-none">
                <input
                  type="checkbox"
                  checked={showCutLines}
                  onChange={(e) => setShowCutLines(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <Scissors className="w-3.5 h-3.5 text-slate-400" />
                <span>Garis Potong Gunting</span>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PRINTABLE CARDS CONTAINER */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto print:p-0 print:overflow-visible flex-1 bg-slate-100 dark:bg-slate-950 print:bg-white">
          {targetStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
              Tidak ada siswa yang dipilih untuk dicetak. Silakan pilih kelas atau centang siswa.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
              {targetStudents.map((s) => (
                <div
                  key={s.nis}
                  className={`bg-white rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden print-break-inside-avoid print:shadow-none transition-all ${
                    showCutLines
                      ? 'border-2 border-dashed border-slate-300 print:border-slate-400'
                      : 'border-2 border-slate-200 print:border-slate-800'
                  }`}
                  style={{ minHeight: '320px' }}
                >
                  {/* Card Select Checkbox (Hidden on print) */}
                  {!isSingleMode && (
                    <div className="absolute top-2 right-2 z-20 no-print">
                      <button
                        type="button"
                        onClick={() => handleToggleNis(s.nis)}
                        className="p-1 rounded-lg bg-white/90 backdrop-blur-md shadow-xs text-sky-600 hover:bg-sky-50"
                      >
                        {selectedNisList.includes(s.nis) ? (
                          <CheckSquare className="w-4 h-4 fill-sky-100" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Top Color Accent Line */}
                  <div className="h-2.5 bg-gradient-to-r from-blue-700 via-sky-500 to-indigo-700 print:bg-blue-800" />

                  {/* Card Inner Padding */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    {/* Header: School Logo & Identity */}
                    <div className="flex items-center space-x-3 pb-2.5 border-b border-slate-100">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {profile.logoUrl ? (
                          <img
                            src={profile.logoUrl}
                            alt="Logo"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-blue-700 font-black text-xs text-center leading-tight">
                            <span>SMAN 1</span>
                            <span className="text-[9px] text-blue-500">MJL</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                          DINAS PENDIDIKAN JAWA BARAT
                        </p>
                        <h4 className="text-xs sm:text-sm font-black text-blue-900 leading-tight truncate">
                          {profile.name}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-semibold truncate">
                          NPSN: {profile.npsn} • {profile.regency}
                        </p>
                      </div>
                    </div>

                    {/* Card Title Badge */}
                    <div className="text-center py-0.5">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-extrabold tracking-wide uppercase border border-blue-100">
                        KARTU ABSENSI DIGITAL SISWA
                      </span>
                    </div>

                    {/* Body: Student Bio & QR Code */}
                    <div className="flex items-center space-x-3 py-1">
                      {/* Left: Bio */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400">
                            Nama Lengkap Siswa
                          </p>
                          <p className="text-sm font-extrabold text-slate-900 leading-snug truncate">
                            {s.name}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400">NIS</p>
                            <p className="text-xs font-mono font-black text-blue-700">{s.nis}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400">Kelas</p>
                            <p className="text-xs font-extrabold text-slate-800">{s.className}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase font-bold text-slate-400">
                            Tahun Pelajaran
                          </p>
                          <p className="text-[11px] text-slate-600 font-semibold">
                            {profile.schoolYear} ({profile.semester})
                          </p>
                        </div>
                      </div>

                      {/* Right: Crisp QR Code */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="p-1.5 bg-white rounded-xl border-2 border-slate-200 shadow-xs">
                          {qrMap[s.nis] ? (
                            <img
                              src={qrMap[s.nis]}
                              alt={`QR ${s.nis}`}
                              className="w-24 h-24 object-contain"
                            />
                          ) : (
                            <div className="w-24 h-24 flex items-center justify-center text-[10px] text-slate-400 bg-slate-100 rounded-lg">
                              Memuat...
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 font-bold mt-1">
                          {s.nis}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Signature & Notes */}
                    <div className="pt-2 border-t border-slate-100 flex items-end justify-between text-[8.5px] text-slate-500">
                      <div className="max-w-[150px]">
                        <p className="font-medium text-slate-500 italic leading-tight">
                          Wajib dibawa dan discan setiap hari saat jam masuk sekolah.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-700">Kepala Sekolah,</p>
                        <div className="h-4"></div>
                        <p className="font-bold text-slate-900 underline">{profile.headmaster}</p>
                      </div>
                    </div>

                    {/* Action Bar per Card (Hidden during print) */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between no-print text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleDownloadSingleQrCode(s.nis, s.name)}
                        className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium"
                        title="Unduh gambar QR code saja"
                      >
                        <QrIcon className="w-3 h-3 mr-1 text-slate-500" />
                        <span>QR Saja (.png)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingleCardPng(s)}
                        className="inline-flex items-center text-sky-600 hover:text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded-lg"
                        title="Unduh kartu lengkap beresolusi tinggi sebagai gambar PNG"
                      >
                        <Download className="w-3.5 h-3.5 mr-1 text-sky-600" />
                        <span>Unduh Kartu HD (.png)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
