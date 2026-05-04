import type { IGuru } from '../../guru/interfaces/guru.interface';
import type { IKelas } from '../../kelas/interfaces/kelas.interface';
import type { IPelajaran } from '../../lesson/interfaces/lesson.interface';

export interface ISchedule {
  id: string;
  classId: string;
  lessonId: string;
  teacherId: string;
  academicYearId: string;
  timeSlotId: string;
  day: string;
  startTime?: string;
  endTime?: string;
  Class: IKelas;
  Lesson: IPelajaran;
  teacher?: IGuru;
  TimeSlot?: {
    label: string;
    startTime: string;
    endTime: string;
  };
}

export interface ISchedulePayload {
  id?: string;
  classId: string;
  lessonId: string;
  teacherId: string;
  academicYearId: string;
  timeSlotId: string;
  day: string;
}
