import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { IAcademicYear } from '../../../admin/interfaces/admin.interface';

interface AcademicYearFormProps {
  initialValues?: IAcademicYear;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Nama Tahun Ajaran wajib diisi'),
  startDate: Yup.date().required('Tanggal Mulai wajib diisi'),
  endDate: Yup.date().required('Tanggal Selesai wajib diisi'),
});

const AcademicYearForm = ({ initialValues, onSubmit, onCancel, isLoading }: AcademicYearFormProps) => {
  const isEdit = !!initialValues?.id;

  return (
    <Formik
      initialValues={{
        name: initialValues?.name || '',
        startDate: initialValues?.startDate || '',
        endDate: initialValues?.endDate || '',
        isActive: initialValues?.isActive || false,
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, values, handleChange }) => (
        <Form className="flex flex-col h-full space-y-6">
          <div className="flex-1 space-y-6">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Tahun Ajaran</label>
              <Input 
                name="name" 
                value={values.name} 
                onChange={handleChange}
                placeholder="Contoh: 2023/2024 Ganjil" 
                className={errors.name && touched.name ? "border-red-500" : ""}
              />
              <ErrorMessage name="name" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Tanggal Mulai</label>
                <Input 
                  type="date"
                  name="startDate" 
                  value={values.startDate} 
                  onChange={handleChange}
                  className={errors.startDate && touched.startDate ? "border-red-500" : ""}
                />
                <ErrorMessage name="startDate" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Tanggal Selesai</label>
                <Input 
                  type="date"
                  name="endDate" 
                  value={values.endDate} 
                  onChange={handleChange}
                  className={errors.endDate && touched.endDate ? "border-red-500" : ""}
                />
                <ErrorMessage name="endDate" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                id="isActive" 
                name="isActive" 
                checked={values.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary/20"
              />
              <label htmlFor="isActive" className="text-[11px] font-black uppercase tracking-wider text-slate-500 cursor-pointer">
                Set sebagai Tahun Ajaran Aktif
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-50">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Batal</Button>
            <Button type="submit" className="flex-[2]" isLoading={isLoading}>
              {isEdit ? "Simpan Perubahan" : "Tambah Tahun Ajaran"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AcademicYearForm;
