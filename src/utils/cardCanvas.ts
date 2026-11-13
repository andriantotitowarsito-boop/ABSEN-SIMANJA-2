import { Student, SchoolProfile } from '../types';

/**
 * Renders an ultra-high resolution student attendance ID card to an HTML5 Canvas
 * and triggers a pristine PNG download.
 */
export async function downloadStudentCardPng(
  student: Student,
  profile: SchoolProfile,
  qrDataUrl: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  const scale = 2; // High-DPI 2x scale for sharp printing
  const width = 640 * scale;
  const height = 390 * scale;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background card base
  ctx.fillStyle = '#ffffff';
  ctx.roundRect(0, 0, width, height, 24 * scale);
  ctx.fill();

  // Outer border
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#cbd5e1';
  ctx.roundRect(0, 0, width, height, 24 * scale);
  ctx.stroke();

  // Top header color band
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#1d4ed8');
  gradient.addColorStop(0.5, '#0284c7');
  gradient.addColorStop(1, '#4338ca');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 14 * scale);

  // Header separator
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(24 * scale, 88 * scale);
  ctx.lineTo(width - 24 * scale, 88 * scale);
  ctx.stroke();

  // School Emblem / Logo box
  const logoBoxX = 28 * scale;
  const logoBoxY = 24 * scale;
  const logoBoxSize = 52 * scale;

  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.5 * scale;
  ctx.roundRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 12 * scale);
  ctx.fill();
  ctx.stroke();

  if (profile.logoUrl) {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject();
        logoImg.src = profile.logoUrl;
      });
      ctx.drawImage(logoImg, logoBoxX + 6 * scale, logoBoxY + 6 * scale, logoBoxSize - 12 * scale, logoBoxSize - 12 * scale);
    } catch {
      drawDefaultLogo(ctx, logoBoxX, logoBoxY, logoBoxSize, scale);
    }
  } else {
    drawDefaultLogo(ctx, logoBoxX, logoBoxY, logoBoxSize, scale);
  }

  // Header Texts
  ctx.fillStyle = '#64748b';
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.fillText('DINAS PENDIDIKAN JAWA BARAT', 90 * scale, 38 * scale);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = `bold ${18 * scale}px sans-serif`;
  ctx.fillText(profile.name.toUpperCase(), 90 * scale, 58 * scale);

  ctx.fillStyle = '#64748b';
  ctx.font = `500 ${10.5 * scale}px sans-serif`;
  ctx.fillText(`NPSN: ${profile.npsn} • ${profile.regency}`, 90 * scale, 74 * scale);

  // Title Pill: KARTU ABSENSI DIGITAL SISWA
  const pillY = 98 * scale;
  ctx.fillStyle = '#dbeafe';
  ctx.roundRect(width / 2 - 130 * scale, pillY, 260 * scale, 24 * scale, 12 * scale);
  ctx.fill();

  ctx.fillStyle = '#1e40af';
  ctx.font = `bold ${11 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('KARTU ABSENSI DIGITAL SISWA', width / 2, pillY + 16 * scale);
  ctx.textAlign = 'left';

  // Left Content: Student Information
  const infoX = 32 * scale;
  let infoY = 148 * scale;

  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.fillText('NAMA LENGKAP SISWA', infoX, infoY);

  infoY += 22 * scale;
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${18 * scale}px sans-serif`;
  ctx.fillText(student.name, infoX, infoY);

  infoY += 32 * scale;
  // NIS & Kelas side-by-side
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.fillText('NOMOR INDUK (NIS)', infoX, infoY);
  ctx.fillText('KELAS', infoX + 160 * scale, infoY);

  infoY += 20 * scale;
  ctx.fillStyle = '#1d4ed8';
  ctx.font = `bold ${16 * scale}px monospace`;
  ctx.fillText(student.nis, infoX, infoY);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${16 * scale}px sans-serif`;
  ctx.fillText(student.className, infoX + 160 * scale, infoY);

  infoY += 28 * scale;
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold ${10 * scale}px sans-serif`;
  ctx.fillText('TAHUN PELAJARAN', infoX, infoY);

  infoY += 18 * scale;
  ctx.fillStyle = '#334155';
  ctx.font = `600 ${12 * scale}px sans-serif`;
  ctx.fillText(`${profile.schoolYear} (${profile.semester})`, infoX, infoY);

  // Right Side: QR Code Image
  const qrSize = 140 * scale;
  const qrX = width - qrSize - 32 * scale;
  const qrY = 132 * scale;

  // QR white box
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2 * scale;
  ctx.roundRect(qrX, qrY, qrSize, qrSize, 14 * scale);
  ctx.fill();
  ctx.stroke();

  if (qrDataUrl) {
    try {
      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => reject();
        qrImg.src = qrDataUrl;
      });
      ctx.drawImage(qrImg, qrX + 8 * scale, qrY + 8 * scale, qrSize - 16 * scale, qrSize - 16 * scale);
    } catch (e) {
      console.warn('Could not draw QR on canvas', e);
    }
  }

  // Barcode / NIS label under QR
  ctx.fillStyle = '#475569';
  ctx.font = `bold ${11 * scale}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(student.nis, qrX + qrSize / 2, qrY + qrSize + 18 * scale);
  ctx.textAlign = 'left';

  // Bottom Footer: Note and Headmaster Signature
  const footerY = height - 42 * scale;
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.moveTo(24 * scale, footerY);
  ctx.lineTo(width - 24 * scale, footerY);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = `italic ${9.5 * scale}px sans-serif`;
  ctx.fillText('Wajib dibawa & discan setiap hari saat jam masuk sekolah.', 28 * scale, footerY + 22 * scale);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#1e293b';
  ctx.font = `600 ${10 * scale}px sans-serif`;
  ctx.fillText(`Kepala Sekolah: ${profile.headmaster}`, width - 28 * scale, footerY + 22 * scale);

  // Trigger download
  const a = document.createElement('a');
  a.download = `Kartu_Absensi_${student.className}_${student.nis}_${student.name.replace(/\s+/g, '_')}.png`;
  a.href = canvas.toDataURL('image/png', 1.0);
  a.click();
}

function drawDefaultLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, scale: number) {
  ctx.fillStyle = '#1d4ed8';
  ctx.font = `bold ${14 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('SMAN 1', x + size / 2, y + size / 2 - 2 * scale);
  ctx.fillStyle = '#0284c7';
  ctx.font = `bold ${9 * scale}px sans-serif`;
  ctx.fillText('MJL', x + size / 2, y + size / 2 + 12 * scale);
  ctx.textAlign = 'left';
}
