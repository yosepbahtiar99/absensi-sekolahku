import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Tv, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Clock, 
  Info,
  Loader2,
  FileSpreadsheet,
  UserCheck,
  Pencil
} from 'lucide-react';
import api from '../../../shared/lib/axios';
import AdminSidebar from '../components/AdminSidebar';
import { useDailyMatrixData, useManualActivity, useManualCorporateClockIn, useManualCorporateClockOut, useSystemSettings } from '../hooks/useAdminData';
import { useNotificationStore } from '../../../shared/store/notificationStore';
import { AlertTriangle, X, MapPin } from 'lucide-react';

const AdminWallboard = () => {
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [countdown, setCountdown] = useState(30);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { showNotification } = useNotificationStore();
  const manualActivityMutation = useManualActivity();
  const manualCorporateMutation = useManualCorporateClockIn();
  const manualCorporateOutMutation = useManualCorporateClockOut();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [manualForm, setManualForm] = useState({ status: 'masuk', description: '' });

  // Time Prompt Modal State
  const [isTimePromptOpen, setIsTimePromptOpen] = useState(false);
  const [timePromptData, setTimePromptData] = useState<{ type: 'hadir' | 'pulang', teacherId: string, teacherName: string, time: string } | null>(null);

  // Fetch Matrix data
  const { data, isLoading, isFetching, refetch } = useDailyMatrixData(selectedDate);
  const { data: settings } = useSystemSettings();

  const attendanceFlow = settings?.attendance_flow || 'strict';
  const isCorporateFlow = attendanceFlow === 'full_day';

  const handleManualHadir = (teacherId: string, teacherName: string) => {
    setTimePromptData({ type: 'hadir', teacherId, teacherName, time: '07:00' });
    setIsTimePromptOpen(true);
  };

  const handleManualPulang = (teacherId: string, teacherName: string) => {
    setTimePromptData({ type: 'pulang', teacherId, teacherName, time: '12:00' });
    setIsTimePromptOpen(true);
  };

  const submitTimePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timePromptData) return;

    if (timePromptData.type === 'hadir') {
      manualCorporateMutation.mutate(
        { teacherId: timePromptData.teacherId, dateStr: selectedDate, checkInTimeStr: timePromptData.time },
        {
          onSuccess: () => {
            showNotification('Berhasil melakukan absen manual', 'success');
            setIsTimePromptOpen(false);
          },
          onError: (error: any) => {
            const msg = error?.response?.data?.message || 'Gagal melakukan absen manual';
            showNotification(msg, 'error');
          }
        }
      );
    } else {
      manualCorporateOutMutation.mutate(
        { teacherId: timePromptData.teacherId, dateStr: selectedDate, checkOutTimeStr: timePromptData.time },
        {
          onSuccess: () => {
            showNotification('Berhasil melakukan set pulang manual', 'success');
            setIsTimePromptOpen(false);
          },
          onError: (error: any) => {
            const msg = error?.response?.data?.message || 'Gagal melakukan set pulang manual';
            showNotification(msg, 'error');
          }
        }
      );
    }
  };

  // --- 1. Helper Functions ---
  const isSlotActive = (startTime: string, endTime: string) => {
    const currentHours = time.getHours();
    const currentMinutes = time.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const parseTimeToMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      return hours * 60 + minutes;
    };

    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    return currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'hadir':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm shadow-emerald-500/5';
      case 'telat':
        return 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm shadow-amber-500/5';
      case 'izin':
        return 'bg-blue-50 text-blue-800 border border-blue-200 shadow-sm shadow-blue-500/5';
      case 'alpa':
        return 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm shadow-rose-500/5';
      case 'belum_absen':
        return 'bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-sm shadow-cyan-500/5 animate-pulse';
      case 'belum_mulai':
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hadir': return 'HADIR';
      case 'telat': return 'TELAT';
      case 'izin': return 'IZIN';
      case 'alpa': return 'ALPA';
      case 'belum_absen': return 'ABSEN...';
      case 'belum_mulai': return 'NANTI';
      default: return '-';
    }
  };

  // --- 2. Memos / Computed Values ---
  // Calculate statistics from matrix data
  const stats = useMemo(() => {
    let totalScheduled = 0;
    let hadir = 0;
    let telat = 0;
    let izin = 0;
    let alpa = 0;
    let belumAbsen = 0;
    let belumMulai = 0;

    if (data?.matrix) {
      data.matrix.forEach(row => {
        Object.values(row.slots).forEach(slot => {
          if (slot) {
            totalScheduled++;
            if (slot.status === 'hadir') hadir++;
            else if (slot.status === 'telat') telat++;
            else if (slot.status === 'izin') izin++;
            else if (slot.status === 'alpa') alpa++;
            else if (slot.status === 'belum_absen') belumAbsen++;
            else if (slot.status === 'belum_mulai') belumMulai++;
          }
        });
      });
    }

    return { totalScheduled, hadir, telat, izin, alpa, belumAbsen, belumMulai };
  }, [data]);

  // Smart Priority Sorting for teachers list
  const sortedMatrix = useMemo(() => {
    if (!data?.matrix) return [];

    return [...data.matrix].sort((a, b) => {
      const getScore = (row: typeof a) => {
        if (activeSlotId) {
          const activeSlotData = row.slots[activeSlotId];
          if (activeSlotData) {
            switch (activeSlotData.status) {
              case 'belum_absen': return 100; // Priority 1: Has active schedule but not yet checked in (Red Alert)
              case 'telat': return 90;       // Priority 2: Late (Amber Alert)
              case 'hadir': return 80;       // Priority 3: Checked in on-time (Green Success)
              case 'izin': return 70;        // Priority 4: Absent with permission (Blue Info)
              case 'alpa': return 60;        // Priority 5: Unexcused absence (Rose Alert)
              case 'belum_mulai': return 50; // Priority 6: Scheduled for later today
            }
          }
        }
        
        // If not in active slot, check if they teach at all today
        const hasAnyClassToday = Object.values(row.slots).some(slot => slot !== null);
        return hasAnyClassToday ? 30 : 10;
      };

      const scoreA = getScore(a);
      const scoreB = getScore(b);

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Descending order (highest priority first)
      }

      // Fallback to alphabetical sorting
      return a.teacherName.localeCompare(b.teacherName, 'id');
    });
  }, [data?.matrix, activeSlotId]);

  // --- 3. React Effects ---
  // Live digital clock ticking
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Smart polling countdown timer
  useEffect(() => {
    setCountdown(30); // reset countdown on date change
  }, [selectedDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refetch();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refetch]);

  // Hook to update activeSlotId when data or time changes
  useEffect(() => {
    if (!data?.timeSlots) return;

    const activeSlot = data.timeSlots.find(slot => isSlotActive(slot.startTime, slot.endTime));
    const newActiveId = activeSlot ? activeSlot.id : null;

    if (newActiveId !== activeSlotId) {
      setActiveSlotId(newActiveId);
    }
  }, [data, time, activeSlotId]);

  // Hook to trigger scroll ONLY when activeSlotId actually changes (preventing clock tick cancels)
  useEffect(() => {
    if (!activeSlotId) return;

    const timeout = setTimeout(() => {
      const container = scrollContainerRef.current;
      const element = document.getElementById(`slot-header-${activeSlotId}`);
      if (container && element) {
        const stickyWidth = 256; // Width of the sticky "GURU PENGAJAR" column (w-64 = 256px)
        const visibleWidth = container.clientWidth - stickyWidth;
        // Center the active column within the remaining visible scrolling space
        const targetScrollLeft = (element.offsetLeft - stickyWidth) - (visibleWidth / 2) + (element.clientWidth / 2);
        
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          top: container.scrollTop,
          behavior: 'smooth'
        });
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [activeSlotId]);

  // Hook to auto scroll table vertically (looping pages) every 12 seconds, pausing on hover
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !data?.matrix || data.matrix.length === 0 || isHovered) return;

    const scrollInterval = setInterval(() => {
      const { scrollTop, clientHeight, scrollHeight } = container;

      // Only scroll vertically if content exceeds container height
      if (scrollHeight <= clientHeight) return;

      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

      if (isAtBottom) {
        // Return to top, preserving horizontal scroll position
        container.scrollTo({
          top: 0,
          left: container.scrollLeft,
          behavior: 'smooth'
        });
      } else {
        // Scroll down by one visible page minus a small offset for continuity
        container.scrollTo({
          top: scrollTop + (clientHeight - 120),
          left: container.scrollLeft,
          behavior: 'smooth'
        });
      }
    }, 12000);

    return () => clearInterval(scrollInterval);
  }, [data, sortedMatrix, isHovered]);

  // Fullscreen toggle using Browser Fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error('Gagal masuk fullscreen:', err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error('Gagal keluar fullscreen:', err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle cell click
  const handleCellClick = (teacher: any, slotInfo: any, slotData: any) => {
    setSelectedSlot({
      scheduleId: slotData.scheduleId,
      teacherId: teacher.teacherId,
      teacherName: teacher.teacherName,
      className: slotData.className,
      lessonName: slotData.lessonName,
      timeLabel: `${slotInfo.label} (${slotInfo.startTime.substring(0,5)} - ${slotInfo.endTime.substring(0,5)})`,
      currentStatus: slotData.status,
      description: slotData.description,
      corporateCheckOutLat: slotData.corporateCheckOutLat,
      corporateCheckOutLong: slotData.corporateCheckOutLong
    });
    
    // Map existing status to form status (or default to masuk)
    let formStatus = 'masuk';
    if (slotData.status === 'telat') formStatus = 'telat';
    if (slotData.status === 'izin') formStatus = 'tidak_hadir';
    if (slotData.status === 'alpa') formStatus = 'alpa';
    
    setManualForm({ status: formStatus, description: '' });
    setIsModalOpen(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    manualActivityMutation.mutate({
      scheduleId: selectedSlot.scheduleId,
      teacherId: selectedSlot.teacherId,
      status: manualForm.status as any,
      description: manualForm.description,
      date: selectedDate
    }, {
      onSuccess: () => {
        showNotification('Berhasil memperbarui status absensi', 'success');
        setIsModalOpen(false);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || 'Gagal memperbarui absensi';
        showNotification(msg, 'error');
      }
    });
  };

  const handleDownloadDailyExcel = async () => {
    try {
      showNotification('Menyiapkan file Excel, matriks sedang diunduh...', 'info');
      const response = await api.get(`/admin/reports/daily/excel?date=${selectedDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rekap_absensi_${selectedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showNotification('Laporan Matriks berhasil diunduh', 'success');
    } catch (err) {
      console.error('Gagal mengunduh Excel:', err);
      showNotification('Gagal mengunduh laporan Matriks', 'error');
    }
  };

  // Format digital clock
  const timeFormatted = time.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  }) + ' WIB';

  // Format date indonesian
  const dateFormatted = time.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-800">
      {/* Sidebar - hidden when fullscreen */}
      {!isFullscreen && <AdminSidebar />}

      <main 
        ref={containerRef} 
        className={`flex-1 overflow-hidden flex flex-col bg-[#F8FAFC] ${isFullscreen ? 'p-8' : 'p-6'}`}
      >
        {/* Wallboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5 mb-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-600/10 text-cyan-600 rounded-2xl border border-cyan-600/20 shadow-[0_0_15px_rgba(8,145,178,0.1)]">
              <Tv size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Wallboard Kehadiran Guru</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">
                {data?.academicYearName ? `Tahun Ajaran: ${data.academicYearName}` : 'SMP TUNAS BARU CIPARAY'}
              </p>
            </div>
          </div>

          {/* Clock & Controls */}
          <div className="flex items-center flex-wrap gap-4 ml-auto">
            {/* Live Clock Widget */}
            <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-cyan-600 tracking-wider leading-none uppercase">{dateFormatted}</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <span className="text-lg font-black text-slate-800 font-mono tracking-wider tabular-nums">
                  {timeFormatted}
                </span>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 text-sm px-4 py-2.5 rounded-2xl focus:outline-none focus:border-cyan-600 transition-colors shadow-sm"
              />
            </div>

            {/* Manual Refresh / Countdown Widget */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  refetch();
                  setCountdown(30);
                }}
                disabled={isLoading || isFetching}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-2xl transition-all active:scale-95 shrink-0 flex items-center gap-2 shadow-sm"
                title="Refresh Matrix"
              >
                <RefreshCw size={16} className={`${isFetching || isLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs font-bold font-mono text-cyan-600 tracking-tighter shrink-0">{countdown}s</span>
              </button>

              {/* Download Matrix Button */}
              <button
                onClick={handleDownloadDailyExcel}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/10 transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
                title="Unduh Excel Matriks"
              >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline font-bold text-sm">Unduh Matriks</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-600/10 transition-all active:scale-95 shrink-0 flex items-center justify-center"
                title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen View'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error / Main View */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 size={48} className="text-cyan-600 animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mempersiapkan Wallboard...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden gap-5 animate-in fade-in duration-500">
            {/* Bento Grid Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 shrink-0">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total KBM</span>
                <span className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.totalScheduled}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Hadir Tepat</span>
                <span className="text-2xl font-black text-emerald-800 mt-2 font-mono">{stats.hadir}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Terlambat</span>
                <span className="text-2xl font-black text-amber-800 mt-2 font-mono">{stats.telat}</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Izin / Sakit</span>
                <span className="text-2xl font-black text-blue-800 mt-2 font-mono">{stats.izin}</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Alpa (Kosong)</span>
                <span className="text-2xl font-black text-rose-800 mt-2 font-mono">{stats.alpa}</span>
              </div>
              <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm animate-pulse">
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-wider">Berlangsung</span>
                <span className="text-2xl font-black text-cyan-800 mt-2 font-mono">{stats.belumAbsen}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Belum Mulai</span>
                <span className="text-2xl font-black text-slate-700 mt-2 font-mono">{stats.belumMulai}</span>
              </div>
            </div>

            {/* Matrix Board */}
            <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-0 relative">
              
              {/* Matrix Scrollable Container */}
              <div 
                ref={scrollContainerRef} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex-1 overflow-auto custom-scrollbar"
              >
                {data?.matrix && data.matrix.length > 0 && data.timeSlots && data.timeSlots.length > 0 ? (
                  <table className="w-full border-collapse text-left table-fixed">
                    <thead>
                      <tr className="sticky top-0 z-40 bg-slate-50 shadow-sm">
                        <th className="sticky left-0 z-50 bg-slate-50 p-4 text-xs font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 w-64">
                          GURU PENGAJAR
                        </th>
                        {data.timeSlots.map((slot) => {
                          const isActive = isSlotActive(slot.startTime, slot.endTime);
                          return (
                            <th 
                              key={slot.id} 
                              id={`slot-header-${slot.id}`}
                              className={`p-2.5 text-center text-xs font-black uppercase tracking-wider border-b w-48 transition-all ${
                                isActive 
                                  ? 'bg-emerald-50/70 border-x-2 border-x-emerald-500/80 border-b-emerald-500/80 text-emerald-800' 
                                  : 'bg-slate-50 border-slate-200 border-l border-slate-100 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                {isActive && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                )}
                                <span>{slot.label}</span>
                              </div>
                              <div className={`text-sm font-black tracking-normal mt-1 font-mono ${isActive ? 'text-emerald-600' : 'text-cyan-600'}`}>
                                {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedMatrix.map((row, rowIndex) => {
                        const isLastRow = rowIndex === sortedMatrix.length - 1;
                        return (
                          <tr key={row.teacherId} className="group/row hover:bg-slate-50/50 transition-colors">
                            {/* Sticky Guru Name column */}
                            <td className="sticky left-0 z-20 bg-white p-4 font-black text-sm text-slate-700 border-r border-slate-200 w-64 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm text-xs shrink-0 select-none">
                                    {row.teacherName.charAt(0)}
                                  </div>
                                  <span className="truncate" title={row.teacherName}>{row.teacherName}</span>
                                </div>
                                {isCorporateFlow && (row.firstCheckIn || row.lastCheckOut) && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1 ml-11 text-[10px] font-medium font-mono">
                                    {row.firstCheckIn && (
                                      <button
                                        onClick={() => {
                                          const timeStr = new Date(row.firstCheckIn!).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
                                          setTimePromptData({ type: 'hadir', teacherId: row.teacherId, teacherName: row.teacherName, time: timeStr });
                                          setIsTimePromptOpen(true);
                                        }}
                                        className="group/editbtn flex items-center justify-center min-w-[50px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-300 px-1.5 py-0.5 rounded shadow-sm transition-all focus:outline-none"
                                        title="Edit Jam Masuk"
                                      >
                                        <span className="group-hover/editbtn:hidden flex items-center gap-1">M: {new Date(row.firstCheckIn).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')}</span>
                                        <span className="hidden group-hover/editbtn:flex items-center gap-1"><Pencil size={10} /> Edit</span>
                                      </button>
                                    )}
                                    {row.lastCheckOut ? (
                                      <button
                                        onClick={() => {
                                          const timeStr = new Date(row.lastCheckOut!).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
                                          setTimePromptData({ type: 'pulang', teacherId: row.teacherId, teacherName: row.teacherName, time: timeStr });
                                          setIsTimePromptOpen(true);
                                        }}
                                        className="group/editbtn flex items-center justify-center min-w-[50px] text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-300 px-1.5 py-0.5 rounded shadow-sm transition-all focus:outline-none"
                                        title="Edit Jam Pulang"
                                      >
                                        <span className="group-hover/editbtn:hidden flex items-center gap-1">K: {new Date(row.lastCheckOut).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')}</span>
                                        <span className="hidden group-hover/editbtn:flex items-center gap-1"><Pencil size={10} /> Edit</span>
                                      </button>
                                    ) : row.firstCheckIn && (
                                      <button
                                        onClick={() => handleManualPulang(row.teacherId, row.teacherName)}
                                        disabled={manualCorporateOutMutation.isPending}
                                        className="text-[10px] bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 font-bold px-1.5 py-0.5 rounded shadow-sm transition-all disabled:opacity-50 opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                                      >
                                        {manualCorporateOutMutation.isPending ? '...' : '+ Set Pulang'}
                                      </button>
                                    )}
                                  </div>
                                )}
                                {isCorporateFlow && !row.firstCheckIn && !row.lastCheckOut && (
                                  <div className="mt-1 ml-11">
                                    <button
                                      onClick={() => handleManualHadir(row.teacherId, row.teacherName)}
                                      disabled={manualCorporateMutation.isPending}
                                      className="text-[10px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-500 font-bold py-1 px-2 rounded transition-all disabled:opacity-50 opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                                    >
                                      {manualCorporateMutation.isPending ? 'Proses...' : '+ Set Hadir Manual'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Time Slots columns */}
                            {data.timeSlots.map((slot) => {
                              const slotData = row.slots[slot.id];
                              const isActive = isSlotActive(slot.startTime, slot.endTime);
                              
                              return (
                                <td 
                                  key={slot.id} 
                                  className={`p-3 text-center align-middle min-h-[90px] transition-all ${
                                    isActive 
                                      ? `border-x-2 border-x-emerald-500/40 bg-emerald-50/5 ${isLastRow ? 'border-b-2 border-b-emerald-500/40' : ''}` 
                                      : 'border-l border-slate-100'
                                  }`}
                                >
                                  {slotData ? (
                                    <div className="group relative hover:z-[60]">
                                      <div 
                                        onClick={() => handleCellClick(row, slot, slotData)}
                                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer hover:ring-2 hover:ring-cyan-500/50 hover:shadow-md ${getStatusStyle(slotData.status)} relative z-10`}
                                        title="Klik untuk ubah manual"
                                      >
                                        {/* Class & Status Badge */}
                                        <div className="flex justify-between items-center mb-1.5 gap-2">
                                          <span className="font-black text-sm tracking-tight text-slate-900 leading-none">
                                            {slotData.className}
                                          </span>
                                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-black/5 tracking-widest leading-none font-mono">
                                            {getStatusLabel(slotData.status)}
                                          </span>
                                        </div>
                                        
                                        {/* Lesson Title */}
                                        <div className="text-xs font-semibold truncate text-slate-600 leading-tight">
                                          {slotData.lessonName}
                                        </div>

                                        {/* Time of Attendance if checked in */}
                                        {slotData.checkInTime && !['alpa', 'izin'].includes(slotData.status) && (
                                          <div className="text-[9px] font-bold text-slate-500 mt-2 font-mono flex items-center gap-1">
                                            <Clock size={8} />
                                            <span>
                                              {new Date(slotData.checkInTime).toLocaleString('id-ID', {
                                                timeZone: 'Asia/Jakarta',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false
                                              })} WIB
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Hover Tooltip */}
                                      {slotData.checkInTime && (
                                        <div className={`absolute z-[70] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all left-1/2 -translate-x-1/2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-100 p-2 pointer-events-none scale-95 group-hover:scale-100 ${isLastRow ? 'bottom-[calc(100%+8px)] origin-bottom' : 'top-[calc(100%+8px)] origin-top'}`}>
                                          {slotData.photoSelfie || slotData.photoClass ? (
                                            <div className="flex gap-2 h-24">
                                              {slotData.photoSelfie && <img src={`${import.meta.env.VITE_UPLOAD_URL}/${slotData.photoSelfie}`} className="w-full h-full object-cover rounded-xl shadow-sm" alt="Selfie" />}
                                              {slotData.photoClass && <img src={`${import.meta.env.VITE_UPLOAD_URL}/${slotData.photoClass}`} className="w-full h-full object-cover rounded-xl shadow-sm" alt="Class" />}
                                            </div>
                                          ) : (
                                            <div className="bg-slate-50 text-slate-500 text-xs font-bold p-3 text-center rounded-xl border border-slate-100 flex flex-col items-center gap-1.5">
                                              <UserCheck size={16} className="text-slate-400" />
                                              <span className="leading-tight">
                                                {(() => {
                                                  if (slotData.corporateCheckOutLat && slotData.corporateCheckOutLong) {
                                                    return 'Lokasi Tersimpan (Klik cell untuk Maps)';
                                                  }
                                                  if (slotData.description) {
                                                    return slotData.description;
                                                  }
                                                  return 'Diabsen by Admin';
                                                })()}
                                              </span>
                                            </div>
                                          )}
                                          {/* Caret */}
                                          <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-slate-100 transform rotate-45 ${isLastRow ? '-bottom-1.5 border-b border-r' : '-top-1.5 border-t border-l'}`}></div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 font-bold select-none text-xs">•</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center h-full gap-4">
                    <Info size={36} className="text-slate-400" />
                    <div>
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-sm">Tidak Ada Plotting Jadwal</p>
                      <p className="text-slate-400 text-xs mt-1">Tidak ada jadwal KBM yang terdaftar untuk hari {data?.dayName || 'ini'}.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Manual Attendance */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-lg">Absensi Manual</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-6">
              <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 space-y-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Detail Jadwal</p>
                <p className="font-black text-slate-800">{selectedSlot.teacherName}</p>
                <p className="text-sm text-slate-600">{selectedSlot.lessonName} • {selectedSlot.className}</p>
                <p className="text-sm font-mono text-cyan-600 font-bold">{selectedSlot.timeLabel}</p>
                {(() => {
                  const hasLocation = selectedSlot.corporateCheckOutLat && selectedSlot.corporateCheckOutLong;
                  const hasDescription = !!selectedSlot.description;
                  
                  return (
                    <>
                      {hasLocation && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <MapPin size={12} className="text-cyan-600" />
                            Lokasi Check-Out (Corporate)
                          </p>
                          <a 
                            href={`https://www.google.com/maps?q=${selectedSlot.corporateCheckOutLat},${selectedSlot.corporateCheckOutLong}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                          >
                            Buka di Google Maps
                          </a>
                        </div>
                      )}
                      {hasDescription && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                           <p className="text-xs font-medium text-slate-600">Catatan: {selectedSlot.description}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Ubah Status</label>
                  <select 
                    value={manualForm.status}
                    onChange={(e) => setManualForm({...manualForm, status: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-bold text-slate-700"
                  >
                    <option value="masuk">Hadir (Tepat Waktu)</option>
                    <option value="telat">Terlambat</option>
                    <option value="tidak_hadir">Izin / Sakit</option>
                    <option value="alpa">Alpa / Bolos (Reset)</option>
                  </select>
                </div>

                {manualForm.status === 'alpa' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 text-rose-800 text-sm">
                    <AlertTriangle size={20} className="shrink-0 text-rose-600" />
                    <div>
                      <span className="font-bold block mb-1">Peringatan Keras!</span>
                      Memilih <b>Alpa (Reset)</b> akan menghapus data kehadiran untuk jam ini (jika sudah ada).
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Keterangan (Opsional)</label>
                  <textarea 
                    value={manualForm.description}
                    onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                    placeholder="Alasan perubahan manual..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm min-h-[80px]"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={manualActivityMutation.isPending}
                  className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {manualActivityMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Corporate Time Prompt Modal */}
      {isTimePromptOpen && timePromptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTimePromptOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`p-6 text-white ${timePromptData.type === 'hadir' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock size={20} />
                    {timePromptData.type === 'hadir' ? 'Set Hadir Manual' : 'Set Pulang Manual'}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">Atur waktu absensi untuk <b>{timePromptData.teacherName}</b></p>
                </div>
                <button 
                  onClick={() => setIsTimePromptOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submitTimePrompt} className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Waktu {timePromptData.type === 'hadir' ? 'Masuk' : 'Pulang'} (HH:mm)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Clock size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="time"
                      value={timePromptData.time}
                      onChange={(e) => setTimePromptData({...timePromptData, time: e.target.value})}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-700 font-mono font-bold text-lg"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Sistem akan mencatat absensi ini pada tanggal <b>{selectedDate}</b>.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsTimePromptOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={manualCorporateMutation.isPending || manualCorporateOutMutation.isPending}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 ${timePromptData.type === 'hadir' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'}`}
                >
                  {(manualCorporateMutation.isPending || manualCorporateOutMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                  Simpan Waktu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWallboard;
