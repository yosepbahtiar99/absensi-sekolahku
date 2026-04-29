import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import type { IGuru, IGuruPayload } from '../interfaces/guru.interface';

interface GuruFormProps {
  initialValues?: IGuru;
  onSubmit: (values: IGuruPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const guruSchema = Yup.object().shape({
  name: Yup.string().required('Nama wajib diisi'),
  username: Yup.string().required('Username wajib diisi'),
  password: Yup.string().when('id', {
    is: (id: any) => !id,
    then: (schema) => schema.required('Password wajib diisi untuk guru baru'),
    otherwise: (schema) => schema.optional(),
  }),
});

const GuruForm: React.FC<GuruFormProps> = ({ initialValues, onSubmit, isLoading, onCancel }) => {
  const isEdit = !!initialValues?.id;

  return (
    <Formik
      initialValues={{
        name: initialValues?.name || '',
        username: initialValues?.username || '',
        password: '',
      }}
      validationSchema={guruSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, values, handleChange }) => (
        <Form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Lengkap</label>
              <Input 
                name="name" 
                value={values.name} 
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso, S.Pd" 
                className={errors.name && touched.name ? "border-red-500" : ""}
              />
              <ErrorMessage name="name" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Username</label>
              <Input 
                name="username" 
                value={values.username} 
                onChange={handleChange}
                placeholder="budisantoso123" 
                className={errors.username && touched.username ? "border-red-500" : ""}
              />
              <ErrorMessage name="username" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                {isEdit ? "Password Baru (Opsional)" : "Password"}
              </label>
              <Input 
                type="password" 
                name="password" 
                value={values.password} 
                onChange={handleChange}
                placeholder="••••••••" 
                className={errors.password && touched.password ? "border-red-500" : ""}
              />
              <ErrorMessage name="password" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Batal</Button>
            <Button type="submit" className="flex-[2]" isLoading={isLoading}>
              {isEdit ? "Simpan Perubahan" : "Tambah Guru"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default GuruForm;
