import React, { useEffect, useRef } from 'react';
import { Student, AttendanceRecord, SchoolProfile, ScanResultNotification } from '../types';
import { playSuccessSound, playLateSound, playErrorSound, triggerConfetti } from '../utils/sound';

interface GlobalUSBScannerProps {
  students: Student[];
  attendance: AttendanceRecord[];
  profile: SchoolProfile;
  onAttendanceSuccess: (record: AttendanceRecord, student: Student, isDuplicate: boolean) => void;
  onNotification: (notif: ScanResultNotification) => void;
}

export const GlobalUSBScanner: React.FC<GlobalUSBScannerProps> = ({
  students,
  attendance,
  profile,
  onAttendanceSuccess,
  onNotification,
}) => {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Keep fresh references for events
  const studentsRef = useRef(students);
  studentsRef.current = students;
  const attendanceRef = useRef(attendance);
  attendanceRef.current = attendance;
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter key marks end of barcode / QR scanner stream
      if (e.key === 'Enter') {
        const scannedCode = bufferRef.current.trim();
        bufferRef.current = '';

        if (scannedCode.length >= 3) {
          // If typed inside an input box but at superhuman scanner speed (< 45ms per key), prevent standard form submit
          if (isInput && timeDiff < 60) {
            e.preventDefault();
          }
          processScanCode(scannedCode);
        }
        return;
      }

      // Reset buffer if delay between keystrokes is too long and user was typing in an input
      if (isInput && timeDiff > 100) {
        bufferRef.current = '';
        return;
      }

      // Buffer printable characters
      if (e.key.length === 1) {
        // Reset buffer if idle for more than 400ms without input focus
        if (!isInput && timeDiff > 400) {
          bufferRef.current = '';
        }
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const processScanCode = (code: string) => {
    const cleanCode = code.trim();
    const studentList = studentsRef.current;
    const currentAttendance = attendanceRef.current;
    const currentProfile = profileRef.current;

    // Search student by NIS or qrData
    const found = studentList.find(
      (s) => s.nis === cleanCode || s.qrData === cleanCode || s.id === cleanCode
    );

    if (!found) {
      playErrorSound();
      console.warn('Scan: Siswa dengan kode tersebut tidak ditemukan:', cleanCode);
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(
      today.getMinutes()
    ).padStart(2, '0')}:${String(today.getSeconds()).padStart(2, '0')}`;

    // Check if student already scanned today
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

    // Calculate on time vs late based on profile.entryTime
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
      method: 'USB_SCANNER',
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
  };

  return null; // Global invisible listener
};
