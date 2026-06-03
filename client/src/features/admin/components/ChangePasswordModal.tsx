import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { KeyRound, EyeOff, Eye, Loader2, X } from 'lucide-react';
import { authService } from '../../auth/services/auth.service';
import { useAuthStore } from '../../../shared/store/authStore';
import { useNotificationStore } from '../../../shared/store/notificationStore';
import { cn } from '../../../shared/lib/utils';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const validationSchema = Yup.object({
  oldPassword: Yup.string().required('Password lama wajib diisi'),
  newPassword: Yup.string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password baru wajib diisi'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const logout = useAuthStore((state) => state.logout);
  const showNotification = useNotificationStore((state) => state.showNotification);

  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setErrorMsg('');
      try {
        await authService.changePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        });
        
        showNotification('Password berhasil diubah. Silahkan login kembali.', 'success');
        resetForm();
        onClose();
        logout();
      } catch (error: any) {
        setErrorMsg(error.response?.data?.message || 'Gagal mengubah password');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary shrink-0">
              <KeyRound size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">Ganti Password</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Keamanan & Password Akun</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
          <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl flex items-start gap-3 mb-6">
            <KeyRound size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium leading-relaxed">
              Demi keamanan akun Anda, disarankan untuk mengganti password secara berkala.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Old Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Password Lama
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  name="oldPassword"
                  placeholder="Masukkan password lama"
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-colors",
                    formik.touched.oldPassword && formik.errors.oldPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-primary"
                  )}
                  value={formik.values.oldPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.oldPassword && formik.errors.oldPassword && (
                <p className="text-red-500 text-xs font-medium mt-1">{formik.errors.oldPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Buat password baru"
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-colors",
                    formik.touched.newPassword && formik.errors.newPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-primary"
                  )}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-red-500 text-xs font-medium mt-1">{formik.errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Ulangi password baru"
                  className={cn(
                    "w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-colors",
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-primary"
                  )}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs font-medium mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 mt-4 flex justify-center items-center gap-2"
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                'Simpan Password Baru'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;
