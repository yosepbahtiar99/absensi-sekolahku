export interface IKelas {
  id: string;
  name: string;
  gradeLevelId?: string;
  GradeLevel?: { id: string; name: string };
}

export interface IKelasPayload {
  name: string;
  gradeLevelId: string;
}
