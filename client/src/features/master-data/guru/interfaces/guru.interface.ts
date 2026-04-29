export interface IGuru {
  id: number;
  username: string;
  name: string;
  nip?: string;
  email?: string;
}

export interface IGuruPayload {
  username: string;
  name: string;
  password?: string;
}
