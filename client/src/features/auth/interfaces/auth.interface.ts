export interface IUser {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'guru';
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}
