export interface ISchedule {
  id: string;
  classId: string;
  lessonId: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  Class: { name: string };
  Lesson: { name: string };
  Attendance?: {
    id: string;
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
