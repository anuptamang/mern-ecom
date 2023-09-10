import { IStatus } from 'types/status/statusTypes';
import { IUser } from 'types/user/userType';

export interface ILogin {
  email: string;
  password?: string;
}

export interface IRegister extends ILogin {
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface IAuthSlice {
  result?: IUser;
  token?: string;
  tokenStatus?: "valid" | "expired" | "not set";
  status: IStatus;
}
