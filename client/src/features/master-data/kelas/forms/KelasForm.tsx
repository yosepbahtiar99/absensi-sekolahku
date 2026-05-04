import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import type { IKelas, IKelasPayload } from '../interfaces/kelas.interface';

interface KelasFormProps {
  initialValues?: IKelas;
  onSubmit: (values: IKelasPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const kelasSchema = Yup.object().shape({
  name: Yup.string().required('Nama kelas wajib diisi'),
  gradeLevel: Yup.string().required('Tingkat kelas wajib diisi'),
});

const KelasForm: React.FC<KelasFormProps> = ({ initialValues, onSubmit, isLoading, onCancel }) => {
  const isEdit = !!initialValues?.id;
  const grades = ['7', '8', '9', '10', '11', '12'];

  return (
    <Formik
      initialValues={{
        name: initialValues?.name || '',
        gradeLevel: initialValues?.gradeLevel || '',
      }}
      validationSchema={kelasSchema}
      onSubmit={(values) => onSubmit(values as IKelasPayload)}
    >
      {({ errors, touched, values, handleChange }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Kelas</label>
              <Input 
                name="name" 
                value={values.name} 
                onChange={handleChange}
                placeholder="Contoh: X IPA 1" 
                className={errors.name && touched.name ? "border-red-500" : ""}
              />
              <ErrorMessage name="name" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Tingkat</label>
              <select
                name="gradeLevel"
                value={values.gradeLevel}
                onChange={handleChange}
                className={`w-full p-3 bg-white border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none ${
                  errors.gradeLevel && touched.gradeLevel ? "border-red-500" : "border-slate-200"
                }`}
              >
                <option value="">-- Pilih --</option>
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ErrorMessage name="gradeLevel" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Batal</Button>
            <Button type="submit" className="flex-[2]" isLoading={isLoading}>
              {isEdit ? "Simpan Perubahan" : "Tambah Kelas"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default KelasForm;
