export interface IGuru {
  id: string;
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
