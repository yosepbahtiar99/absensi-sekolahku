export interface IAcademicYear {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface ITimeSlot {
  id: string;
  academicYearId: string;
  day: string;
  label: string;
  startTime: string;
  endTime: string;
  periodNumber?: number;
}

export interface IAdminSummary {
  totalGuru: number;
  totalKelas: number;
  totalPelajaran: number;
  activeYear?: string;
  todayStats: {
    hadir: number;
    telat: number;
  };
}

export interface IActivity {
  id: string;
  status: string;
  timestamp: string;
  photoSelfie: string;
  photoClass: string;
  type?: string;
  isCustom?: boolean;
  academicYearId?: string;
  // Snapshot Data
  snapshotClassName?: string;
  snapshotLessonName?: string;
  snapshotTeacherName?: string;
  
  User: { name: string };
  Schedule: {
    Class: { name: string };
    Lesson: { name: string };
  };
}

export interface IActivityResponse {
  data: IActivity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
