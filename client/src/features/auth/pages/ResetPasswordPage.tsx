import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/lib/utils';
import api from '../../../shared/lib/axios';

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password baru wajib diisi'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Protect the route if no token is found
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FA] relative overflow-hidden px-4">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-accent/10 rounded-full blur-[80px]"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="animate-in zoom-in duration-700">
          <Card
            className="p-10 bg-white relative rounded-[2.5rem] shadow-2xl shadow-primary/5 transition-all duration-500"
            style={{
              border: '2px solid transparent',
              background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--accent))) border-box',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box'
            }}
          >
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Password Diperbarui</h2>
                  <p className="text-slate-500 text-sm mt-2">
                    Password Anda telah berhasil diubah. Silakan login menggunakan password baru Anda.
                  </p>
                </div>
                <Link to="/login" className="block w-full">
                  <Button className="w-full">Pergi ke Login</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Buat Password Baru</h2>
                  <p className="text-slate-500 text-sm mt-1">Silakan masukkan password baru untuk akun Anda.</p>
                </div>

                {errorMsg && (
                  <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-start gap-3 animate-shake">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span className="leading-snug">{errorMsg}</span>
                  </div>
                )}

                <Formik
                  initialValues={{ newPassword: '', confirmPassword: '' }}
                  validationSchema={resetPasswordSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setErrorMsg('');
                    try {
                      await api.post('/auth/reset-password', {
                        token,
                        newPassword: values.newPassword
                      });
                      setIsSuccess(true);
                    } catch (error: any) {
                      setErrorMsg(error.response?.data?.message || 'Gagal mereset password. Link mungkin sudah kedaluwarsa.');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ errors, touched, handleChange, handleBlur, values, isSubmitting }) => (
                    <Form className="space-y-5">
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password Baru</label>
                        <div className="relative">
                          <Input
                            name="newPassword"
                            type={showNew ? 'text' : 'password'}
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                            value={values.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cn(
                              "border border-slate-300 bg-white/50 focus:bg-white transition-all pr-12",
                              errors.newPassword && touched.newPassword ? "border-red-500 ring-4 ring-red-500/10" : "focus:border-primary/40 focus:border-primary"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                          >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.newPassword && touched.newPassword && (
                          <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.newPassword}</p>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Konfirmasi Password</label>
                        <div className="relative">
                          <Input
                            name="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={cn(
                              "border border-slate-300 bg-white/50 focus:bg-white transition-all pr-12",
                              errors.confirmPassword && touched.confirmPassword ? "border-red-500 ring-4 ring-red-500/10" : "focus:border-primary/40 focus:border-primary"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                          >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.confirmPassword && touched.confirmPassword && (
                          <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={20} className="animate-spin mr-2" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <span>Simpan Password Baru</span>
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
