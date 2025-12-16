export enum UserRole {
  Administrator = 'Administrator',
  Cashier = 'Cashier',
  Receptionist = 'Receptionist',
  InpatientStaff = 'Inpatient Staff',
  OutpatientStaff = 'Outpatient Staff'
}

export interface User {
  userId: string;
  username: string;
  designation: string;
  role: UserRole;
}

export interface LoginRequest {
  empId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    fullName: string;
    role: string;
    userId: string;
    expiresAt: string;
  };
  errors: string[];
}

export interface ValidateResponse {
  success: boolean;
  message: string;
  data: string;
  errors: string[];
}