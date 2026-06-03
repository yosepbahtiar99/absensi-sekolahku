import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { User, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/lib/utils';
import api from '../../../shared/lib/axios';

const forgotPasswordSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username wajib diisi'),
});

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FA] relative overflow-hidden px-4">
      {/* Background Orbs */}
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
                  <h2 className="text-2xl font-bold text-slate-800">Cek Email Anda</h2>
                  <p className="text-slate-500 text-sm mt-2">
                    Kami telah mengirimkan tautan untuk mengatur ulang password ke email yang terdaftar dengan username tersebut.
                  </p>
                </div>
                <Link to="/login" className="block w-full">
                  <Button variant="outline" className="w-full">Kembali ke Login</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <Link to="/login" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Kembali
                  </Link>
                  <h2 className="text-2xl font-bold text-slate-800">Lupa Password?</h2>
                  <p className="text-slate-500 text-sm mt-1">Masukkan username Anda untuk menerima tautan reset password di email.</p>
                </div>

                {errorMsg && (
                  <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-center gap-3 animate-shake">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></div>
                    <span className="leading-snug">{errorMsg}</span>
                  </div>
                )}

                <Formik
                  initialValues={{ username: '' }}
                  validationSchema={forgotPasswordSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setErrorMsg('');
                    try {
                      await api.post('/auth/forgot-password', { username: values.username });
                      setIsSuccess(true);
                    } catch (error: any) {
                      setErrorMsg(error.response?.data?.message || 'Gagal mengirim email reset password. Pastikan username valid.');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ errors, touched, handleChange, handleBlur, values, isSubmitting }) => (
                    <Form className="space-y-6">
                      <div className="group">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                        <Input
                          name="username"
                          type="text"
                          placeholder="Masukkan username Anda"
                          icon={<User size={18} />}
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={cn(
                            "border border-slate-300 bg-white/50 focus:bg-white transition-all",
                            errors.username && touched.username ? "border-red-500 ring-4 ring-red-500/10" : "focus:border-primary/40 focus:border-primary"
                          )}
                        />
                        {errors.username && touched.username && (
                          <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.username}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={20} className="animate-spin mr-2" />
                            <span>Mengirim...</span>
                          </>
                        ) : (
                          <span>Kirim Tautan Reset</span>
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

export default ForgotPasswordPage;
