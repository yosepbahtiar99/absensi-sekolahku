import { Formik, Form } from 'formik';
import { loginSchema } from '../validations/login.schema';
import { useAuthMutation } from '../hooks/useAuthMutation';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { LogIn, User, Lock, Loader2, School } from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

const LoginPage = () => {
  const { mutate, isPending, error } = useAuthMutation();

  const errorMessage = (error as any)?.response?.data?.message || error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F9FA] relative overflow-hidden px-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-accent/10 rounded-full blur-[80px]"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-cyan-900/10 border border-white p-4 mb-2">
            <School size={40} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Absensi<span className="text-primary">{` ${' '}Sekolahku`}</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Digital Attendance Ecosystem</p>
          </div>
        </div>

        {/* Card with Full Gradient Border */}
        <div className="relative group animate-in zoom-in duration-700">
          <div className="absolute -inset-[1.5px] bg-gradient-to-br from-primary to-accent rounded-[2.5rem] opacity-70 group-hover:opacity-100 transition-opacity blur-[0.5px]"></div>
          <Card className="p-10 bg-white/90 backdrop-blur-2xl relative rounded-[2.5rem] border-none shadow-2xl shadow-primary/5">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Selamat Datang</h2>
              <p className="text-slate-500 text-sm">Masuk dengan akun yang sudah terdaftar</p>
            </div>

          {(errorMessage || error) && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
              {errorMessage || 'Terjadi kesalahan sistem.'}
            </div>
          )}

          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={(values) => mutate(values)}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form className="space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                    <Input
                      name="username"
                      placeholder="Masukkan username"
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

                  <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      icon={<Lock size={18} />}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={cn(
                        "border border-slate-300 bg-white/50 focus:bg-white transition-all",
                        errors.password && touched.password ? "border-red-500 ring-4 ring-red-500/10" : "focus:border-primary/40 focus:border-primary"
                      )}
                    />
                    {errors.password && touched.password && (
                      <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm px-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-500">
                    <input type="checkbox" className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary" />
                    <span>Ingat saya</span>
                  </label>
                  <a href="#" className="text-primary font-bold hover:underline">Lupa password?</a>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin mr-2" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} className="mr-2" />
                      <span>Masuk Sekarang</span>
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
          </Card>
        </div>

        <p className="text-center text-slate-400 text-sm">
          Belum punya akun? <a href="#" className="text-primary font-bold hover:underline">Hubungi Admin</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
