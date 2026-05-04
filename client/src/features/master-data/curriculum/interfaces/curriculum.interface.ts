import type { IPelajaran as ILesson } from '../../lesson/interfaces/lesson.interface';
import type { IAcademicYear } from '../../../admin/interfaces/admin.interface';

export interface ICurriculum {
  id: string;
  academicYearId: string;
  gradeLevel: string;
  lessonId: string;
  requiredHours: number;
  Lesson?: ILesson;
  AcademicYear?: IAcademicYear;
}

export interface ICurriculumPayload {
  id?: string;
  academicYearId: string;
  gradeLevel: string;
  lessonId: string;
  requiredHours: number;
}
