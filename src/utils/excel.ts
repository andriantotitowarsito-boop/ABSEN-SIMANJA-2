import * as XLSX from 'xlsx';
import { Student, AttendanceRecord, HolidayRange } from '../types';
import { isDateHoliday } from './storage';

/**
 * Generates and triggers download of the student Excel template
 */
export function downloadStudentTemplate() {
  const templateData = [
    {
      'NIS': '24251030',
      'Nama Siswa': 'Fahmi Hidayat',
      'Kelas': 'X-A',
      'Jenis Kelamin': 'L',
    },
    {
      'NIS': '24251031',
      'Nama Siswa': 'Gina Rahmawati',
      'Kelas': 'X-A',
      'Jenis Kelamin': 'P',
    },
    {
      'NIS': '23241032',
      'Nama Siswa': 'Iqbal Ramadhani',
      'Kelas': 'XI-MIPA 1',
      'Jenis Kelamin': 'L',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  // Auto-width columns
  ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  XLSX.writeFile(wb, 'Template_Upload_Siswa_SMAN1Majalaya.xlsx');
}

/**
 * Parses uploaded Excel / CSV file into Student objects
 */
export async function parseStudentExcel(file: File): Promise<{ success: boolean; data?: Student[]; error?: string }> {
  try {
    const dataBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(dataBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    if (!rawRows || rawRows.length === 0) {
      return { success: false, error: 'File Excel kosong atau format tidak sesuai.' };
    }

    const students: Student[] = [];
    const seenNis = new Set<string>();

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];

      // Flexible column key matching
      const nis = String(
        row['NIS'] || row['nis'] || row['Nomor Induk'] || row['Nis'] || ''
      ).trim();

      const name = String(
        row['Nama Siswa'] || row['nama siswa'] || row['Nama'] || row['nama'] || ''
      ).trim();

      const className = String(
        row['Kelas'] || row['kelas'] || row['Rombel'] || ''
      ).trim();

      const genderRaw = String(
        row['Jenis Kelamin'] || row['JK'] || row['gender'] || ''
      ).trim().toUpperCase();

      const gender: 'L' | 'P' = genderRaw.startsWith('L') ? 'L' : genderRaw.startsWith('P') ? 'P' : 'L';

      if (!nis || !name) {
        continue; // skip blank rows
      }

      if (seenNis.has(nis)) {
        continue; // skip duplicates in same file
      }
      seenNis.add(nis);

      students.push({
        id: `std-import-${Date.now()}-${i}-${nis}`,
        nis,
        name,
        className: className || 'X-A',
        gender,
        qrData: nis, // Auto-create QR data with their NIS
      });
    }

    if (students.length === 0) {
      return { success: false, error: 'Tidak ada data siswa valid yang ditemukan di file Excel.' };
    }

    return { success: true, data: students };
  } catch (err) {
    console.error('Error parsing excel:', err);
    return { success: false, error: 'Gagal membaca file Excel. Pastikan format file berupa .xlsx atau .xls valid.' };
  }
}

/**
 * Export Live Report to Excel (.xlsx)
 */
export function exportLiveReportExcel(records: AttendanceRecord[], selectedDate: string, schoolName: string) {
  const exportData = records.map((r, idx) => ({
    'No': idx + 1,
    'NIS': r.studentNis,
    'Nama Siswa': r.studentName,
    'Kelas': r.className,
    'Tanggal Absensi': r.date,
    'Waktu Absensi': `${r.time} WIB`,
    'Keterangan': r.status === 'TEPAT_WAKTU' ? 'Hadir Tepat Waktu' : `Terlambat Hadir (${r.lateMinutes} menit)`,
    'Metode Scan': r.method || 'USB Scanner',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 28 },
    { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Live Report Absensi');
  XLSX.writeFile(wb, `Laporan_Absensi_Harian_${schoolName.replace(/\s+/g, '_')}_${selectedDate}.xlsx`);
}

/**
 * Export Rekap Kehadiran Spreadsheet to Excel (.xlsx)
 */
export function exportRekapSpreadsheetExcel(
  students: Student[],
  attendance: AttendanceRecord[],
  year: number,
  month: number, // 1 - 12
  holidays: HolidayRange[],
  schoolName: string
) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayNamesShort = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

  // Map of student attendance: key `${nis}_${dateStr}` -> record
  const attMap = new Map<string, AttendanceRecord>();
  attendance.forEach((r) => {
    attMap.set(`${r.studentNis}_${r.date}`, r);
  });

  const exportRows = students.map((std, idx) => {
    const row: Record<string, unknown> = {
      'No': idx + 1,
      'NIS': std.nis,
      'Nama Siswa': std.name,
      'Kelas': std.className,
    };

    let totalH = 0;
    let totalDT = 0;
    let totalTA = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(year, month - 1, day);
      const dayName = dayNamesShort[d.getDay()];
      const colKey = `${day} (${dayName})`;

      const { isHoliday } = isDateHoliday(dateStr, holidays);
      const rec = attMap.get(`${std.nis}_${dateStr}`);

      if (isHoliday) {
        row[colKey] = 'LIBUR';
      } else if (rec) {
        if (rec.status === 'TEPAT_WAKTU') {
          row[colKey] = 'H';
          totalH++;
        } else {
          row[colKey] = 'DT';
          totalDT++;
        }
      } else {
        // Only mark TA if date is in past or today
        const targetDate = new Date(year, month - 1, day, 23, 59, 59);
        if (targetDate.getTime() <= Date.now()) {
          row[colKey] = 'TA';
          totalTA++;
        } else {
          row[colKey] = '-';
        }
      }
    }

    row['Total Tepat Waktu (H)'] = totalH;
    row['Total Terlambat (DT)'] = totalDT;
    row['Total Tidak Absen (TA)'] = totalTA;

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Rekap ${month}-${year}`);
  XLSX.writeFile(wb, `Rekap_Kehadiran_Bulanan_${schoolName.replace(/\s+/g, '_')}_${year}_${month}.xlsx`);
}

/**
 * Export Discipline Report to Excel (.xlsx)
 */
export function exportDisciplineExcel(
  disciplineData: Array<{
    nis: string;
    name: string;
    className: string;
    lateCount: number;
    totalLateMinutes: number;
    disciplineStatus: string;
  }>,
  monthName: string,
  year: number,
  schoolName: string
) {
  const exportRows = disciplineData.map((d, idx) => ({
    'No': idx + 1,
    'NIS': d.nis,
    'Nama Siswa': d.name,
    'Kelas': d.className,
    'Total Terlambat (Kali)': d.lateCount,
    'Total Menit Terlambat': d.totalLateMinutes,
    'Status Kedisiplinan': d.disciplineStatus,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Kedisiplinan');
  XLSX.writeFile(wb, `Laporan_Kedisiplinan_${schoolName.replace(/\s+/g, '_')}_${monthName}_${year}.xlsx`);
}
