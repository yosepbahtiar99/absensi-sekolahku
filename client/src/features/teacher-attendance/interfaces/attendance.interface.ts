export interface ISchedule {
  id: number;
  classId: number;
  lessonId: number;
  teacherId: number;
  day: string;
  startTime: string;
  endTime: string;
  Class: { name: string };
  Lesson: { name: string };
  Attendance?: {
    id: number;
    status: string;
    timestamp: string;
  };
}

export interface IAttendancePayload {
  scheduleId: string;
  status: 'masuk' | 'telat';
  photoSelfie: File;
  photoClass: File;
  latitude?: number;
  longitude?: number;
}
