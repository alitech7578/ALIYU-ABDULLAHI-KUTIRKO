export type MarriedStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export interface DataRecord {
  id: string;
  name: string;
  middleName: string;
  surname: string;
  email: string;
  department: string;
  spNumber: string;
  rank: string;
  state: string;
  lg: string;
  marriedStatus: MarriedStatus;
  bloodGroup: string;
  phoneNumber: string;
  createdAt: string;
  photo: string; // Stored as a base64 Data URL
  createdBy: string;
}

export interface Student {
  id: string;
  firstName: string;
  middleName: string;
  surname: string;
  email: string;
  department: string;
  registrationNumber: string;
  createdAt: string;
  createdBy: string;
  photo: string; // Stored as a base64 Data URL
}