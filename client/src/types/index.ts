
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export type UserRole = 'ADMIN' | 'LAB_TECH' | 'PATHOLOGIST' | 'RECEPTIONIST' | 'DOCTOR';

export interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone: string;
  email?: string;
  address?: string;
  referredBy?: string;
  isActive?: boolean;
  createdAt: Date;
  orders?: Order[];
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface Test {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  sampleType: string;
  containerType: string;
  normalRange?: string;
  unit?: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface OrderTest {
  id: string;
  orderId: string;
  testId: string;
  result?: string;
  notes?: string;
  test: Test;
}

export interface Order {
  id: string;
  orderNumber: string;
  patientId: string;
  referredBy?: string;
  status: OrderStatus;
  createdBy: string;
  sampleCollectedAt?: Date;
  sampleCollectedBy?: string;
  reportReadyAt?: Date;
  verifiedBy?: string;
  totalAmount: number;
  createdAt: Date;
  patient?: Patient;
  orderTests?: OrderTest[];
  creator?: { firstName: string; lastName: string };
  sampleCollector?: { firstName: string; lastName: string };
  verifier?: { firstName: string; lastName: string };
}

export type OrderStatus = 'SAMPLE_PENDING' | 'SAMPLE_PROCESSING' | 'REPORT_PROCESSING' | 'VERIFIED';

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
