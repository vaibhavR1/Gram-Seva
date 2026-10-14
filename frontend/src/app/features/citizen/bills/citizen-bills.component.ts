import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { TaxBill, Receipt } from '../../../core/models/models';
import { PaymentModalComponent } from '../../../shared/components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-citizen-bills',
  standalone: true,
  imports: [CommonModule, PaymentModalComponent],
  template: `
    <div class="container page-container">
      <div class="page-header">
        <div>
          <span class="badge badge-primary">E-Revenue Assessment</span>
          <h1 class="page-title">Tax Bills & Payment Receipts</h1>
          <p class="page-desc">Ghar Patti (House Tax) & Pani Patti (Water Tariff) assessment records, online payment, and verified PDF receipts.</p>
        </div>
      </div>

      <!-- Financial Summary Cards -->
      <div class="summary-cards-row">
        <div class="card s-card highlight-card">
          <div class="s-icon warning-bg"><span class="material-symbols-rounded">payment</span></div>
          <div>
            <div class="s-label">Outstanding Balance</div>
            <div class="s-num">₹{{ totalPendingAmount() | number }}</div>
            <div class="s-sub">{{ pendingBills().length }} bill(s) pending for current year</div>
          </div>
        </div>

        <div class="card s-card">
          <div class="s-icon emerald-bg"><span class="material-symbols-rounded">task_alt</span></div>
          <div>
            <div class="s-label">Total Cleared / Paid</div>
            <div class="s-num">₹{{ totalPaidAmount() | number }}</div>
            <div class="s-sub">{{ paidBills().length }} bill(s) successfully cleared</div>
          </div>
        </div>

        <div class="card s-card">
          <div class="s-icon blue-bg"><span class="material-symbols-rounded">receipt</span></div>
          <div>
            <div class="s-label">Official Receipts Issued</div>
            <div class="s-num">{{ receipts().length }}</div>
            <div class="s-sub">Instant digitally signed PDF downloads</div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="tabs-row mt-4">
        <button class="filter-tab" [class.active]="filter() === 'ALL'" (click)="filter.set('ALL')">
          All Bills ({{ bills().length }})
        </button>
        <button class="filter-tab" [class.active]="filter() === 'PENDING'" (click)="filter.set('PENDING')">
          ⚠️ Pending / Unpaid ({{ pendingBills().length }})
        </button>
        <button class="filter-tab" [class.active]="filter() === 'PAID'" (click)="filter.set('PAID')">
          ✅ Paid & Receipts ({{ paidBills().length }})
        </button>
      </div>

      <!-- Bills Table -->
      <div class="card mt-2">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Assessment Type</th>
                <th>Property / Connection</th>
                <th>Year</th>
                <th>Due Date</th>
                <th>Breakdown</th>
                <th>Total Demand</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (bill of filteredBills(); track bill.id) {
                <tr>
                  <td class="font-mono font-bold">{{ bill.billNumber }}</td>
                  <td>
                    <span class="type-pill" [class.water]="bill.billType === 'WATER_TAX'">
                      {{ bill.billType === 'HOUSE_TAX' ? '🏡 Ghar Tax' : '💧 Pani Tax' }}
                    </span>
                  </td>
                  <td>
                    @if (bill.property) {
                      <div class="text-sm font-semibold">{{ bill.property.propertyNumber }}</div>
                      <div class="text-xs text-muted">{{ bill.property.propertyType }}</div>
                    } @else if (bill.waterConnection) {
                      <div class="text-sm font-semibold">{{ bill.waterConnection.connectionNumber }}</div>
                      <div class="text-xs text-muted">Meter: {{ bill.waterConnection.meterNumber }}</div>
                    }
                  </td>
                  <td>{{ bill.financialYear }}</td>
                  <td>
                    <span [class.text-danger]="bill.status === 'PENDING'">{{ bill.dueDate }}</span>
                  </td>
                  <td>
                    <div class="text-xs">Base: ₹{{ bill.baseAmount }}</div>
                    @if (bill.penaltyAmount > 0) {
                      <div class="text-xs text-danger">+ Penalty: ₹{{ bill.penaltyAmount }}</div>
                    }
                  </td>
                  <td class="font-bold text-lg">₹{{ bill.totalAmount }}</td>
                  <td>
                    <span class="badge" [class.badge-paid]="bill.status === 'PAID'" [class.badge-pending]="bill.status === 'PENDING'">
                      {{ bill.status }}
                    </span>
                  </td>
                  <td>
                    @if (bill.status === 'PENDING') {
                      <button class="btn btn-sm btn-saffron" (click)="payBill(bill)">
                        <span class="material-symbols-rounded">credit_card</span> Pay Now
                      </button>
                    } @else {
                      <button class="btn btn-sm btn-outline-primary" (click)="downloadReceiptForBill(bill)">
                        <span class="material-symbols-rounded">download</span> PDF Receipt
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="text-center py-4 text-muted">No tax bills found matching this filter.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Payment Modal Component -->
    @if (billToPay()) {
      <app-payment-modal
        [bill]="billToPay()!"
        (completed)="onPaymentSuccess()"
        (cancelled)="billToPay.set(null)"
      ></app-payment-modal>
    }
  `,
  styles: [`
    .page-container { padding: 3rem 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2.25rem; margin-top: 0.5rem; margin-bottom: 0.25rem; }
    .page-desc { color: var(--text-muted); font-size: 1rem; }

    .summary-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 800px) {
      .summary-cards-row { grid-template-columns: 1fr; }
    }
    .s-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .highlight-card { border-left: 4px solid var(--saffron); }
    .s-icon {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .warning-bg { background: var(--saffron-light); color: var(--saffron); }
    .emerald-bg { background: var(--primary-light); color: var(--primary); }
    .blue-bg { background: #e0f2fe; color: #0284c7; }
    .s-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .s-num { font-size: 1.85rem; font-weight: 800; color: var(--text-main); font-family: var(--font-display); }
    .s-sub { font-size: 0.75rem; color: var(--text-muted); }

    .tabs-row {
      display: flex;
      gap: 0.5rem;
    }
    .filter-tab {
      padding: 0.65rem 1.25rem;
      border: 1px solid var(--border);
      background: white;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      transition: var(--transition);
    }
    .filter-tab:hover { background: var(--bg-subtle); }
    .filter-tab.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: 0 2px 6px rgba(4, 120, 87, 0.25);
    }

    .type-pill {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .type-pill.water {
      background: #f0f9ff;
      color: #0369a1;
      border-color: #bae6fd;
    }

    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-sm { font-size: 0.8125rem; }
    .text-xs { font-size: 0.75rem; }
    .text-muted { color: var(--text-muted); }
    .text-danger { color: var(--danger); font-weight: 600; }
    .text-lg { font-size: 1.125rem; }
    .mt-4 { margin-top: 2rem; }
    .mt-2 { margin-top: 1rem; }
    .py-4 { padding-top: 2rem; padding-bottom: 2rem; }
    .text-center { text-align: center; }
  `]
})
export class CitizenBillsComponent implements OnInit {
  private apiService = inject(ApiService);

  bills = signal<TaxBill[]>([]);
  receipts = signal<Receipt[]>([]);
  filter = signal<'ALL' | 'PENDING' | 'PAID'>('ALL');
  billToPay = signal<TaxBill | null>(null);

  pendingBills = computed(() => this.bills().filter(b => b.status === 'PENDING'));
  paidBills = computed(() => this.bills().filter(b => b.status === 'PAID'));

  totalPendingAmount = computed(() =>
    this.pendingBills().reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0)
  );
  totalPaidAmount = computed(() =>
    this.paidBills().reduce((sum, b) => sum + b.paidAmount, 0)
  );

  filteredBills = computed(() => {
    const f = this.filter();
    if (f === 'PENDING') return this.pendingBills();
    if (f === 'PAID') return this.paidBills();
    return this.bills();
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getMyBills().subscribe({ next: r => this.bills.set(r.data) });
    this.apiService.getMyReceipts().subscribe({ next: r => this.receipts.set(r.data) });
  }

  payBill(bill: TaxBill): void {
    this.billToPay.set(bill);
  }

  onPaymentSuccess(): void {
    this.billToPay.set(null);
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
        const matching = this.receipts().find(r => r.bill?.id === bill.id);
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
}
