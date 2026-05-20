import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  CheckSquare, 
  LogOut, 
  School, 
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  Database,
  ChevronDown,
  Layers,
  Download,
  Upload,
  Terminal,
  X,
  AlertTriangle,
  RefreshCw,
  FileText,
  Tv,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { useUIStore } from '../../../shared/store/uiStore';
import { cn } from '../../../shared/lib/utils';
import api from '../../../shared/lib/axios';

const AdminSidebar = () => {
  const { logout } = useLogout();
  const user = useAuthStore((state) => state.user);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger modal on Ctrl + Shift + D
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDevModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await api.get('/admin/developer/export-snapshot');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("download", `snapshot_sekolahku_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert('Gagal mengekspor snapshot: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      try {
        setImportError(null);
        setImportSuccess(null);
        setIsImporting(true);
        const parsedData = JSON.parse(event.target?.result as string);
        
        await api.post('/admin/developer/import-snapshot', parsedData);
        setImportSuccess('Snapshot berhasil di-import! Halaman akan dimuat ulang...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (err: any) {
        console.error(err);
        setImportError('Gagal mengimpor snapshot: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    fileReader.readAsText(file);
  };

  const masterSubMenus = [
    { icon: CalendarDays, label: 'Master Tahun Ajaran', path: '/admin/academic-years' },
    { icon: Users, label: 'Master Guru', path: '/admin/guru' },
    { icon: GraduationCap, label: 'Master Kelas', path: '/admin/kelas' },
    { icon: BookOpen, label: 'Master Pelajaran', path: '/admin/pelajaran' },
    { icon: Clock, label: 'Master Jam', path: '/admin/time-slots' },
    { icon: BookOpen, label: 'Master Kurikulum', path: '/admin/curriculum' },
    { icon: Layers, label: 'Master Tingkat', path: '/admin/grade-levels' },
  ];

  const isMasterActive = masterSubMenus.some(item => location.pathname === item.path);

  const reportsSubMenus = [
    { icon: FileText, label: 'Kehadiran Harian', path: '/admin/reports/daily' },
    { icon: Download, label: 'Jadwal Per Guru', path: '/admin/reports/teacher' },
  ];
  const isReportsActive = location.pathname.startsWith('/admin/reports');

  // Auto expand submenus if active
  useEffect(() => {
    if (isMasterActive) setIsMasterOpen(true);
    if (isReportsActive) setIsReportsOpen(true);
  }, [isMasterActive, isReportsActive]);

  return (
    <div 
      className={cn(
        "bg-[#f1f5f9] h-screen text-slate-600 flex flex-col border-r border-slate-200 relative z-30 transition-all duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.02)]",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Sidebar Header */}
      <div className={cn("p-6 transition-all duration-300", isSidebarCollapsed ? "px-4" : "p-8")}>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20 shrink-0">
            <School size={24} className="text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="transition-all duration-300 opacity-100 translate-x-0">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Admin Sekolah
              </h1>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-10">
        {!isSidebarCollapsed && (
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 mt-2 transition-opacity duration-300 opacity-100">
            Main Menu
          </p>
        )}
        
        <MenuNavLink to="/admin" icon={LayoutDashboard} label="Dashboard" isCollapsed={isSidebarCollapsed} />
        <MenuNavLink to="/admin/wallboard" icon={Tv} label="Wallboard Guru" isCollapsed={isSidebarCollapsed} />
        <MenuNavLink to="/admin/activities" icon={CheckSquare} label="Riwayat Kehadiran" isCollapsed={isSidebarCollapsed} />
        <MenuNavLink to="/admin/approvals" icon={CheckSquare} label="Approval Guru" isCollapsed={isSidebarCollapsed} />

        {/* Master Data Collapsible Menu */}
        <div>
          <button
            onClick={() => !isSidebarCollapsed && setIsMasterOpen(!isMasterOpen)}
            className={cn(
              "flex items-center w-full rounded-2xl transition-all duration-300 group border mb-1",
              isSidebarCollapsed ? "justify-center p-3.5" : "gap-3 px-4 py-3.5",
              isMasterActive
                ? "bg-white text-primary border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                : "text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-slate-900"
            )}
          >
            <Database size={20} className={cn("transition-transform group-hover:scale-110 shrink-0", isMasterActive ? "text-primary" : "text-slate-400")} />
            {!isSidebarCollapsed && (
              <>
                <span className="font-bold text-sm flex-1 text-left whitespace-nowrap">Master Data</span>
                <ChevronDown size={16} className={cn("transition-transform duration-300", isMasterOpen ? "rotate-180" : "")} />
              </>
            )}
          </button>

          {!isSidebarCollapsed && isMasterOpen && (
            <div className="ml-4 pl-4 border-l-2 border-slate-200 space-y-1 animate-in slide-in-from-top-2 duration-300">
              {masterSubMenus.map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group border",
                      isActive
                        ? "bg-white text-primary border-slate-200 shadow-sm font-bold"
                        : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-white/50"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <sub.icon size={20} className={cn("shrink-0", isActive ? "text-primary" : "text-slate-400")} />
                      <span className="text-sm font-bold whitespace-nowrap">{sub.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <MenuNavLink to="/admin/schedule" icon={Calendar} label="Atur Jadwal" isCollapsed={isSidebarCollapsed} />
        
        {/* Reports Collapsible Menu */}
        <div>
          <button
            onClick={() => !isSidebarCollapsed && setIsReportsOpen(!isReportsOpen)}
            className={cn(
              "flex items-center w-full rounded-2xl transition-all duration-300 group border mb-1",
              isSidebarCollapsed ? "justify-center p-3.5" : "gap-3 px-4 py-3.5",
              isReportsActive
                ? "bg-white text-primary border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                : "text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-slate-900"
            )}
          >
            <FileText size={20} className={cn("transition-transform group-hover:scale-110 shrink-0", isReportsActive ? "text-primary" : "text-slate-400")} />
            {!isSidebarCollapsed && (
              <>
                <span className="font-bold text-sm flex-1 text-left whitespace-nowrap">Laporan Sekolah</span>
                <ChevronDown size={16} className={cn("transition-transform duration-300", isReportsOpen ? "rotate-180" : "")} />
              </>
            )}
          </button>

          {!isSidebarCollapsed && isReportsOpen && (
            <div className="ml-4 pl-4 border-l-2 border-slate-200 space-y-1 animate-in slide-in-from-top-2 duration-300">
              {reportsSubMenus.map((sub) => (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group border",
                      isActive
                        ? "bg-white text-primary border-slate-200 shadow-sm font-bold"
                        : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-white/50"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <sub.icon size={20} className={cn("shrink-0", isActive ? "text-primary" : "text-slate-400")} />
                      <span className="text-sm font-bold whitespace-nowrap">{sub.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        <MenuNavLink to="/admin/settings" icon={Settings} label="Pengaturan" isCollapsed={isSidebarCollapsed} />
      </nav>

      {/* Toggle Button */}
      <div className="px-4 mb-2">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-primary transition-all group border border-slate-200/60 shadow-sm active:scale-95"
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Collapse</span>
            </div>
          )}
        </button>
      </div>

      <div className="p-4 border-t border-slate-200/60">
        <button
          onClick={logout}
          className={cn(
            "flex items-center rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm group overflow-hidden",
            isSidebarCollapsed ? "justify-center p-3.5" : "gap-3 px-4 py-4 w-full"
          )}
          title={isSidebarCollapsed ? "Logout" : ""}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
          {!isSidebarCollapsed && <span className="transition-all duration-300 opacity-100">Logout Sistem</span>}
        </button>
      </div>

      {/* Secret Developer Snapshot Modal */}
      {isDevModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 w-full max-w-md flex flex-col gap-6 relative overflow-hidden animate-in zoom-in-95 duration-200 text-slate-600">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-cyan-500"></div>
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsDevModalOpen(false);
                setImportError(null);
                setImportSuccess(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all active:scale-95"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex gap-4 items-start">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
                <Terminal size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Developer Sandbox</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">Shortcut: <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 text-slate-500">Ctrl + Shift + D</kbd></p>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="p-4 bg-amber-50/60 border border-amber-200/50 rounded-2xl flex gap-3 text-amber-800 text-xs font-bold leading-relaxed">
              <AlertTriangle size={18} className="shrink-0 text-amber-500" />
              <span>
                Mengekspor atau mengimpor data akan mereplikasi kondisi database 100%. Harap berhati-hati, proses Import akan <strong className="text-amber-900">MENGHAPUS SEMUA DATA LOKAL</strong> sebelum diganti dengan isi snapshot!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting || isImporting}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-cyan-700 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isExporting ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                {isExporting ? 'Mengekspor...' : 'Export Database State (JSON)'}
              </button>

              {/* Import Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExporting || isImporting}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50 text-slate-600 hover:text-primary font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isImporting ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {isImporting ? 'Mengimpor...' : 'Restore / Import State (JSON)'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
            </div>

            {/* Error & Success Messages */}
            {importError && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200/50">
                {importError}
              </div>
            )}
            {importSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200/50 flex gap-2 items-center">
                <RefreshCw size={14} className="animate-spin text-emerald-500 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for NavLinks
const MenuNavLink = ({ to, icon: Icon, label, isCollapsed }: { to: string, icon: any, label: string, isCollapsed: boolean }) => (
  <NavLink
    to={to}
    end
    title={isCollapsed ? label : ""}
    className={({ isActive }) =>
      cn(
        "flex items-center rounded-2xl transition-all duration-300 group border",
        isCollapsed ? "justify-center p-3.5" : "gap-3 px-4 py-3.5",
        isActive
          ? "bg-white text-primary border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
          : "text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-slate-900"
      )
    }
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110 shrink-0")} />
    {!isCollapsed && (
      <span className="font-bold text-sm transition-all duration-300 opacity-100 whitespace-nowrap flex-1">
        {label}
      </span>
    )}
    {!isCollapsed && (
      <NavLink to={to} end>
        {({ isActive }) => (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full bg-primary transition-all duration-300",
            isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
          )}></div>
        )}
      </NavLink>
    )}
  </NavLink>
);

export default AdminSidebar;

