export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

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
  role?: string;
  __v?: number;
  // Contact information
  secondaryEmail?: string;
  phone?: string;
  secondaryPhone?: string;
  // Addresses
  primaryAddress?: IAddress;
  secondaryAddress?: IAddress;
}