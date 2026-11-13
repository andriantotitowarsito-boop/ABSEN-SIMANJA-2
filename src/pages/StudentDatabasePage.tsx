import React, { useState, useMemo, useEffect } from 'react';
import { Student, SchoolProfile } from '../types';
import {
  Search,
  Plus,
  Upload,
  Download,
  QrCode,
  Trash2,
  Edit3,
  Filter,
  ArrowUpDown,
  Printer,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';
import { downloadStudentTemplate, parseStudentExcel } from '../utils/excel';
import { StudentCardModal } from '../components/StudentCardModal';

interface StudentDatabasePageProps {
  students: Student[];
  profile: SchoolProfile;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onDeleteSelectedStudents: (ids: string[]) => void;
  onDeleteAllStudents: () => void;
  onBulkAddStudents: (newStudents: Student[]) => void;
}

export const StudentDatabasePage: React.FC<StudentDatabasePageProps> = ({
  students,
  profile,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteSelectedStudents,
  onDeleteAllStudents,
  onBulkAddStudents,
}) => {
  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'NAME_ASC' | 'NAME_DESC' | 'NIS_ASC'>('NAME_ASC');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState<'selected' | 'all' | null>(null);

  // Student Card View/Print Modal
  const [selectedCardStudent, setSelectedCardStudent] = useState<Student | null>(null);
  const [isBulkPrintModalOpen, setIsBulkPrintModalOpen] = useState(false);

  // Manual Form State & Inline Validation
  const [formNis, setFormNis] = useState('');
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('X-A');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formError, setFormError] = useState<string | null>(null);

  // Toast Notification
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isParsingUpload, setIsParsingUpload] = useState(false);

  // Unique classes for filter
  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.className));
    return Array.from(set).sort();
  }, [students]);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesQuery =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nis.includes(searchQuery);
        const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
        return matchesQuery && matchesClass;
      })
      .sort((a, b) => {
        if (sortOrder === 'NAME_ASC') {
          return a.name.localeCompare(b.name);
        } else if (sortOrder === 'NAME_DESC') {
          return b.name.localeCompare(a.name);
        } else {
          return a.nis.localeCompare(b.nis);
        }
      });
  }, [students, searchQuery, selectedClass, sortOrder]);

  // Keep selectedIds synchronized with existing students
  useEffect(() => {
    const validIds = new Set(students.map((s) => s.id));
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [students]);

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s.id));

  const someFilteredSelected =
    filteredStudents.some((s) => selectedIds.includes(s.id)) && !allFilteredSelected;

  const handleToggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...filteredStudents.map((s) => s.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormNis('');
    setFormName('');
    setFormClass(classes[0] || 'X-A');
    setFormGender('L');
    setFormError(null);
    setIsManualModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormNis(student.nis);
    setFormName(student.name);
    setFormClass(student.className);
    setFormGender(student.gender || 'L');
    setFormError(null);
    setIsManualModalOpen(true);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNis.trim() || !formName.trim()) {
      setFormError('NIS dan Nama Siswa wajib diisi.');
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        nis: formNis.trim(),
        name: formName.trim(),
        className: formClass.trim(),
        gender: formGender,
        qrData: formNis.trim(),
      });
      setToastNotification(`Data siswa "${formName}" berhasil diperbarui.`);
    } else {
      // Check for duplicate NIS
      if (students.some((s) => s.nis === formNis.trim())) {
        setFormError(`Siswa dengan NIS "${formNis}" sudah terdaftar dalam sistem.`);
        return;
      }

      onAddStudent({
        id: `std-${Date.now()}-${formNis.trim()}`,
        nis: formNis.trim(),
        name: formName.trim(),
        className: formClass.trim(),
        gender: formGender,
        qrData: formNis.trim(),
      });
      setToastNotification(`Siswa baru "${formName}" berhasil ditambahkan.`);
    }

    setIsManualModalOpen(false);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleProcessUpload = async () => {
    if (!uploadFile) return;
    setIsParsingUpload(true);
    setUploadError(null);

    const result = await parseStudentExcel(uploadFile);
    setIsParsingUpload(false);

    if (!result.success || !result.data) {
      setUploadError(result.error || 'Terjadi kesalahan saat memproses file Excel.');
      return;
    }

    onBulkAddStudents(result.data);
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setToastNotification(`Berhasil mengimpor ${result.data.length} siswa baru dari file Excel.`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    const deletedName = studentToDelete.name;
    onDeleteStudent(studentToDelete.id);
    setSelectedIds((prev) => prev.filter((id) => id !== studentToDelete.id));
    setStudentToDelete(null);
    setToastNotification(`Data siswa "${deletedName}" berhasil dihapus dari database.`);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleConfirmBulkDelete = () => {
    if (bulkDeleteMode === 'selected') {
      const count = selectedIds.length;
      onDeleteSelectedStudents(selectedIds);
      setSelectedIds([]);
      setBulkDeleteMode(null);
      setToastNotification(`${count} data siswa terpilih berhasil dihapus dari database.`);
      setTimeout(() => setToastNotification(null), 3500);
    } else if (bulkDeleteMode === 'all') {
      const count = students.length;
      onDeleteAllStudents();
      setSelectedIds([]);
      setBulkDeleteMode(null);
      setToastNotification(`Seluruh data siswa (${count} siswa) berhasil dihapus.`);
      setTimeout(() => setToastNotification(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Header & Action Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Database Siswa & Kartu QR
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola data peserta didik, cetak kartu QR absensi, dan unggah data massal Excel
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Template Excel */}
            <button
              onClick={downloadStudentTemplate}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Download format Excel untuk upload massal"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600 dark:text-slate-300" />
              Template Excel
            </button>

            {/* Upload Excel */}
            <button
              onClick={() => {
                setUploadError(null);
                setUploadFile(null);
                setIsUploadModalOpen(true);
              }}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload Excel
            </button>

            {/* Tambah Manual */}
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Siswa
            </button>

            {/* Cetak Kartu Per Kelas / Terpilih */}
            <button
              onClick={() => setIsBulkPrintModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Cetak kartu absensi per kelas atau seluruh siswa sekaligus"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Cetak Kartu QR ({selectedClass === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedClass}`})
            </button>

            {/* Hapus Keseluruhan Siswa */}
            <button
              type="button"
              disabled={students.length === 0}
              onClick={() => setBulkDeleteMode('all')}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
              title="Hapus seluruh data siswa dari database"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Hapus Semua
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama Siswa atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls} ({students.filter((s) => s.className === cls).length})
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
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-700 dark:text-slate-200"
            >
              <option value="NAME_ASC">Nama Siswa (A - Z)</option>
              <option value="NAME_DESC">Nama Siswa (Z - A)</option>
              <option value="NIS_ASC">Nomor Induk Siswa (NIS)</option>
            </select>
          </div>

          {/* Result Count Info */}
          <div className="flex items-center justify-between sm:justify-end text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
            <span>Menampilkan:</span>
            <span className="font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md ml-1.5 border border-sky-100 dark:border-sky-800">
              {filteredStudents.length} dari {students.length} Siswa
            </span>
          </div>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs transition-all">
          <div className="flex items-center space-x-2.5 text-xs">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-rose-600 text-white font-extrabold">
              {selectedIds.length} Dipilih
            </span>
            <span className="font-semibold text-rose-900 dark:text-rose-200">
              Siswa ditandai untuk tindakan massal
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal Pilih
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteMode('selected')}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Hapus Terpilih ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllFiltered}
                    disabled={filteredStudents.length === 0}
                    className="inline-flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 disabled:opacity-40 cursor-pointer"
                    title={allFilteredSelected ? 'Batalkan pilih semua siswa yang tampil' : 'Pilih semua siswa yang tampil'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : someFilteredSelected ? (
                      <MinusSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-32">NIS</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4 w-28">Kelas</th>
                <th className="py-3.5 px-4 w-20 text-center">JK</th>
                <th className="py-3.5 px-4 w-36 text-center">QR Absensi</th>
                <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Tidak ada data siswa yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const isSelected = selectedIds.includes(std.id);
                  return (
                    <tr
                      key={std.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/25'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-700/40'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(std.id)}
                          className="inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                          aria-label={`Pilih ${std.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-slate-400 dark:text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700 dark:text-sky-400">
                        {std.nis}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                        {std.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                          {std.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                            std.gender === 'P'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-sky-50 text-sky-600'
                          }`}
                        >
                          {std.gender || 'L'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedCardStudent(std)}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold transition-colors text-[11px] cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 mr-1" />
                          Kartu QR
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(std)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Siswa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentToDelete(std)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal: Hapus Data Siswa Tunggal (Clean In-App Modal) */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Hapus Data Siswa</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Konfirmasi penghapusan permanen</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
              Apakah Anda yakin ingin menghapus siswa{' '}
              <strong className="text-slate-900 dark:text-white">{studentToDelete.name}</strong> (NIS:{' '}
              <strong className="font-mono text-sky-700 dark:text-sky-400">{studentToDelete.nis}</strong>, Kelas:{' '}
              <strong className="text-slate-800 dark:text-slate-200">{studentToDelete.className}</strong>)?
            </p>

            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/80 text-[11px] text-rose-800 dark:text-rose-300 font-medium flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                Data siswa dan kode QR terkait akan dihapus secara permanen dari database.
              </span>
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Hapus Siswa Terpilih atau Keseluruhan */}
      {bulkDeleteMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 transition-colors">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {bulkDeleteMode === 'all'
                    ? 'Hapus Seluruh Data Siswa'
                    : `Hapus ${selectedIds.length} Siswa Terpilih`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Konfirmasi penghapusan massal permanen
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
              {bulkDeleteMode === 'all' ? (
                <>
                  Apakah Anda yakin ingin menghapus{' '}
                  <strong className="text-rose-600 dark:text-rose-400">
                    SELURUH {students.length} data siswa
                  </strong>{' '}
                  yang ada di database?
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin menghapus{' '}
                  <strong className="text-rose-600 dark:text-rose-400">
                    {selectedIds.length} siswa yang dipilih
                  </strong>{' '}
                  dari database?
                </>
              )}
            </p>

            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/80 text-[11px] text-rose-800 dark:text-rose-300 font-medium flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>
                {bulkDeleteMode === 'all'
                  ? 'Semua data siswa, kartu QR, dan riwayat absensi terkait akan dihapus permanen dan tidak dapat dikembalikan.'
                  : 'Data siswa terpilih beserta kartu QR dan riwayat absensinya akan dihapus permanen.'}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setBulkDeleteMode(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {bulkDeleteMode === 'all'
                  ? `Ya, Hapus Semua (${students.length})`
                  : `Ya, Hapus Terpilih (${selectedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Siswa Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru (Manual)'}
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveManual} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nomor Induk Siswa (NIS) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 24251001"
                  value={formNis}
                  onChange={(e) => {
                    setFormNis(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  NIS ini akan otomatis di-generate menjadi barcode QR Code kartu absensi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Siswa Lengkap"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: X-A / XI-MIPA 1"
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Excel Siswa Massal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Upload Template Excel Siswa
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-100 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300 space-y-1">
                <p className="font-bold">Format Kolom Excel yang Didukung:</p>
                <p>
                  1. <span className="font-mono font-bold">NIS</span> (Nomor Induk Siswa)
                </p>
                <p>
                  2. <span className="font-mono font-bold">Nama Siswa</span>
                </p>
                <p>
                  3. <span className="font-mono font-bold">Kelas</span> (misal: X-A, XI-MIPA 1)
                </p>
                <p>
                  4. <span className="font-mono font-bold">Jenis Kelamin</span> (L atau P)
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-file-input"
                />
                <label
                  htmlFor="excel-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {uploadFile ? uploadFile.name : 'Pilih File Excel (.xlsx, .xls)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {uploadFile
                      ? `Ukuran: ${(uploadFile.size / 1024).toFixed(1)} KB`
                      : 'Klik untuk memilih file dari komputer Anda'}
                  </p>
                </label>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {uploadError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={downloadStudentTemplate}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-bold flex items-center cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Unduh Contoh Template Excel
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!uploadFile || isParsingUpload}
                    onClick={handleProcessUpload}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    {isParsingUpload ? 'Memproses...' : 'Import Data Siswa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Student QR Card Modal */}
      <StudentCardModal
        student={selectedCardStudent}
        allStudents={students}
        initialClass={selectedClass}
        profile={profile}
        isOpen={Boolean(selectedCardStudent)}
        onClose={() => setSelectedCardStudent(null)}
      />

      {/* Bulk / Class Print Students QR Cards Modal */}
      <StudentCardModal
        student={null}
        allStudents={students}
        initialClass={selectedClass}
        profile={profile}
        isOpen={isBulkPrintModalOpen}
        onClose={() => setIsBulkPrintModalOpen(false)}
      />
    </div>
  );
};
