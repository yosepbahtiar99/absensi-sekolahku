import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Calendar, CheckSquare, LogOut, School, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';

const AdminSidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: CheckSquare, label: 'Kehadiran', path: '/admin/activities' },
    { icon: Users, label: 'Master Guru', path: '/admin/guru' },
    { icon: GraduationCap, label: 'Master Kelas', path: '/admin/kelas' },
    { icon: BookOpen, label: 'Master Pelajaran', path: '/admin/pelajaran' },
    { icon: Calendar, label: 'Atur Jadwal', path: '/admin/schedule' },
  ];

  return (
    <div className="w-72 bg-[#0A0F11] min-h-screen text-slate-400 flex flex-col border-r border-white/5 relative z-30">
      {/* Sidebar Header */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
            <School size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">
              Absensi<span className="text-primary">Admin</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={12} className="text-accent" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized</span>
            </div>
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-700 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-[10px] font-medium text-slate-500 truncate">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 mt-2">Main Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(8,145,178,0.05)]' 
                  : 'hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-bold text-sm">{item.label}</span>
            {/* Active Indicator Dot */}
            <div className="ml-auto">
               <div className={`w-1.5 h-1.5 rounded-full bg-primary transition-opacity duration-300`}></div>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-4 w-full rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout Sistem</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
