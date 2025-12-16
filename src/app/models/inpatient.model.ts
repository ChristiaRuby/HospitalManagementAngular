export interface Inpatient {
  patientId: string;
  firstName: string;
  surname: string;
  gender: string;
  dateOfBirth: string;
  nicNumber: string;
  address: string;
  phoneHome: string;
  phoneMobile: string;
  occupation: string;
  civilStatus: string;
  accountType: string;
  companyId: string;
  companyName: string;
  modDate: string;
}

export interface InpatientResponse {
  data: Inpatient[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Company {
  id: string;
  name: string;
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum CivilStatus {
  UNMARRIED = 'Unmarried',
  MARRIED = 'Married',
}

export enum AccountType {
  INDIVIDUAL = 'Individual',
  CORPORATE = 'Corporate'
}