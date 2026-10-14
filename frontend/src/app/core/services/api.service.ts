import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  Panchayat,
  Announcement,
  WaterSupplySchedule,
  DashboardStats,
  TaxBill,
  Complaint,
  Property,
  WaterConnection,
  Payment,
  Receipt,
  User,
  Citizen
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('gramseva_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // --- Public APIs ---
  getPanchayatInfo(): Observable<ApiResponse<Panchayat>> {
    return this.http.get<ApiResponse<Panchayat>>(`${this.baseUrl}/public/panchayat`);
  }

  getPublicAnnouncements(): Observable<ApiResponse<Announcement[]>> {
    return this.http.get<ApiResponse<Announcement[]>>(`${this.baseUrl}/public/announcements`);
  }

  getWaterSchedules(): Observable<ApiResponse<WaterSupplySchedule[]>> {
    return this.http.get<ApiResponse<WaterSupplySchedule[]>>(`${this.baseUrl}/public/water-schedules`);
  }

  getPublicStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/public/stats`);
  }

  searchBill(billNumber: string): Observable<ApiResponse<TaxBill>> {
    return this.http.get<ApiResponse<TaxBill>>(`${this.baseUrl}/public/search-bill?billNumber=${encodeURIComponent(billNumber)}`);
  }

  trackComplaint(trackingNumber: string): Observable<ApiResponse<Complaint>> {
    return this.http.get<ApiResponse<Complaint>>(`${this.baseUrl}/public/track-complaint?trackingNumber=${encodeURIComponent(trackingNumber)}`);
  }

  // --- Citizen APIs ---
  getCitizenProfile(): Observable<ApiResponse<Citizen>> {
    return this.http.get<ApiResponse<Citizen>>(`${this.baseUrl}/citizen/profile`, { headers: this.getAuthHeaders() });
  }

  getMyProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(`${this.baseUrl}/citizen/properties`, { headers: this.getAuthHeaders() });
  }

  getMyWaterConnections(): Observable<ApiResponse<WaterConnection[]>> {
    return this.http.get<ApiResponse<WaterConnection[]>>(`${this.baseUrl}/citizen/water-connections`, { headers: this.getAuthHeaders() });
  }

  getMyBills(): Observable<ApiResponse<TaxBill[]>> {
    return this.http.get<ApiResponse<TaxBill[]>>(`${this.baseUrl}/citizen/bills`, { headers: this.getAuthHeaders() });
  }

  payTaxBill(payload: { billId: number; amount: number; paymentMode: string; notes?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/citizen/pay`, payload, { headers: this.getAuthHeaders() });
  }

  getMyPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/citizen/payments`, { headers: this.getAuthHeaders() });
  }

  getMyReceipts(): Observable<ApiResponse<Receipt[]>> {
    return this.http.get<ApiResponse<Receipt[]>>(`${this.baseUrl}/citizen/receipts`, { headers: this.getAuthHeaders() });
  }

  downloadReceiptPdf(receiptId: number): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return this.http.get(`${this.baseUrl}/citizen/receipts/${receiptId}/pdf`, {
      headers,
      responseType: 'blob'
    });
  }

  downloadReceiptPdfByBillId(billId: number): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return this.http.get(`${this.baseUrl}/citizen/bills/${billId}/receipt/pdf`, {
      headers,
      responseType: 'blob'
    });
  }

  downloadReceiptPdfByNumber(receiptNumber: string): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return this.http.get(`${this.baseUrl}/citizen/receipts/number/${receiptNumber}/pdf`, {
      headers,
      responseType: 'blob'
    });
  }

  // --- Reports (PDF & Excel) ---
  downloadMonthlyReportPdf(year?: number, month?: number): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
    let params = '';
    if (year && month) params = `?year=${year}&month=${month}`;
    return this.http.get(`${this.baseUrl}/reports/monthly/pdf${params}`, { headers, responseType: 'blob' });
  }

  downloadMonthlyReportExcel(year?: number, month?: number): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
    let params = '';
    if (year && month) params = `?year=${year}&month=${month}`;
    return this.http.get(`${this.baseUrl}/reports/monthly/excel${params}`, { headers, responseType: 'blob' });
  }

  downloadYearlyReportPdf(financialYear: string = '2026-2027'): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
    return this.http.get(`${this.baseUrl}/reports/yearly/pdf?financialYear=${encodeURIComponent(financialYear)}`, { headers, responseType: 'blob' });
  }

  downloadYearlyReportExcel(financialYear: string = '2026-2027'): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
    return this.http.get(`${this.baseUrl}/reports/yearly/excel?financialYear=${encodeURIComponent(financialYear)}`, { headers, responseType: 'blob' });
  }

  downloadCitizensCensusPdf(): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
    return this.http.get(`${this.baseUrl}/reports/citizens/pdf`, { headers, responseType: 'blob' });
  }

  downloadCitizensCensusExcel(): Observable<Blob> {
    const token = localStorage.getItem('gramseva_token');
    const headers = new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
    return this.http.get(`${this.baseUrl}/reports/citizens/excel`, { headers, responseType: 'blob' });
  }

  getMyComplaints(): Observable<ApiResponse<Complaint[]>> {
    return this.http.get<ApiResponse<Complaint[]>>(`${this.baseUrl}/citizen/complaints`, { headers: this.getAuthHeaders() });
  }

  submitComplaint(complaint: { category: string; title: string; description: string; wardNumber: string; priority?: string }): Observable<ApiResponse<Complaint>> {
    return this.http.post<ApiResponse<Complaint>>(`${this.baseUrl}/citizen/complaints`, complaint, { headers: this.getAuthHeaders() });
  }

  // --- Sarpanch APIs ---
  getSarpanchDashboard(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/sarpanch/dashboard`, { headers: this.getAuthHeaders() });
  }

  getAllCitizens(): Observable<ApiResponse<Citizen[]>> {
    return this.http.get<ApiResponse<Citizen[]>>(`${this.baseUrl}/sarpanch/citizens`, { headers: this.getAuthHeaders() });
  }

  getAllProperties(): Observable<ApiResponse<Property[]>> {
    return this.http.get<ApiResponse<Property[]>>(`${this.baseUrl}/sarpanch/properties`, { headers: this.getAuthHeaders() });
  }

  createProperty(prop: Partial<Property>): Observable<ApiResponse<Property>> {
    return this.http.post<ApiResponse<Property>>(`${this.baseUrl}/sarpanch/properties`, prop, { headers: this.getAuthHeaders() });
  }

  getAllBills(): Observable<ApiResponse<TaxBill[]>> {
    return this.http.get<ApiResponse<TaxBill[]>>(`${this.baseUrl}/sarpanch/bills`, { headers: this.getAuthHeaders() });
  }

  generateHouseTaxBill(propertyId: number, financialYear: string): Observable<ApiResponse<TaxBill>> {
    return this.http.post<ApiResponse<TaxBill>>(`${this.baseUrl}/sarpanch/bills/generate-house-tax`, { propertyId, financialYear }, { headers: this.getAuthHeaders() });
  }

  generateWaterTaxBill(connectionId: number, financialYear: string): Observable<ApiResponse<TaxBill>> {
    return this.http.post<ApiResponse<TaxBill>>(`${this.baseUrl}/sarpanch/bills/generate-water-tax`, { connectionId, financialYear }, { headers: this.getAuthHeaders() });
  }

  getAllComplaints(): Observable<ApiResponse<Complaint[]>> {
    return this.http.get<ApiResponse<Complaint[]>>(`${this.baseUrl}/sarpanch/complaints`, { headers: this.getAuthHeaders() });
  }

  assignComplaint(complaintId: number, staffId: number): Observable<ApiResponse<Complaint>> {
    return this.http.put<ApiResponse<Complaint>>(`${this.baseUrl}/sarpanch/complaints/${complaintId}/assign`, { staffId }, { headers: this.getAuthHeaders() });
  }

  updateComplaintStatus(complaintId: number, status: string, notes: string): Observable<ApiResponse<Complaint>> {
    return this.http.put<ApiResponse<Complaint>>(`${this.baseUrl}/sarpanch/complaints/${complaintId}/status`, { status, notes }, { headers: this.getAuthHeaders() });
  }

  getAllAnnouncements(): Observable<ApiResponse<Announcement[]>> {
    return this.http.get<ApiResponse<Announcement[]>>(`${this.baseUrl}/sarpanch/announcements`, { headers: this.getAuthHeaders() });
  }

  createAnnouncement(announcement: Partial<Announcement>): Observable<ApiResponse<Announcement>> {
    return this.http.post<ApiResponse<Announcement>>(`${this.baseUrl}/sarpanch/announcements`, announcement, { headers: this.getAuthHeaders() });
  }

  deleteAnnouncement(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/sarpanch/announcements/${id}`, { headers: this.getAuthHeaders() });
  }

  getAllPayments(): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/sarpanch/payments`, { headers: this.getAuthHeaders() });
  }

  // --- Water Staff APIs ---
  getWaterConnections(): Observable<ApiResponse<WaterConnection[]>> {
    return this.http.get<ApiResponse<WaterConnection[]>>(`${this.baseUrl}/water/connections`, { headers: this.getAuthHeaders() });
  }

  updateWaterSchedule(scheduleId: number, status: string, noticeMessage: string): Observable<ApiResponse<WaterSupplySchedule>> {
    return this.http.put<ApiResponse<WaterSupplySchedule>>(`${this.baseUrl}/water/schedules/${scheduleId}/status`, { status, noticeMessage }, { headers: this.getAuthHeaders() });
  }

  getWaterComplaints(): Observable<ApiResponse<Complaint[]>> {
    return this.http.get<ApiResponse<Complaint[]>>(`${this.baseUrl}/water/complaints`, { headers: this.getAuthHeaders() });
  }

  resolveWaterComplaint(complaintId: number, notes: string): Observable<ApiResponse<Complaint>> {
    return this.http.put<ApiResponse<Complaint>>(`${this.baseUrl}/water/complaints/${complaintId}/resolve`, { notes }, { headers: this.getAuthHeaders() });
  }

  // --- Admin APIs ---
  getAdminDashboard(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/admin/dashboard`, { headers: this.getAuthHeaders() });
  }

  getPanchayats(): Observable<ApiResponse<Panchayat[]>> {
    return this.http.get<ApiResponse<Panchayat[]>>(`${this.baseUrl}/admin/panchayats`, { headers: this.getAuthHeaders() });
  }

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/admin/users`, { headers: this.getAuthHeaders() });
  }

  toggleUserStatus(id: number): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/admin/users/${id}/toggle-status`, {}, { headers: this.getAuthHeaders() });
  }

  getAuditLogs(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/admin/audit-logs`, { headers: this.getAuthHeaders() });
  }
}
