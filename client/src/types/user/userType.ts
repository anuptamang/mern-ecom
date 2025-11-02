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
  // For delivery persons - reference to their delivery agency
  deliveryAgencyId?: string;
  // For delivery persons - type of deliverer
  delivererType?: 'warehouse' | 'customer_delivery' | 'customer_return';
  // Contact information
  secondaryEmail?: string;
  phone?: string;
  secondaryPhone?: string;
  // Addresses
  primaryAddress?: IAddress;
  secondaryAddress?: IAddress;
  // Bank payout information (for sellers)
  bankPayout?: {
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    accountType?: 'checking' | 'savings';
  };
  // Profile completion tracking
  profileCompleted?: boolean;
  profileCompletion?: number;
  profileCompletedAt?: Date | string;
}