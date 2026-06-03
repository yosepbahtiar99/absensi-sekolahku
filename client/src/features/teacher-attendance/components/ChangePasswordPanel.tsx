import React, { useState } from 'react';
import SlideOver from '../../../shared/components/SlideOver';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { KeyRound, EyeOff, Eye, Loader2 } from 'lucide-react';
import { authService } from '../../auth/services/auth.service';
import { useAuthStore } from '../../../shared/store/authStore';
import { useNotificationStore } from '../../../shared/store/notificationStore';

interface ChangePasswordPanelProps {
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

const ChangePasswordPanel: React.FC<ChangePasswordPanelProps> = ({ isOpen, onClose }) => {
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
        
        // Force logout after success
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

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Keamanan & Password">
      <div className="space-y-6">
        <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl flex items-start gap-3">
          <KeyRound size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium leading-relaxed">
            Demi keamanan akun Anda, disarankan untuk mengganti password secara berkala.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold">
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
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-colors ${
                  formik.touched.oldPassword && formik.errors.oldPassword
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-slate-200 focus:border-primary'
                }`}
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
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-colors ${
                  formik.touched.newPassword && formik.errors.newPassword
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-slate-200 focus:border-primary'
                }`}
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
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:bg-white transition-colors ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-slate-200 focus:border-primary'
                }`}
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
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] mt-4 flex justify-center items-center gap-2"
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
    </SlideOver>
  );
};

export default ChangePasswordPanel;
