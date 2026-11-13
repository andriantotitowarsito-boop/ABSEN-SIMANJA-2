import { useState, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  SchoolProfile,
  HolidayRange,
  ScanResultNotification,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadStudents,
  saveStudents,
  loadAttendance,
  saveAttendance,
  loadHolidays,
  saveHolidays,
  DEFAULT_PROFILE,
  DEFAULT_STUDENTS,
  generateInitialAttendance,
} from './utils/storage';
import { LingoraLayout, ActiveTab } from './components/LingoraLayout';
import { GlobalUSBScanner } from './components/GlobalUSBScanner';
import { ScanNotificationModal } from './components/ScanNotificationModal';
import { DashboardPage } from './pages/DashboardPage';
import { StudentDatabasePage } from './pages/StudentDatabasePage';
import { LiveReportPage } from './pages/LiveReportPage';
import { RekapSpreadsheetPage } from './pages/RekapSpreadsheetPage';
import { DisciplinePage } from './pages/DisciplinePage';
import { SettingsPage } from './pages/SettingsPage';
import { ScannerPage } from './pages/ScannerPage';
import { LoginPage } from './pages/LoginPage';

const AUTH_STORAGE_KEY = 'si_absensi_auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [profile, setProfile] = useState<SchoolProfile>(() => loadProfile());
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [holidays, setHolidays] = useState<HolidayRange[]>(() => loadHolidays());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    loadAttendance(loadStudents(), loadProfile().entryTime)
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [scanNotification, setScanNotification] = useState<ScanResultNotification | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  useEffect(() => {
    saveAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveHolidays(holidays);
  }, [holidays]);

  // Handle Attendance Success from Scanner (USB or Camera)
  const handleAttendanceSuccess = (
    newRecord: AttendanceRecord,
    _student: Student,
    isDuplicate: boolean
  ) => {
    if (!isDuplicate) {
      setAttendance((prev) => [newRecord, ...prev]);
    }
  };

  // Student DB Actions
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id || s.nis === id);
    const updated = students.filter((s) => s.id !== id && s.nis !== id);
    setStudents(updated);
    saveStudents(updated);
    if (target) {
      setAttendance((attPrev) => {
        const attUpdated = attPrev.filter((r) => r.studentNis !== target.nis);
        saveAttendance(attUpdated);
        return attUpdated;
      });
    }
  };

  const handleDeleteSelectedStudents = (ids: string[]) => {
    const idSet = new Set(ids);
    const deletedNisSet = new Set(
      students.filter((s) => idSet.has(s.id) || idSet.has(s.nis)).map((s) => s.nis)
    );
    const updated = students.filter((s) => !idSet.has(s.id) && !idSet.has(s.nis));
    setStudents(updated);
    saveStudents(updated);

    if (deletedNisSet.size > 0) {
      setAttendance((attPrev) => {
        const attUpdated = attPrev.filter((r) => !deletedNisSet.has(r.studentNis));
        saveAttendance(attUpdated);
        return attUpdated;
      });
    }
  };

  const handleDeleteAllStudents = () => {
    setStudents([]);
    saveStudents([]);
    setAttendance([]);
    saveAttendance([]);
  };

  const handleBulkAddStudents = (newStudents: Student[]) => {
    setStudents((prev) => {
      const existingNis = new Set(prev.map((s) => s.nis));
      const filtered = newStudents.filter((s) => !existingNis.has(s.nis));
      const updated = [...filtered, ...prev];
      saveStudents(updated);
      return updated;
    });
  };

  // Auth Handlers
  const handleLoginSuccess = (_username: string) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    setScanNotification(null);
    setIsAuthenticated(false);
  };

  // Reset to initial demo data
  const handleResetData = () => {
    const savedTheme = localStorage.getItem('si_absensi_theme');
    localStorage.clear();
    if (savedTheme) {
      localStorage.setItem('si_absensi_theme', savedTheme);
    }
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');

    const freshProfile = DEFAULT_PROFILE;
    const freshStudents = DEFAULT_STUDENTS;
    const freshHolidays = loadHolidays();
    const freshAttendance = generateInitialAttendance(freshStudents, freshProfile.entryTime);

    setProfile(freshProfile);
    setStudents(freshStudents);
    setHolidays(freshHolidays);
    setAttendance(freshAttendance);

    saveProfile(freshProfile);
    saveStudents(freshStudents);
    saveHolidays(freshHolidays);
    saveAttendance(freshAttendance);
  };

  const handleImportFullBackup = (data: any) => {
    if (data.profile) {
      setProfile(data.profile);
      saveProfile(data.profile);
    }
    if (data.holidays && Array.isArray(data.holidays)) {
      setHolidays(data.holidays);
      saveHolidays(data.holidays);
    }
    if (data.attendance && Array.isArray(data.attendance)) {
      setAttendance(data.attendance);
      saveAttendance(data.attendance);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage profile={profile} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      className="min-h-screen bg-[#f1f5f9] dark:bg-[#090d16] text-slate-800 dark:text-slate-100"
      style={
        profile.bgUrl
          ? {
              backgroundImage: `url(${profile.bgUrl})`,
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Global USB Barcode & QR Scanner Listener (Works on all pages without switching) */}
      <GlobalUSBScanner
        students={students}
        attendance={attendance}
        profile={profile}
        onAttendanceSuccess={handleAttendanceSuccess}
        onNotification={setScanNotification}
      />

      {/* Modern 3-Column Lingora-style Layout */}
      <LingoraLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        students={students}
        attendance={attendance}
        onLogout={handleLogout}
      >
        {activeTab === 'dashboard' && (
          <DashboardPage
            profile={profile}
            students={students}
            attendance={attendance}
            onUpdateProfile={setProfile}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'database' && (
          <StudentDatabasePage
            students={students}
            profile={profile}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onDeleteSelectedStudents={handleDeleteSelectedStudents}
            onDeleteAllStudents={handleDeleteAllStudents}
            onBulkAddStudents={handleBulkAddStudents}
          />
        )}

        {activeTab === 'live-report' && (
          <LiveReportPage
            attendance={attendance}
            students={students}
            profile={profile}
          />
        )}

        {activeTab === 'rekap' && (
          <RekapSpreadsheetPage
            students={students}
            attendance={attendance}
            holidays={holidays}
            profile={profile}
          />
        )}

        {activeTab === 'kedisiplinan' && (
          <DisciplinePage
            students={students}
            attendance={attendance}
            profile={profile}
          />
        )}

        {activeTab === 'pengaturan' && (
          <SettingsPage
            profile={profile}
            holidays={holidays}
            attendance={attendance}
            onUpdateProfile={setProfile}
            onUpdateHolidays={setHolidays}
            onResetData={handleResetData}
            onImportFullBackup={handleImportFullBackup}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerPage
            students={students}
            attendance={attendance}
            profile={profile}
            onAttendanceSuccess={handleAttendanceSuccess}
            onNotification={setScanNotification}
          />
        )}
      </LingoraLayout>

      {/* Scan Result Feedback Modal (Animated on-time / late notification + audio + confetti) */}
      <ScanNotificationModal
        notification={scanNotification}
        onClose={() => setScanNotification(null)}
      />
    </div>
  );
}
