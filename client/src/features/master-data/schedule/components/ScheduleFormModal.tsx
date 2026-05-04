import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../../../../shared/components/Button';

interface ScheduleFormModalProps {
  initialValues: {
    teacherId: string;
    lessonId: string;
    classId: string;
    timeSlotId: string;
    day: string;
  };
  gurus: any[];
  lessons: any[];
  onSubmit: (values: any) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const scheduleSchema = Yup.object().shape({
  teacherId: Yup.string().required('Guru wajib dipilih'),
  lessonId: Yup.string().required('Mapel wajib dipilih'),
});

const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({ 
  initialValues, gurus, lessons, onSubmit, onClose, isLoading 
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Atur Jadwal</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tentukan Guru & Mata Pelajaran</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={scheduleSchema}
          onSubmit={onSubmit}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Guru Pengajar</label>
                  <select
                    name="teacherId"
                    value={values.teacherId}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {gurus.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <ErrorMessage name="teacherId" component="p" className="text-red-500 text-[10px] font-bold italic px-1" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mata Pelajaran</label>
                  <select
                    name="lessonId"
                    value={values.lessonId}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <ErrorMessage name="lessonId" component="p" className="text-red-500 text-[10px] font-bold italic px-1" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Batal</Button>
                <Button type="submit" className="flex-[2] rounded-xl shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Simpan Jadwal'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ScheduleFormModal;
