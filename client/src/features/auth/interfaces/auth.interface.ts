export interface IUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'guru';
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}
