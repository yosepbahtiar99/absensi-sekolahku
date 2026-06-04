import React from 'react';
import SlideOver from '../../../shared/components/SlideOver';
import { User, Camera, ShieldCheck, CheckCircle2, Mail, Image as ImageIcon } from 'lucide-react';

interface ProfileDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    username: string;
    role: string;
    photoId?: string | null;
    email?: string | null;
    isPhotoRequired?: boolean;
  } | null;
  onOpenPhotoUpload?: () => void;
}

const ProfileDetailPanel: React.FC<ProfileDetailPanelProps> = ({ isOpen, onClose, user, onOpenPhotoUpload }) => {
  if (!user) return null;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Detail Profil">
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="relative mb-4">
            {user.photoId ? (
              <img 
                src={`${import.meta.env.VITE_UPLOAD_URL}/profiles/${user.photoId}`} 
                alt={user.name} 
                className="w-24 h-24 rounded-[2rem] object-cover shadow-sm border-2 border-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.name}&background=random`;
                }}
              />
            ) : (
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary font-black text-3xl shadow-sm border-2 border-white">
                {user.name.charAt(0)}
              </div>
            )}
            <button 
              onClick={onOpenPhotoUpload}
              className="absolute bottom-[-8px] right-[-8px] w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm hover:text-primary hover:border-primary transition-colors z-20"
            >
              <Camera size={14} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
          <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <CheckCircle2 size={12} />
            Aktif
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Informasi Akun</p>
            <div className="bg-white border border-slate-100 rounded-2xl p-1">
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Username</p>
                  <p className="text-sm font-semibold text-slate-800">{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border-t border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Role / Akses</p>
                  <p className="text-sm font-semibold text-slate-800 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border-t border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Email</p>
                  <p className="text-sm font-semibold text-slate-800">{user.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border-t border-slate-50">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">Wajib Foto Absen</p>
                  <p className="text-sm font-semibold text-slate-800">{user.isPhotoRequired ? 'Ya' : 'Tidak'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </SlideOver>
  );
};

export default ProfileDetailPanel;
