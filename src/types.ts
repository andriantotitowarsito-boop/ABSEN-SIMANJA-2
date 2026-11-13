export interface Student {
  id: string;
  nis: string;
  name: string;
  className: string;
  gender?: 'L' | 'P';
  phone?: string;
  qrData: string; // The content encoded in QR code (usually NIS or JSON)
}

export type AttendanceStatus = 'TEPAT_WAKTU' | 'TERLAMBAT';

export interface AttendanceRecord {
  id: string;
  studentNis: string;
  studentName: string;
  className: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  status: AttendanceStatus;
  lateMinutes: number;
  timestamp: number;
  method?: 'USB_SCANNER' | 'KAMERA' | 'MANUAL';
}

export interface SchoolProfile {
  name: string;
  npsn: string;
  status: string;
  headmaster: string;
  semester: 'Ganjil' | 'Genap';
  schoolYear: string;
  entryTime: string; // "07:00"
  toleranceMinutes: number; // e.g. 0
  address: string;
  district: string;
  regency: string;
  province: string;
  logoUrl: string;
  bgUrl: string;
}

export interface HolidayRange {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  description: string;
}

export interface ScanResultNotification {
  student: Student;
  record: AttendanceRecord;
  isDuplicate?: boolean;
}
