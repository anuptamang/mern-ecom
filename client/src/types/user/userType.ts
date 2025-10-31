export interface IUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  __v?: number
}