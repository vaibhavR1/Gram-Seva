import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Citizen, Property, WaterConnection, TaxBill, Complaint } from '../../../core/models/models';
import { PaymentModalComponent } from '../../../shared/components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentModalComponent],
  template: `
    <div class="container dashboard-container">
      <!-- Welcome Header -->
      <div class="welcome-banner card">
        <div class="welcome-text">
          <span class="badge badge-primary">Citizen Self-Service Portal</span>
          <h1>Welcome, {{ authService.currentUser()?.fullName }}</h1>
          <p class="meta-sub">
            Ward: <strong>{{ profile()?.wardNumber || 'Ward-1' }}</strong> • House No: <strong>{{ profile()?.houseNumber || 'H-104' }}</strong> • Aadhaar: <strong>{{ profile()?.aadharMasked || 'XXXX-XXXX-4589' }}</strong>
          </p>
        </div>
        <div class="banner-quick-actions">
          <a routerLink="/citizen/bills" class="btn btn-saffron">
            <span class="material-symbols-rounded">receipt_long</span> My Tax Bills
          </a>
          <a routerLink="/citizen/complaints" class="btn btn-primary">
            <span class="material-symbols-rounded">add_alert</span> Register Grievance
          </a>
        </div>
      </div>

      <!-- Financial Dues Summary Cards -->
      <div class="metrics-grid mt-4">
        <div class="metric-card card" [class.has-dues]="totalPendingDues() > 0">
          <div class="metric-icon-wrap" [class.warning-bg]="totalPendingDues() > 0">
            <span class="material-symbols-rounded">pending_actions</span>
          </div>
          <div>
            <div class="metric-label">Outstanding Dues (FY 2026-27)</div>
            <div class="metric-num">₹{{ totalPendingDues() | number }}</div>
            <div class="metric-note">
              {{ pendingBills().length }} pending assessment bills
            </div>
          </div>
          @if (pendingBills().length > 0) {
            <button class="btn btn-sm btn-saffron mt-2" (click)="openPayment(pendingBills()[0])">
              Quick Pay Bill
            </button>
          }
        </div>

        <div class="metric-card card">
          <div class="metric-icon-wrap emerald-bg">
            <span class="material-symbols-rounded">home_work</span>
          </div>
          <div>
            <div class="metric-label">Registered Properties (Milkat)</div>
            <div class="metric-num">{{ properties().length }}</div>
            <div class="metric-note">
              {{ properties()[0]?.propertyNumber || 'GP-PROP-101' }}
            </div>
          </div>
          <a routerLink="/citizen/properties" class="btn btn-sm btn-secondary mt-2">View Properties</a>
        </div>

        <div class="metric-card card">
          <div class="metric-icon-wrap cyan-bg">
            <span class="material-symbols-rounded">water_drop</span>
          </div>
          <div>
            <div class="metric-label">Active Water Connections</div>
            <div class="metric-num">{{ waterConnections().length }}</div>
            <div class="metric-note">
              Meter: {{ waterConnections()[0]?.meterNumber || 'MTR-88120' }}
            </div>
          </div>
          <a routerLink="/water-schedule" class="btn btn-sm btn-secondary mt-2">Supply Timings</a>
        </div>

        <div class="metric-card card">
          <div class="metric-icon-wrap blue-bg">
            <span class="material-symbols-rounded">report_problem</span>
          </div>
          <div>
            <div class="metric-label">My Registered Grievances</div>
            <div class="metric-num">{{ complaints().length }}</div>
            <div class="metric-note">
              {{ resolvedComplaintsCount() }} Resolved
            </div>
          </div>
          <a routerLink="/citizen/complaints" class="btn btn-sm btn-secondary mt-2">Track Status</a>
        </div>
      </div>

      <!-- Action Required Dues Table -->
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">
            <span class="material-symbols-rounded" style="color: #ea580c">error</span> Assessment Bills & Payments
          </h3>
          <a routerLink="/citizen/bills" class="btn btn-sm btn-secondary">All Bills & Receipts</a>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Assessment Type</th>
                <th>Period</th>
                <th>Due Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (bill of bills(); track bill.id) {
                <tr>
                  <td class="font-mono font-bold">{{ bill.billNumber }}</td>
                  <td>{{ bill.billType === 'HOUSE_TAX' ? '🏡 Ghar Tax (House Tax)' : '💧 Pani Tax (Water Tariff)' }}</td>
                  <td>{{ bill.financialYear }}</td>
                  <td>{{ bill.dueDate }}</td>
                  <td class="font-bold">₹{{ bill.totalAmount }}</td>
                  <td>
                    <span class="badge" [class.badge-paid]="bill.status === 'PAID'" [class.badge-pending]="bill.status === 'PENDING'">
                      {{ bill.status }}
                    </span>
                  </td>
                  <td>
                    @if (bill.status === 'PENDING') {
                      <button class="btn btn-sm btn-saffron" (click)="openPayment(bill)">
                        <span class="material-symbols-rounded">payment</span> Pay Online
                      </button>
                    } @else {
                      <button class="btn btn-sm btn-outline-primary" (click)="downloadReceiptForBill(bill)">
                        <span class="material-symbols-rounded">download</span> Receipt PDF
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Complaints Status Widget -->
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">
            <span class="material-symbols-rounded">track_changes</span> My Recent Grievances (Takrar)
          </h3>
          <a routerLink="/citizen/complaints" class="btn btn-sm btn-primary">
            <span class="material-symbols-rounded">add</span> Register New Complaint
          </a>
        </div>

        <div class="complaints-list">
          @for (c of complaints(); track c.id) {
            <div class="complaint-row">
              <div class="complaint-info">
                <div class="complaint-head">
                  <span class="font-mono font-bold">{{ c.complaintNumber }}</span>
                  <span class="badge" [class.badge-resolved]="c.status === 'RESOLVED'" [class.badge-assigned]="c.status === 'ASSIGNED'" [class.badge-submitted]="c.status === 'SUBMITTED'">
                    {{ c.status }}
                  </span>
                  <span class="c-category">{{ c.category.replace('_', ' ') }}</span>
                </div>
                <h4 class="c-title">{{ c.title }}</h4>
                <p class="c-desc">{{ c.description }}</p>
                @if (c.resolutionNotes) {
                  <div class="c-notes">
                    <strong>Panchayat Resolution Remark:</strong> {{ c.resolutionNotes }}
                  </div>
                }
              </div>
              <div class="complaint-date">
                Submitted: {{ c.submittedAt | date:'mediumDate' }}
              </div>
            </div>
          } @empty {
            <div class="empty-text">No active grievances registered.</div>
          }
        </div>
      </div>
    </div>

    <!-- Payment Modal Component -->
    @if (selectedBillForPay()) {
      <app-payment-modal
        [bill]="selectedBillForPay()!"
        (completed)="onPaymentSuccess()"
        (cancelled)="selectedBillForPay.set(null)"
      ></app-payment-modal>
    }
  `,
  styles: [`
    .dashboard-container { padding: 2.5rem 1.5rem; }
    .welcome-banner {
      background: linear-gradient(135deg, #064e3b, #047857);
      color: white;
      padding: 2rem 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .welcome-text h1 { color: white; font-size: 1.85rem; margin-top: 0.25rem; margin-bottom: 0.5rem; }
    .meta-sub { color: #d1fae5; font-size: 0.875rem; }
    .meta-sub strong { color: white; }
    .banner-quick-actions { display: flex; gap: 0.75rem; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 990px) { .metrics-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .metrics-grid { grid-template-columns: 1fr; } }

    .metric-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .metric-card.has-dues {
      border-left: 4px solid var(--saffron);
    }
    .metric-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    .warning-bg { background: var(--saffron-light); color: var(--saffron); }
    .emerald-bg { background: var(--primary-light); color: var(--primary); }
    .cyan-bg { background: #cffafe; color: #0891b2; }
    .blue-bg { background: #e0f2fe; color: #0284c7; }

    .metric-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .metric-num { font-size: 1.65rem; font-weight: 800; color: var(--text-main); font-family: var(--font-display); margin: 0.2rem 0; }
    .metric-note { font-size: 0.75rem; color: var(--text-muted); }

    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }

    .complaints-list { display: flex; flex-direction: column; }
    .complaint-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding: 1.25rem 0;
      gap: 1rem;
    }
    .complaint-row:last-child { border-bottom: none; }
    .complaint-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem; }
    .c-category { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
    .c-title { font-size: 1rem; margin-bottom: 0.25rem; }
    .c-desc { font-size: 0.875rem; color: var(--text-body); margin-bottom: 0.5rem; }
    .c-notes {
      background: #f0fdf4;
      border-left: 3px solid #16a34a;
      padding: 0.4rem 0.75rem;
      border-radius: 0 4px 4px 0;
      font-size: 0.8125rem;
      color: #166534;
    }
    .complaint-date { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; }
    .empty-text { text-align: center; color: var(--text-muted); padding: 2rem; }
  `]
})
export class CitizenDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);

  profile = signal<Citizen | null>(null);
  properties = signal<Property[]>([]);
  waterConnections = signal<WaterConnection[]>([]);
  bills = signal<TaxBill[]>([]);
  complaints = signal<Complaint[]>([]);

  selectedBillForPay = signal<TaxBill | null>(null);

  pendingBills = computed(() => this.bills().filter(b => b.status === 'PENDING'));
  totalPendingDues = computed(() =>
    this.pendingBills().reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0)
  );
  resolvedComplaintsCount = computed(() =>
    this.complaints().filter(c => c.status === 'RESOLVED').length
  );

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getCitizenProfile().subscribe({ next: r => this.profile.set(r.data) });
    this.apiService.getMyProperties().subscribe({ next: r => this.properties.set(r.data) });
    this.apiService.getMyWaterConnections().subscribe({ next: r => this.waterConnections.set(r.data) });
    this.apiService.getMyBills().subscribe({ next: r => this.bills.set(r.data) });
    this.apiService.getMyComplaints().subscribe({ next: r => this.complaints.set(r.data) });
  }

  openPayment(bill: TaxBill): void {
    this.selectedBillForPay.set(bill);
  }

  onPaymentSuccess(): void {
    this.selectedBillForPay.set(null);
    this.loadData();
  }

  downloadReceiptForBill(bill: TaxBill): void {
    this.apiService.downloadReceiptPdfByBillId(bill.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-${bill.billNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.apiService.getMyReceipts().subscribe({
          next: (receiptsRes) => {
            const matching = receiptsRes.data.find(r => r.bill?.id === bill.id);
            if (matching) {
              this.apiService.downloadReceiptPdf(matching.id).subscribe({
                next: (blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${matching.receiptNumber}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }
              });
            } else {
              alert('Could not download receipt: ' + (err.error?.message || 'Receipt pending generation.'));
            }
          }
        });
      }
    });
  }
}
