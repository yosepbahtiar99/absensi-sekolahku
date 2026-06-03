import { User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../../shared/store/authStore';
import { useLogout } from '../../auth/hooks/useLogout';
import { useState } from 'react';
import ProfileDetailPanel from '../components/ProfileDetailPanel';
import ChangePasswordPanel from '../components/ChangePasswordPanel';
import PhotoUploadPanel from '../components/PhotoUploadPanel';
import { Camera } from 'lucide-react';

const GuruProfile = () => {
  const { user } = useAuthStore();
  const { logout } = useLogout();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user?.photoId ? (
              <img 
                src={`${import.meta.env.VITE_UPLOAD_URL}/profiles/${user.photoId}`} 
                alt={user?.name} 
                className="w-24 h-24 rounded-[2rem] object-cover shadow-sm border-2 border-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user?.name}&background=random`;
                }}
              />
            ) : (
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary font-black text-3xl">
                {user?.name?.charAt(0)}
              </div>
            )}
            <button 
              onClick={() => setIsPhotoUploadOpen(true)}
              className="absolute bottom-[-8px] right-[-8px] w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm hover:text-primary hover:border-primary transition-colors z-20"
            >
              <Camera size={14} />
            </button>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name}</h3>
          <p className="text-slate-400 font-bold text-xs tracking-widest mt-1">Username: {user?.username}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group rounded-[1.5rem]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <User size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700">Detail Profil</p>
              <p className="text-[10px] text-slate-400 font-medium">Lihat info lengkap anda</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
        <button 
          onClick={() => setIsPasswordOpen(true)}
          className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group rounded-[1.5rem] mt-1"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700">Keamanan</p>
              <p className="text-[10px] text-slate-400 font-medium">Ganti password & akses</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      </div>

      <button
        onClick={logout}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 p-6 rounded-[2.5rem] flex items-center justify-between transition-all group active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
            <LogOut size={24} />
          </div>
          <div className="text-left">
            <p className="text-base font-black tracking-tight">Keluar Aplikasi</p>
            <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest">Logout Sekarang</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-red-300" />
      </button>

      {/* Slide-over Panels */}
      <ProfileDetailPanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user}
        onOpenPhotoUpload={() => setIsPhotoUploadOpen(true)}
      />
      <ChangePasswordPanel 
        isOpen={isPasswordOpen} 
        onClose={() => setIsPasswordOpen(false)} 
      />
      <PhotoUploadPanel
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
      />
    </div>
  );
};

export default GuruProfile;
