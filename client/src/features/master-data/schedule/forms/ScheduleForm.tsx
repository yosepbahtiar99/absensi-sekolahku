import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import type { ISchedule, ISchedulePayload } from '../interfaces/schedule.interface';
import type { IGuru } from '../../guru/interfaces/guru.interface';
import type { IKelas } from '../../kelas/interfaces/kelas.interface';
import type { IPelajaran } from '../../lesson/interfaces/lesson.interface';

interface ScheduleFormProps {
  initialValues?: Partial<ISchedulePayload>;
  gurus: IGuru[];
  classes: IKelas[];
  lessons: IPelajaran[];
  onSubmit: (values: ISchedulePayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const scheduleSchema = Yup.object().shape({
  day: Yup.string().required('Hari wajib dipilih'),
  startTime: Yup.string().required('Jam mulai wajib diisi'),
  endTime: Yup.string().required('Jam selesai wajib diisi'),
  teacherId: Yup.number().required('Guru wajib dipilih'),
  classId: Yup.number().required('Kelas wajib dipilih'),
  lessonId: Yup.number().required('Pelajaran wajib dipilih'),
});

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  initialValues, gurus, classes, lessons, onSubmit, isLoading, onCancel 
}) => {
  const isEdit = !!initialValues?.id;

  return (
    <Formik
      initialValues={{
        day: initialValues?.day || 'senin',
        startTime: initialValues?.startTime || '07:00',
        endTime: initialValues?.endTime || '08:00',
        teacherId: initialValues?.teacherId || 0,
        classId: initialValues?.classId || 0,
        lessonId: initialValues?.lessonId || 0,
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
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'].map(d => (
                  <option key={d} value={d}>{d.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Pelajaran</label>
              <select
                name="lessonId"
                value={values.lessonId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value={0}>Pilih Pelajaran</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <ErrorMessage name="lessonId" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Jam Mulai</label>
              <Input type="time" name="startTime" value={values.startTime} onChange={handleChange} />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Jam Selesai</label>
              <Input type="time" name="endTime" value={values.endTime} onChange={handleChange} />
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
              <option value={0}>Pilih Guru</option>
              {gurus.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <ErrorMessage name="teacherId" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Kelas</label>
            <select
              name="classId"
              value={values.classId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value={0}>Pilih Kelas</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ErrorMessage name="classId" component="p" className="text-red-500 text-[10px] mt-1 font-bold italic" />
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
