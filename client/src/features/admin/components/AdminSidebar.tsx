import { NavLink } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import { useUIStore } from '../../../shared/store/uiStore';
import { cn } from '../../../shared/lib/utils';

const AdminSidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: CheckSquare, label: 'Kehadiran', path: '/admin/activities' },
    { icon: Users, label: 'Master Guru', path: '/admin/guru' },
    { icon: GraduationCap, label: 'Master Kelas', path: '/admin/kelas' },
    { icon: BookOpen, label: 'Master Pelajaran', path: '/admin/pelajaran' },
    { icon: Calendar, label: 'Atur Jadwal', path: '/admin/schedule' },
  ];

  return (
    <div 
      className={cn(
        "bg-[#f1f5f9] min-h-screen text-slate-600 flex flex-col border-r border-slate-200 relative z-30 transition-all duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.02)]",
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
                Admin
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Active</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Mini */}
        <div className={cn(
          "bg-white border border-slate-200/60 shadow-sm rounded-2xl flex items-center transition-all duration-300 overflow-hidden",
          isSidebarCollapsed ? "p-2 justify-center" : "p-4 gap-3 mb-4"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-700 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
            {user?.name?.charAt(0)}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0 transition-all duration-300 opacity-100">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate uppercase tracking-tighter">Administrator</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto custom-scrollbar">
        {!isSidebarCollapsed && (
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 mt-2 transition-opacity duration-300 opacity-100">
            Main Menu
          </p>
        )}
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            title={isSidebarCollapsed ? item.label : ""}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-2xl transition-all duration-300 group border",
                isSidebarCollapsed ? "justify-center p-3.5" : "gap-3 px-4 py-3.5",
                isActive
                  ? "bg-white text-primary border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                  : "text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-slate-900"
              )
            }
          >
            <item.icon size={20} className={cn("transition-transform group-hover:scale-110 shrink-0")} />
            {!isSidebarCollapsed && (
              <span className="font-bold text-sm transition-all duration-300 opacity-100 whitespace-nowrap">
                {item.label}
              </span>
            )}
            
            {/* Active Indicator Dot */}
            {!isSidebarCollapsed && (
              <div className="ml-auto">
                <NavLink to={item.path} end>
                  {({ isActive }) => (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full bg-primary transition-all duration-300",
                      isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    )}></div>
                  )}
                </NavLink>
              </div>
            )}
          </NavLink>
        ))}
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
    </div>

  );
};

export default AdminSidebar;

