import type { IPelajaran as ILesson } from '../../lesson/interfaces/lesson.interface';
import type { IAcademicYear } from '../../../admin/interfaces/admin.interface';
import type { IGradeLevel } from '../../grade-level/interfaces/grade-level.interface';

export interface ICurriculum {
  id: string;
  academicYearId: string;
  gradeLevelId: string;
  lessonId: string;
  requiredHours: number;
  Lesson?: ILesson;
  AcademicYear?: IAcademicYear;
  GradeLevel?: IGradeLevel;
}

export interface ICurriculumPayload {
  id?: string;
  academicYearId: string;
  gradeLevelId: string;
  lessonId: string;
  requiredHours: number;
}
