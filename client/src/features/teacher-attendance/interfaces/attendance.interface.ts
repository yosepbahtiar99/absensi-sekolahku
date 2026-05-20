export interface ISchedule {
  id: string;
  classId?: string;
  lessonId?: string;
  teacherId?: string;
  day: string;
  startTime: string;
  endTime: string;
  Class: { name: string } | null;
  Lesson: { name: string } | null;
  Attendance?: {
    id: string;
    status: string;
    timestamp: string;
  } | null;
  teacher?: { isPhotoRequired: boolean } | null;
  isBreak?: boolean;
  TimeSlot?: {
    label: string;
    startTime: string;
    endTime: string;
  } | null;
}

export interface IAttendancePayload {
  scheduleId: string;
  status: 'masuk' | 'telat';
  photoSelfie: File;
  photoClass: File;
  latitude?: number;
  longitude?: number;
}
