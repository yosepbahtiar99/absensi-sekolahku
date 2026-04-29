import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username wajib diisi'),
  password: Yup.string()
    .required('Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
});
