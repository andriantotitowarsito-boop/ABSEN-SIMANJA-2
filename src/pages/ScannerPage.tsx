import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Student, AttendanceRecord, SchoolProfile, ScanResultNotification } from '../types';
import {
  Camera,
  RotateCcw,
  Usb,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanLine,
  Keyboard,
  ShieldCheck,
} from 'lucide-react';
import { playSuccessSound, playLateSound, playErrorSound, triggerConfetti } from '../utils/sound';

interface ScannerPageProps {
  students: Student[];
  attendance: AttendanceRecord[];
  profile: SchoolProfile;
  onAttendanceSuccess: (record: AttendanceRecord, student: Student, isDuplicate: boolean) => void;
  onNotification: (notif: ScanResultNotification) => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  students,
  attendance,
  profile,
  onAttendanceSuccess,
  onNotification,
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualNis, setManualNis] = useState<string>('');
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  // Keep fresh references for scanning callback
  const studentsRef = useRef(students);
  studentsRef.current = students;
  const attendanceRef = useRef(attendance);
  attendanceRef.current = attendance;
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Initialize and manage camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      setCameraError(null);
      if (!cameraActive) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          requestAnimationFrame(scanVideoFrame);
        }
      } catch (err: any) {
        console.warn('Camera error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Izin kamera ditolak. Silakan izinkan akses kamera di peramban (browser) Anda, atau gunakan Scanner USB / Input Manual.'
            : 'Kamera tidak ditemukan atau sedang digunakan oleh aplikasi lain. Anda tetap dapat menggunakan Scanner USB!'
        );
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [facingMode, cameraActive]);

  // Frame scanner loop
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        const scannedText = code.data.trim();
        const now = Date.now();

        // Prevent repeated triggers of the same code within 2.5 seconds
        if (scannedText !== lastScannedCodeRef.current || now - lastScannedTimeRef.current > 2500) {
          lastScannedCodeRef.current = scannedText;
          lastScannedTimeRef.current = now;
          handleProcessCode(scannedText, 'KAMERA');
        }
      }
    }

    if (cameraActive) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  const handleProcessCode = (scannedCode: string, method: 'KAMERA' | 'USB_SCANNER' | 'MANUAL') => {
    const studentList = studentsRef.current;
    const currentAttendance = attendanceRef.current;
    const currentProfile = profileRef.current;

    const cleanCode = scannedCode.trim();
    const found = studentList.find(
      (s) => s.nis === cleanCode || s.qrData === cleanCode || s.id === cleanCode
    );

    if (!found) {
      playErrorSound();
      setScanErrorMsg(`Kode QR / NIS "${cleanCode}" tidak terdaftar di database siswa SMAN 1 Majalaya.`);
      setTimeout(() => setScanErrorMsg(null), 4000);
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(
      today.getMinutes()
    ).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`;

    // Check duplicate
    const existing = currentAttendance.find(
      (r) => r.studentNis === found.nis && r.date === dateStr
    );

    if (existing) {
      playLateSound();
      onNotification({
        student: found,
        record: existing,
        isDuplicate: true,
      });
      return;
    }

    // Determine late or on-time
    const [entryH, entryM] = currentProfile.entryTime.split(':').map(Number);
    const entryTotalMin = entryH * 60 + entryM + (currentProfile.toleranceMinutes || 0);
    const currentTotalMin = today.getHours() * 60 + today.getMinutes();

    const isLate = currentTotalMin > entryTotalMin;
    const lateMinutes = isLate ? currentTotalMin - entryTotalMin : 0;

    const newRecord: AttendanceRecord = {
      id: `att-${dateStr}-${found.nis}-${Date.now()}`,
      studentNis: found.nis,
      studentName: found.name,
      className: found.className,
      date: dateStr,
      time: timeStr,
      status: isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU',
      lateMinutes,
      timestamp: Date.now(),
      method,
    };

    if (isLate) {
      playLateSound();
    } else {
      playSuccessSound();
      triggerConfetti();
    }

    onAttendanceSuccess(newRecord, found, false);
    onNotification({
      student: found,
      record: newRecord,
      isDuplicate: false,
    });

    setRecentScans((prev) => [newRecord, ...prev.slice(0, 7)]);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNis.trim()) return;
    handleProcessCode(manualNis.trim(), 'MANUAL');
    setManualNis('');
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="space-y-6">
      {/* Header and USB Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Terminal Scanner QR Code & USB
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Arahkan kartu QR siswa ke kamera, atau cukup scan menggunakan alat Scanner Barcode/QR USB yang terhubung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Global USB Scanner Status Card */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <Usb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>USB Scanner Siap (Berlaku di Semua Halaman)</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">
              Batas Masuk: <span className="text-blue-700 dark:text-blue-400 font-mono">{profile.entryTime} WIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Error Alert Banner */}
      {scanErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 animate-bounce">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{scanErrorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Camera Viewport */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-5 shadow-xl text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[460px]">
          {/* Top Controls on Camera */}
          <div className="w-full flex items-center justify-between mb-4 z-20">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">
                {facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleCameraFacing}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors border border-white/20"
                title="Ganti ke Kamera Depan/Belakang"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Ganti Kamera ({facingMode === 'environment' ? 'Depan' : 'Belakang'})
              </button>

              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors ${
                  cameraActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {cameraActive ? 'Jeda Kamera' : 'Nyalakan Kamera'}
              </button>
            </div>
          </div>

          {/* Camera Frame Container */}
          <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-slate-700 shadow-2xl">
            {cameraError ? (
              <div className="p-6 text-center space-y-3">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">{cameraError}</p>
                <p className="text-[11px] text-emerald-400 font-bold">
                  USB Barcode Scanner tetap dapat digunakan secara langsung!
                </p>
              </div>
            ) : !cameraActive ? (
              <div className="text-center text-slate-400 text-xs">
                Kamera sedang dijeda. Klik "Nyalakan Kamera" untuk mengaktifkan kembali.
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Animated Scanner Reticle & Laser */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-64 h-64 border-2 border-white/40 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Corner Reticle Accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                    {/* Animated Scanning Line */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse"
                      style={{
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 text-center z-10">
            <span className="text-xs text-slate-400 flex items-center justify-center">
              <ScanLine className="w-4 h-4 mr-1 text-emerald-400 animate-pulse" />
              Posisikan QR Code di dalam kotak target pemindaian
            </span>
          </div>
        </div>

        {/* Right 1 Col: USB Scanner Help, Manual Input, & Recent Scans */}
        <div className="space-y-6">
          {/* Manual Input Fallback */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Keyboard className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Input NIS Manual / Barcode
              </h3>
            </div>

            <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Ketik atau Scan NIS Siswa:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Contoh: 24251001"
                    value={manualNis}
                    onChange={(e) => setManualNis(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                Berguna jika kamera laptop tidak mendukung atau saat menguji nomor induk siswa tertentu.
              </p>
            </form>
          </div>

          {/* Recent Scans Widget */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                Riwayat Scan Terkini (Sesi Ini)
              </h3>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-700/60">
              {recentScans.length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Belum ada pemindaian pada sesi aktif ini.
                </div>
              ) : (
                recentScans.map((rec) => {
                  const isOnTime = rec.status === 'TEPAT_WAKTU';
                  return (
                    <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{rec.studentName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          NIS: {rec.studentNis} • {rec.className}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOnTime
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isOnTime ? 'Tepat Waktu' : `Terlambat (${rec.lateMinutes}m)`}
                        </span>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {rec.time} WIB
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
