export interface IAdminSummary {
  totalGuru: number;
  totalKelas: number;
  totalPelajaran: number;
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
  User: { name: string };
  Schedule: {
    Class: { name: string };
    Lesson: { name: string };
  };
}

export interface IActivityResponse {
  data: IActivity[];
  total: number;
  page: number;
  limit: number;
}
