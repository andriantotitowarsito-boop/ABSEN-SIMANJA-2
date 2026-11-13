import { SchoolProfile, Student, AttendanceRecord, HolidayRange } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'sman1_majalaya_profile',
  STUDENTS: 'sman1_majalaya_students',
  ATTENDANCE: 'sman1_majalaya_attendance',
  HOLIDAYS: 'sman1_majalaya_holidays',
};

// Default SMAN 1 Majalaya Karawang Profile
export const DEFAULT_PROFILE: SchoolProfile = {
  name: 'SMA Negeri 1 Majalaya',
  npsn: '20217822',
  status: 'Negeri (Terakreditasi A)',
  headmaster: 'Drs. H. Dedi Kusnadi, M.Pd.',
  semester: 'Ganjil',
  schoolYear: '2024/2025',
  entryTime: '07:00',
  toleranceMinutes: 0,
  address: 'Jl. Pasirjengkol No. 1, Desa Pasirjengkol, Kec. Majalaya',
  district: 'Majalaya',
  regency: 'Kabupaten Karawang',
  province: 'Jawa Barat',
  logoUrl: '', // Will fallback to vector badge if empty
  bgUrl: '',
};

// Default Holidays sample
export const DEFAULT_HOLIDAYS: HolidayRange[] = [
  {
    id: 'hol-1',
    startDate: '2024-12-23',
    endDate: '2024-12-31',
    description: 'Libur Akhir Semester Ganjil',
  },
  {
    id: 'hol-2',
    startDate: '2024-08-17',
    endDate: '2024-08-17',
    description: 'HUT Kemerdekaan RI ke-79',
  },
];

// Sample realistic initial students for SMAN 1 Majalaya
export const DEFAULT_STUDENTS: Student[] = [
  // Kelas X-A
  { id: 'std-1', nis: '24251001', name: 'Ahmad Fauzi Rahman', className: 'X-A', gender: 'L', qrData: '24251001' },
  { id: 'std-2', nis: '24251002', name: 'Aisyah Putri Permata', className: 'X-A', gender: 'P', qrData: '24251002' },
  { id: 'std-3', nis: '24251003', name: 'Bagas Aditya Pratama', className: 'X-A', gender: 'L', qrData: '24251003' },
  { id: 'std-4', nis: '24251004', name: 'Cantika Dewi Lestari', className: 'X-A', gender: 'P', qrData: '24251004' },
  { id: 'std-5', nis: '24251005', name: 'Daffa Rizky Ramadhan', className: 'X-A', gender: 'L', qrData: '24251005' },

  // Kelas X-B
  { id: 'std-6', nis: '24251006', name: 'Fajar Nugraha Saputra', className: 'X-B', gender: 'L', qrData: '24251006' },
  { id: 'std-7', nis: '24251007', name: 'Gita Nurul Hidayah', className: 'X-B', gender: 'P', qrData: '24251007' },
  { id: 'std-8', nis: '24251008', name: 'Hafiz Danendra Arkan', className: 'X-B', gender: 'L', qrData: '24251008' },
  { id: 'std-9', nis: '24251009', name: 'Indah Cahyaningrum', className: 'X-B', gender: 'P', qrData: '24251009' },
  { id: 'std-10', nis: '24251010', name: 'Jovan Arya Maulana', className: 'X-B', gender: 'L', qrData: '24251010' },

  // Kelas XI-MIPA 1
  { id: 'std-11', nis: '23241011', name: 'Kevin Christian Wijaya', className: 'XI-MIPA 1', gender: 'L', qrData: '23241011' },
  { id: 'std-12', nis: '23241012', name: 'Laila Zahra Nurhaliza', className: 'XI-MIPA 1', gender: 'P', qrData: '23241012' },
  { id: 'std-13', nis: '23241013', name: 'Muhammad Alif Firmansyah', className: 'XI-MIPA 1', gender: 'L', qrData: '23241013' },
  { id: 'std-14', nis: '23241014', name: 'Nabila Syakira Anandita', className: 'XI-MIPA 1', gender: 'P', qrData: '23241014' },
  { id: 'std-15', nis: '23241015', name: 'Octa Vian Pratama', className: 'XI-MIPA 1', gender: 'L', qrData: '23241015' },

  // Kelas XI-IPS 1
  { id: 'std-16', nis: '23241016', name: 'Putri Rahmadani', className: 'XI-IPS 1', gender: 'P', qrData: '23241016' },
  { id: 'std-17', nis: '23241017', name: 'Rangga Bayu Samudra', className: 'XI-IPS 1', gender: 'L', qrData: '23241017' },
  { id: 'std-18', nis: '23241018', name: 'Siti Sarah Amelia', className: 'XI-IPS 1', gender: 'P', qrData: '23241018' },
  { id: 'std-19', nis: '23241019', name: 'Teguh Prasetyo Nugroho', className: 'XI-IPS 1', gender: 'L', qrData: '23241019' },
  { id: 'std-20', nis: '23241020', name: 'Ulfa Khoirunnisa', className: 'XI-IPS 1', gender: 'P', qrData: '23241020' },

  // Kelas XII-MIPA 1
  { id: 'std-21', nis: '22231021', name: 'Vino Bastian Putra', className: 'XII-MIPA 1', gender: 'L', qrData: '22231021' },
  { id: 'std-22', nis: '22231022', name: 'Wulan Ayu Wardani', className: 'XII-MIPA 1', gender: 'P', qrData: '22231022' },
  { id: 'std-23', nis: '22231023', name: 'Yoga Pratama Yudha', className: 'XII-MIPA 1', gender: 'L', qrData: '22231023' },
  { id: 'std-24', nis: '22231024', name: 'Zahra Maulida Azzahra', className: 'XII-MIPA 1', gender: 'P', qrData: '22231024' },

  // Kelas XII-IPS 1
  { id: 'std-25', nis: '22231025', name: 'Aditya Dimas Maulana', className: 'XII-IPS 1', gender: 'L', qrData: '22231025' },
  { id: 'std-26', nis: '22231026', name: 'Bunga Citra Handayani', className: 'XII-IPS 1', gender: 'P', qrData: '22231026' },
  { id: 'std-27', nis: '22231027', name: 'Candra Kirana Sukma', className: 'XII-IPS 1', gender: 'L', qrData: '22231027' },
  { id: 'std-28', nis: '22231028', name: 'Desi Ratnasari Putri', className: 'XII-IPS 1', gender: 'P', qrData: '22231028' },
];

/**
 * Generate initial realistic attendance records for today and recent weekdays
 */
export function generateInitialAttendance(students: Student[], entryTimeStr: string): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const [entryHour, entryMin] = entryTimeStr.split(':').map(Number);

  // Helper to format YYYY-MM-DD
  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate for past 10 days (including today)
  for (let offset = 9; offset >= 0; offset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    
    // Skip Saturday (6) and Sunday (0)
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = formatDateStr(d);
    const isToday = offset === 0;

    // For today, have ~85% of students already attended
    // For past days, have ~90-95% attended
    const attendanceRatio = isToday ? 0.8 : 0.92;

    students.forEach((std, idx) => {
      // Deterministic randomness based on student index and date
      const hash = (idx * 37 + offset * 13) % 100;
      if (hash < attendanceRatio * 100) {
        // Did attend
        const isLate = (hash % 5 === 0); // ~20% late
        let hour = entryHour;
        let minute = 0;
        let lateMinutes = 0;

        if (isLate) {
          // Arrived between entryTime + 3 min and entryTime + 35 min
          minute = entryMin + 3 + (hash % 30);
          if (minute >= 60) {
            hour += 1;
            minute -= 60;
          }
          lateMinutes = (hour * 60 + minute) - (entryHour * 60 + entryMin);
        } else {
          // Arrived before entryTime, e.g. 06:30 to 06:58
          hour = entryHour - 1;
          minute = 30 + ((hash * 7) % 28);
          lateMinutes = 0;
        }

        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(10 + (hash % 45)).padStart(2, '0')}`;
        
        // Base timestamp
        const recordDate = new Date(d);
        recordDate.setHours(hour, minute, 10 + (hash % 45), 0);

        records.push({
          id: `att-${dateStr}-${std.nis}`,
          studentNis: std.nis,
          studentName: std.name,
          className: std.className,
          date: dateStr,
          time: timeStr,
          status: isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU',
          lateMinutes: isLate ? lateMinutes : 0,
          timestamp: recordDate.getTime(),
          method: 'USB_SCANNER',
        });
      }
    });
  }

  // Sort descending by timestamp so latest attendance is on top!
  return records.sort((a, b) => b.timestamp - a.timestamp);
}

// Storage loaders and savers
export function loadProfile(): SchoolProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading profile from localStorage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: SchoolProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading students', e);
  }
  return DEFAULT_STUDENTS;
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students', e);
  }
}

export function loadAttendance(students: Student[], entryTime: string): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading attendance', e);
  }
  const initial = generateInitialAttendance(students, entryTime);
  saveAttendance(initial);
  return initial;
}

export function saveAttendance(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving attendance', e);
  }
}

export function loadHolidays(): HolidayRange[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading holidays', e);
  }
  return DEFAULT_HOLIDAYS;
}

export function saveHolidays(holidays: HolidayRange[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  } catch (e) {
    console.error('Error saving holidays', e);
  }
}

/**
 * Check if a date string (YYYY-MM-DD) is marked as holiday:
 * 1. Saturday (6) or Sunday (0)
 * 2. Matches any configured holiday range
 */
export function isDateHoliday(dateStr: string, holidays: HolidayRange[]): { isHoliday: boolean; reason?: string } {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = d.getDay();

  if (day === 0) return { isHoliday: true, reason: 'Hari Minggu (Libur)' };
  if (day === 6) return { isHoliday: true, reason: 'Hari Sabtu (Libur 5 Hari Sekolah)' };

  for (const h of holidays) {
    if (dateStr >= h.startDate && dateStr <= h.endDate) {
      return { isHoliday: true, reason: h.description };
    }
  }

  return { isHoliday: false };
}
