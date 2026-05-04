import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import type { ITimeSlot } from '../../../admin/interfaces/admin.interface';

interface TimeSlotFormProps {
  initialValues?: ITimeSlot;
  academicYearId: string;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const validationSchema = Yup.object({
  day: Yup.string().required('Hari wajib dipilih'),
  label: Yup.string().required('Label wajib diisi'),
  startTime: Yup.string().required('Jam mulai wajib diisi'),
  endTime: Yup.string().required('Jam selesai wajib diisi'),
  periodNumber: Yup.number().optional().nullable(),
});

const TimeSlotForm = ({ initialValues, academicYearId, onSubmit, onCancel, isLoading }: TimeSlotFormProps) => {
  const isEdit = !!initialValues?.id;

  const days = [
    { value: 'senin', label: 'Senin' },
    { value: 'selasa', label: 'Selasa' },
    { value: 'rabu', label: 'Rabu' },
    { value: 'kamis', label: 'Kamis' },
    { value: 'jumat', label: 'Jumat' },
    { value: 'sabtu', label: 'Sabtu' },
    { value: 'minggu', label: 'Minggu' },
  ];

  return (
    <Formik
      initialValues={{
        academicYearId,
        day: initialValues?.day || 'senin',
        label: initialValues?.label || '',
        startTime: initialValues?.startTime || '',
        endTime: initialValues?.endTime || '',
        periodNumber: initialValues?.periodNumber || 0,
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, values, handleChange }) => (
        <Form className="flex flex-col h-full space-y-6">
          <div className="flex-1 space-y-6">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Hari</label>
              <select 
                name="day" 
                value={values.day} 
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
              >
                {days.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <ErrorMessage name="day" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Nomor Urut</label>
                <Input 
                  type="number"
                  name="periodNumber" 
                  value={values.periodNumber} 
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Label Slot</label>
                <Input 
                  name="label" 
                  value={values.label} 
                  onChange={handleChange}
                  placeholder="Contoh: Jam ke-1" 
                  className={errors.label && touched.label ? "border-red-500" : ""}
                />
                <ErrorMessage name="label" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Jam Mulai</label>
                <Input 
                  type="time"
                  step="1"
                  name="startTime" 
                  value={values.startTime} 
                  onChange={handleChange}
                  className={errors.startTime && touched.startTime ? "border-red-500" : ""}
                />
                <ErrorMessage name="startTime" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Jam Selesai</label>
                <Input 
                  type="time"
                  step="1"
                  name="endTime" 
                  value={values.endTime} 
                  onChange={handleChange}
                  className={errors.endTime && touched.endTime ? "border-red-500" : ""}
                />
                <ErrorMessage name="endTime" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-50">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Batal</Button>
            <Button type="submit" className="flex-[2]" isLoading={isLoading}>
              {isEdit ? "Simpan Perubahan" : "Tambah Slot Jam"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default TimeSlotForm;
