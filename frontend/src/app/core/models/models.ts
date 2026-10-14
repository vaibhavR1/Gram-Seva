export type Role = 'SUPER_ADMIN' | 'SARPANCH' | 'CITIZEN' | 'WATER_SUPPLIER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  active: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  citizenId?: number;
}

export interface Panchayat {
  id: number;
  name: string;
  taluka: string;
  district: string;
  state: string;
  pinCode: string;
  officeAddress: string;
  contactEmail: string;
  contactPhone: string;
  sarpanchName: string;
  villagePopulation: number;
}

export interface Citizen {
  id: number;
  user: User;
  panchayat?: Panchayat;
  aadharMasked: string;
  rationCardNumber: string;
  wardNumber: string;
  houseNumber: string;
  address: string;
  gender: string;
  dateOfBirth?: string;
  occupation?: string;
}

export interface Property {
  id: number;
  propertyNumber: string;
  owner: Citizen;
  propertyType: string; // RESIDENTIAL, COMMERCIAL, INDUSTRIAL, OPEN_PLOT
  constructionAreaSqFt?: number;
  plotAreaSqFt?: number;
  wardNumber: string;
  address: string;
  annualTaxAmount: number;
  status: string;
}

export interface WaterConnection {
  id: number;
  connectionNumber: string;
  property?: Property;
  citizen: Citizen;
  connectionType: string; // DOMESTIC, COMMERCIAL
  pipeSizeMm: number;
  monthlyRate: number;
  meterNumber: string;
  status: string;
  installedDate?: string;
}

export interface TaxBill {
  id: number;
  billNumber: string;
  billType: 'HOUSE_TAX' | 'WATER_TAX';
  property?: Property;
  waterConnection?: WaterConnection;
  citizen: Citizen;
  financialYear: string;
  billDate: string;
  dueDate: string;
  baseAmount: number;
  penaltyAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID';
  remarks?: string;
}

export interface Payment {
  id: number;
  paymentReference: string;
  bill: TaxBill;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  gatewayTransactionId?: string;
  status: string;
  notes?: string;
}

export interface Receipt {
  id: number;
  receiptNumber: string;
  payment: Payment;
  bill: TaxBill;
  issuedDate: string;
  verificationHash: string;
}

export interface Complaint {
  id: number;
  complaintNumber: string;
  citizen: Citizen;
  category: 'WATER_SUPPLY' | 'STREET_LIGHT' | 'SANITATION_DRAINAGE' | 'ROAD_REPAIR' | 'PROPERTY_TAX' | 'OTHER';
  title: string;
  description: string;
  wardNumber: string;
  photoUrl?: string;
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedStaff?: User;
  resolutionNotes?: string;
  submittedAt: string;
  resolvedAt?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: 'GRAM_SABHA' | 'WATER_SUPPLY' | 'HEALTH_CAMP' | 'GOV_SCHEME' | 'GENERAL_NOTICE';
  publishDate: string;
  expiryDate?: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  active: boolean;
}

export interface WaterSupplySchedule {
  id: number;
  wardNumber: string;
  areaName: string;
  morningTimeRange: string;
  eveningTimeRange: string;
  status: 'REGULAR' | 'DELAYED' | 'INTERRUPTED' | 'MAINTENANCE';
  noticeMessage?: string;
  effectiveDate: string;
}

export interface DashboardStats {
  totalCitizens: number;
  totalProperties: number;
  totalWaterConnections: number;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  totalDemand: number;
  totalCollected: number;
  totalOutstanding: number;
  totalComplaints: number;
  resolvedComplaints: number;
  activeComplaints: number;
  activeAnnouncements: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
