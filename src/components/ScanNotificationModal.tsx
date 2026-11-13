import React, { useEffect } from 'react';
import { ScanResultNotification } from '../types';
import { CheckCircle2, AlertTriangle, Clock, X, UserCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScanNotificationModalProps {
  notification: ScanResultNotification | null;
  onClose: () => void;
}

export const ScanNotificationModal: React.FC<ScanNotificationModalProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Auto-dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const { student, record, isDuplicate } = notification;
  const isOnTime = record.status === 'TEPAT_WAKTU';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 overflow-hidden border-white dark:border-slate-800"
        >
          {/* Top Status Header */}
          <div
            className={`px-6 py-6 text-white text-center relative ${
              isDuplicate
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                : isOnTime
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : 'bg-gradient-to-r from-amber-500 to-orange-600'
            }`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
              {isDuplicate ? (
                <ShieldAlert className="w-9 h-9 text-white" />
              ) : isOnTime ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-white" />
              )}
            </div>

            <h3 className="text-2xl font-black tracking-tight">
              {isDuplicate
                ? 'SUDAH TERCATAT ABSEN'
                : isOnTime
                ? 'BERHASIL: HADIR TEPAT WAKTU'
                : 'BERHASIL: TERLAMBAT HADIR'}
            </h3>

            <p className="text-white/90 text-sm font-medium mt-1">
              {isDuplicate
                ? 'Siswa ini sudah melakukan absensi hari ini.'
                : isOnTime
                ? 'Terima kasih telah hadir tepat waktu! Semangat belajar!'
                : `Tercatat terlambat ${record.lateMinutes} menit dari jam masuk.`}
            </p>
          </div>

          {/* Student Info Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xl shadow-xs">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Nama Siswa
                </span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {student.name}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <span className="font-mono font-semibold bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                    NIS: {student.nis}
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                    Kelas: {student.className}
                  </span>
                </div>
              </div>
            </div>

            {/* Time & Attendance Badge */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Waktu Masuk</p>
                  <p className="text-base font-mono font-bold text-slate-800 dark:text-slate-100">
                    {record.time} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">WIB</span>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    isOnTime
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isOnTime ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Keterangan</p>
                  <p
                    className={`text-sm font-bold ${
                      isOnTime ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isOnTime ? 'Tepat Waktu' : `Terlambat (${record.lateMinutes}m)`}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Tutup / Siap Scan Berikutnya (Enter)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
