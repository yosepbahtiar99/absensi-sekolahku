import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademicYears } from '../../master-data/academic-year/hooks/useAcademicYearData';
import { AlertTriangle, X, ArrowRight, CalendarClock } from 'lucide-react';

const DISMISS_KEY = 'academic_year_reminder_dismissed_date';
const WARNING_DAYS = 7;

const AcademicYearReminderBanner: React.FC = () => {
  const navigate = useNavigate();
  const { data: academicYears = [] } = useAcademicYears();
  const [dismissed, setDismissed] = useState(false);

  // Check if already dismissed today
  useEffect(() => {
    const dismissedDate = localStorage.getItem(DISMISS_KEY);
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dismissedDate === today) {
      setDismissed(true);
    }
  }, []);

  const reminderInfo = useMemo(() => {
    const activeYear = academicYears.find(y => y.isActive);
    if (!activeYear?.endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(activeYear.endDate);
    endDate.setHours(0, 0, 0, 0);

    const diffMs = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Only show if 0 to WARNING_DAYS remaining
    if (diffDays < 0 || diffDays > WARNING_DAYS) return null;

    return {
      yearName: activeYear.name,
      diffDays,
      endDateFormatted: endDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      isUrgent: diffDays <= 2
    };
  }, [academicYears]);

  const handleDismiss = () => {
    const d2 = new Date();
    const today = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;
    localStorage.setItem(DISMISS_KEY, today);
    setDismissed(true);
  };

  if (dismissed || !reminderInfo) return null;

  const { yearName, diffDays, endDateFormatted, isUrgent } = reminderInfo;

  return (
    <div
      className={`
        relative flex items-center gap-4 px-6 py-3.5 text-sm border-b
        transition-all duration-500 animate-in slide-in-from-top-2
        ${isUrgent
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-amber-50 border-amber-200 text-amber-900'
        }
      `}
    >
      {/* Icon */}
      <div className={`shrink-0 p-1.5 rounded-lg ${isUrgent ? 'bg-red-100' : 'bg-amber-100'}`}>
        {isUrgent
          ? <AlertTriangle className="h-4 w-4 text-red-600" />
          : <CalendarClock className="h-4 w-4 text-amber-600" />
        }
      </div>

      {/* Message */}
      <p className="flex-1 font-medium leading-snug">
        <span className="font-black">Perhatian!</span>{' '}
        Periode aktif{' '}
        <span className="font-black">"{yearName}"</span>{' '}
        {diffDays === 0
          ? <span>berakhir <span className="font-black underline">hari ini</span> ({endDateFormatted}).</span>
          : <span>akan berakhir dalam <span className="font-black">{diffDays} hari</span> lagi ({endDateFormatted}).</span>
        }
        {' '}Segera siapkan tahun ajaran baru agar absensi tidak terganggu.
      </p>

      {/* CTA Button */}
      <button
        onClick={() => navigate('/admin/academic-years')}
        className={`
          shrink-0 flex items-center gap-1.5 font-bold text-xs px-3.5 py-2 rounded-lg
          transition-all hover:scale-[1.03] active:scale-95
          ${isUrgent
            ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200'
            : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200'
          }
        `}
      >
        Buat Tahun Ajaran
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        title="Tutup pengingat untuk hari ini"
        className={`
          shrink-0 p-1.5 rounded-lg transition-all hover:scale-105 active:scale-95
          ${isUrgent
            ? 'hover:bg-red-100 text-red-400 hover:text-red-600'
            : 'hover:bg-amber-100 text-amber-400 hover:text-amber-600'
          }
        `}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AcademicYearReminderBanner;
