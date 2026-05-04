import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import type { ISchedulePayload } from '../interfaces/schedule.interface';
import type { IGuru } from '../../guru/interfaces/guru.interface';
import type { IKelas } from '../../kelas/interfaces/kelas.interface';
import type { IPelajaran } from '../../lesson/interfaces/lesson.interface';

import type { ITimeSlot } from '../../../admin/interfaces/admin.interface';

interface ScheduleFormProps {
  initialValues?: Partial<ISchedulePayload>;
  gurus: IGuru[];
  classes: IKelas[];
  lessons: IPelajaran[];
  timeSlots: ITimeSlot[];
  academicYearId: string;
  onSubmit: (values: ISchedulePayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const scheduleSchema = Yup.object().shape({
  day: Yup.string().required('Hari wajib dipilih'),
  timeSlotId: Yup.string().required('Slot jam wajib dipilih'),
  teacherId: Yup.string().required('Guru wajib dipilih').notOneOf(['0', ''], 'Guru wajib dipilih'),
  classId: Yup.string().required('Kelas wajib dipilih').notOneOf(['0', ''], 'Kelas wajib dipilih'),
  lessonId: Yup.string().required('Pelajaran wajib dipilih').notOneOf(['0', ''], 'Pelajaran wajib dipilih'),
});

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  initialValues, gurus, classes, lessons, timeSlots, academicYearId, onSubmit, isLoading, onCancel 
}) => {
  const isEdit = !!initialValues?.id;

  // Filter time slots based on selected day in Formik
  const getFilteredSlots = (day: string) => {
    return timeSlots.filter(s => s.day === day).sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
  };

  return (
    <Formik
      initialValues={{
        day: initialValues?.day || 'senin',
        academicYearId: academicYearId,
        timeSlotId: initialValues?.timeSlotId || '',
        teacherId: initialValues?.teacherId || '',
        classId: initialValues?.classId || '',
        lessonId: initialValues?.lessonId || '',
        id: initialValues?.id,
      } as ISchedulePayload}
      validationSchema={scheduleSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Hari</label>
              <select
                name="day"
                value={values.day}
                onChange={(e) => {
                  handleChange(e);
                  // Reset timeSlotId when day changes
                  values.timeSlotId = '';
                }}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'].map(d => (
                  <option key={d} value={d}>{d.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Slot Jam Pelajaran</label>
              <select
                name="timeSlotId"
                value={values.timeSlotId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">Pilih Slot Jam</option>
                {getFilteredSlots(values.day).map(s => (
                  <option key={s.id} value={s.id}>{s.label} ({s.startTime} - {s.endTime})</option>
                ))}
              </select>
              <ErrorMessage name="timeSlotId" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Pelajaran</label>
              <select
                name="lessonId"
                value={values.lessonId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">Pilih Pelajaran</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <ErrorMessage name="lessonId" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Kelas</label>
              <select
                name="classId"
                value={values.classId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="">Pilih Kelas</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ErrorMessage name="classId" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Guru Pengajar</label>
            <select
              name="teacherId"
              value={values.teacherId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="">Pilih Guru</option>
              {gurus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <ErrorMessage name="teacherId" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Batal</Button>
            <Button type="submit" className="flex-[2]" isLoading={isLoading}>
              {isEdit ? "Simpan Perubahan" : "Tambah Jadwal"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ScheduleForm;
