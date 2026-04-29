import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import type { IPelajaran, IPelajaranPayload } from '../interfaces/lesson.interface';

interface LessonFormProps {
  initialValues?: IPelajaran;
  onSubmit: (values: IPelajaranPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const lessonSchema = Yup.object().shape({
  name: Yup.string().required('Nama pelajaran wajib diisi'),
  hours: Yup.number().required('Jumlah jam wajib diisi').min(1, 'Minimal 1 jam'),
});

const LessonForm: React.FC<LessonFormProps> = ({ initialValues, onSubmit, isLoading, onCancel }) => {
  const isEdit = !!initialValues?.id;

  return (
    <Formik
      initialValues={{
        name: initialValues?.name || '',
        hours: initialValues?.hours || 0,
      }}
      validationSchema={lessonSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, values, handleChange }) => (
        <Form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Pelajaran</label>
              <Input 
                name="name" 
                value={values.name} 
                onChange={handleChange}
                placeholder="Contoh: Matematika" 
                className={errors.name && touched.name ? "border-red-500" : ""}
              />
              <ErrorMessage name="name" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Jumlah Jam (Per Minggu)</label>
              <Input 
                type="number"
                name="hours" 
                value={values.hours} 
                onChange={handleChange}
                placeholder="0" 
                className={errors.hours && touched.hours ? "border-red-500" : ""}
              />
              <ErrorMessage name="hours" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Batal</Button>
            <Button type="submit" className="flex-[2]" isLoading={isLoading}>
              {isEdit ? "Simpan Perubahan" : "Tambah Pelajaran"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default LessonForm;
