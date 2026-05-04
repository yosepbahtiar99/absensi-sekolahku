import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { SelectField } from '../../../../shared/components/SelectField';
import type { IKelas, IKelasPayload } from '../interfaces/kelas.interface';
import { useGradeLevels } from '../../grade-level/hooks/useGradeLevelData';

interface KelasFormProps {
  initialValues?: IKelas;
  onSubmit: (values: IKelasPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const kelasSchema = Yup.object().shape({
  name: Yup.string().required('Nama kelas wajib diisi'),
  gradeLevelId: Yup.string().required('Tingkat kelas wajib diisi'),
});

const KelasForm: React.FC<KelasFormProps> = ({ initialValues, onSubmit, isLoading, onCancel }) => {
  const isEdit = !!initialValues?.id;
  const { data: grades = [] } = useGradeLevels();

  return (
    <Formik
      initialValues={{
        name: initialValues?.name || '',
        gradeLevelId: (initialValues as any)?.gradeLevelId || '',
      }}
      validationSchema={kelasSchema}
      onSubmit={(values) => onSubmit(values as any)}
    >
      {({ errors, touched, values, handleChange, setFieldValue }) => (
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
              <SelectField
                label="Tingkat"
                placeholder="-- Pilih Tingkat --"
                value={values.gradeLevelId}
                options={grades.map(g => ({ value: g.id, label: g.name }))}
                onChange={(val) => setFieldValue('gradeLevelId', val)}
                error={touched.gradeLevelId ? (errors.gradeLevelId as string) : undefined}
              />
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
