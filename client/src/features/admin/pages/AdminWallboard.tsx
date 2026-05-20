import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Tv, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Clock, 
  Info,
  Loader2
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useDailyMatrixData } from '../hooks/useAdminData';

const AdminWallboard = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [countdown, setCountdown] = useState(30);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Matrix data
  const { data, isLoading, isFetching, refetch } = useDailyMatrixData(selectedDate);

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

    return currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes;
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
                      <tr className="sticky top-0 z-20 bg-slate-50 shadow-sm">
                        <th className="sticky left-0 z-30 bg-slate-50 p-4 text-xs font-black uppercase text-slate-500 tracking-wider border-b border-slate-200 w-64">
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
                          <tr key={row.teacherId} className="hover:bg-slate-50/50 transition-colors">
                            {/* Sticky Guru Name column */}
                            <td className="sticky left-0 z-10 bg-white p-4 font-black text-sm text-slate-700 border-r border-slate-200 w-64 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm text-xs shrink-0 select-none">
                                  {row.teacherName.charAt(0)}
                                </div>
                                <span className="truncate" title={row.teacherName}>{row.teacherName}</span>
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
                                    <div 
                                      className={`p-3 rounded-2xl text-left transition-all ${getStatusStyle(slotData.status)}`}
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
                                      {slotData.checkInTime && (
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
    </div>
  );
};

export default AdminWallboard;
