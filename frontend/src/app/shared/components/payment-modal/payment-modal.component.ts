import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaxBill } from '../../../core/models/models';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-content payment-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="payment-header">
          <div class="header-left">
            <span class="material-symbols-rounded shield-icon">lock</span>
            <div>
              <h3>Secure Tax Payment</h3>
              <p>Gram Panchayat E-Tax Collection Gateway</p>
            </div>
          </div>
          <button class="close-btn" (click)="close()">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        @if (!paymentSuccess()) {
          <!-- Bill Summary Banner -->
          <div class="bill-summary">
            <div class="summary-row">
              <span class="label">Bill Number:</span>
              <span class="value font-mono">{{ bill.billNumber }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Assessment Type:</span>
              <span class="value">{{ bill.billType === 'HOUSE_TAX' ? '🏡 Ghar Tax (House Tax)' : '💧 Water Supply Tariff' }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Financial Year:</span>
              <span class="value">{{ bill.financialYear }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total-row">
              <span class="label">Total Amount Payable:</span>
              <span class="amount">₹{{ bill.totalAmount }}</span>
            </div>
          </div>

          <!-- Payment Mode Selection -->
          <div class="payment-modes">
            <label class="mode-label">Select Payment Method:</label>
            <div class="modes-grid">
              <div class="mode-card" [class.selected]="selectedMode() === 'ONLINE_UPI'" (click)="selectedMode.set('ONLINE_UPI')">
                <span class="material-symbols-rounded mode-icon">qr_code_scanner</span>
                <span class="mode-name">UPI / QR Code</span>
                <span class="mode-sub">GPay, PhonePe, Paytm</span>
              </div>
              <div class="mode-card" [class.selected]="selectedMode() === 'CARD'" (click)="selectedMode.set('CARD')">
                <span class="material-symbols-rounded mode-icon">credit_card</span>
                <span class="mode-name">Debit / Credit Card</span>
                <span class="mode-sub">Visa, RuPay, MasterCard</span>
              </div>
              <div class="mode-card" [class.selected]="selectedMode() === 'NET_BANKING'" (click)="selectedMode.set('NET_BANKING')">
                <span class="material-symbols-rounded mode-icon">account_balance</span>
                <span class="mode-name">Net Banking</span>
                <span class="mode-sub">SBI, HDFC, ICICI, etc.</span>
              </div>
            </div>
          </div>

          <!-- Mode Details -->
          @if (selectedMode() === 'ONLINE_UPI') {
            <div class="upi-box">
              <div class="qr-placeholder">
                <!-- Visual SVG QR code simulator -->
                <svg class="qr-svg" viewBox="0 0 100 100" width="120" height="120">
                  <rect width="100" height="100" fill="#ffffff" rx="8" />
                  <path d="M10 10h25v25h-25z M15 15h15v15h-15z M65 10h25v25h-25z M70 15h15v15h-15z M10 65h25v25h-25z M15 70h15v15h-15z M45 10h10v10h-10z M45 30h10v10h-10z M45 50h10v10h-10z M45 70h10v10h-10z M65 45h25v10h-25z M65 65h10v10h-10z M80 65h10v25h-10z" fill="#0f172a"/>
                  <circle cx="50" cy="50" r="10" fill="#047857"/>
                  <text x="50" y="54" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">₹</text>
                </svg>
                <div class="qr-info">
                  <span class="qr-title">Scan using any UPI App</span>
                  <span class="vpa">upi:&#64;panchayatshivane.sbi</span>
                  <span class="timer">Dynamic QR active for: 04:59</span>
                </div>
              </div>
            </div>
          } @else if (selectedMode() === 'CARD') {
            <div class="card-inputs">
              <input type="text" class="form-control mb-2" placeholder="Card Number (4532 •••• •••• 8891)" value="4532 9918 2039 8891" />
              <div class="row-2">
                <input type="text" class="form-control" placeholder="MM/YY" value="08/29" />
                <input type="password" class="form-control" placeholder="CVV" value="382" />
              </div>
            </div>
          } @else {
            <div class="netbanking-select">
              <select class="form-control">
                <option>State Bank of India (SBI)</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Bank of Maharashtra</option>
                <option>Pune District Central Co-op Bank</option>
              </select>
            </div>
          }

          <!-- Pay Action -->
          <div class="payment-actions">
            <button class="btn btn-secondary" (click)="close()" [disabled]="processing()">
              Cancel
            </button>
            <button class="btn btn-primary btn-pay" (click)="executePayment()" [disabled]="processing()">
              @if (processing()) {
                <span class="material-symbols-rounded spin">progress_activity</span> Verifying Payment...
              } @else {
                <span class="material-symbols-rounded">verified_user</span> Confirm & Pay ₹{{ bill.totalAmount }}
              }
            </button>
          </div>
        } @else {
          <!-- Payment Success Screen -->
          <div class="success-screen">
            <div class="success-icon-wrap">
              <span class="material-symbols-rounded success-icon">check_circle</span>
            </div>
            <h2>Payment Successful!</h2>
            <p class="success-desc">
              Your tax payment has been verified by the gateway and credited to Shivane Gram Panchayat account.
            </p>
            
            <div class="receipt-pill">
              <div>
                <div class="pill-label">Receipt Number</div>
                <div class="pill-val font-mono">{{ lastReceipt()?.receiptNumber || 'RCPT-2026-98102' }}</div>
              </div>
              <div>
                <div class="pill-label">Amount Paid</div>
                <div class="pill-val">₹{{ bill.totalAmount }}</div>
              </div>
            </div>

            <div class="success-actions">
              <button class="btn btn-primary" (click)="downloadPdf()">
                <span class="material-symbols-rounded">download</span> Download Official PDF Receipt
              </button>
              <button class="btn btn-secondary" (click)="onComplete()">
                Done
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .payment-card {
      max-width: 520px;
      overflow: hidden;
    }
    .payment-header {
      background: linear-gradient(135deg, #064e3b, #047857);
      color: white;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .shield-icon {
      font-size: 2rem;
      color: #a7f3d0;
    }
    .header-left h3 {
      color: white;
      font-size: 1.15rem;
      margin-bottom: 0.15rem;
    }
    .header-left p {
      font-size: 0.75rem;
      color: #d1fae5;
    }
    .close-btn {
      color: #a7f3d0;
      padding: 0.25rem;
      border-radius: var(--radius-sm);
    }
    .close-btn:hover {
      color: white;
      background: rgba(255,255,255,0.1);
    }

    .bill-summary {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      margin: 1.25rem 1.5rem 1rem 1.5rem;
      padding: 1rem 1.25rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .summary-row .label { color: var(--text-muted); }
    .summary-row .value { font-weight: 600; color: var(--text-main); }
    .font-mono { font-family: monospace; }
    .summary-divider {
      height: 1px;
      background: var(--border);
      margin: 0.75rem 0;
    }
    .total-row {
      margin-bottom: 0;
    }
    .total-row .label { font-weight: 700; color: var(--text-main); }
    .total-row .amount {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--primary);
    }

    .payment-modes {
      padding: 0 1.5rem;
      margin-bottom: 1rem;
    }
    .mode-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 0.5rem;
    }
    .modes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }
    .mode-card {
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.75rem 0.5rem;
      text-align: center;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .mode-card:hover {
      border-color: var(--primary-border);
      background: var(--primary-light);
    }
    .mode-card.selected {
      border-color: var(--primary);
      background: var(--primary-light);
      box-shadow: 0 0 0 2px rgba(4, 120, 87, 0.2);
    }
    .mode-icon {
      color: var(--primary);
      font-size: 1.5rem;
    }
    .mode-name {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .mode-sub {
      font-size: 0.65rem;
      color: var(--text-muted);
    }

    .upi-box, .card-inputs, .netbanking-select {
      margin: 0 1.5rem 1.5rem 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .qr-placeholder {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .qr-svg {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 4px;
      background: white;
    }
    .qr-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .qr-title { font-size: 0.875rem; font-weight: 700; color: var(--text-main); }
    .vpa { font-size: 0.75rem; color: var(--primary); font-family: monospace; font-weight: 600; }
    .timer { font-size: 0.7rem; color: var(--text-muted); }

    .card-inputs .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .mb-2 { margin-bottom: 0.5rem; }

    .payment-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      background: #ffffff;
    }
    .btn-pay {
      flex: 1;
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Success Screen */
    .success-screen {
      padding: 2.5rem 2rem;
      text-align: center;
    }
    .success-icon-wrap {
      width: 72px;
      height: 72px;
      background: var(--success-light);
      color: var(--success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem auto;
    }
    .success-icon { font-size: 3rem; }
    .success-screen h2 {
      font-size: 1.5rem;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .success-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .receipt-pill {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      justify-content: space-around;
      margin-bottom: 2rem;
    }
    .pill-label { font-size: 0.75rem; color: var(--text-muted); }
    .pill-val { font-size: 1rem; font-weight: 700; color: var(--text-main); }
    .success-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
  `]
})
export class PaymentModalComponent {
  @Input({ required: true }) bill!: TaxBill;
  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private apiService = inject(ApiService);

  selectedMode = signal<'ONLINE_UPI' | 'CARD' | 'NET_BANKING'>('ONLINE_UPI');
  processing = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);
  lastReceipt = signal<any>(null);

  executePayment(): void {
    this.processing.set(true);

    // Call payment API
    this.apiService.payTaxBill({
      billId: this.bill.id,
      amount: this.bill.totalAmount,
      paymentMode: this.selectedMode(),
      notes: 'Online Tax Payment Portal'
    }).subscribe({
      next: (res) => {
        this.processing.set(false);
        this.paymentSuccess.set(true);
        this.lastReceipt.set(res.data);
      },
      error: (err) => {
        this.processing.set(false);
        alert('Payment processing failed: ' + (err.error?.message || err.message));
      }
    });
  }

  downloadPdf(): void {
    const rcptNo = this.lastReceipt()?.receiptNumber;
    this.apiService.downloadReceiptPdfByBillId(this.bill.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-${rcptNo || this.bill.billNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        if (rcptNo) {
          this.apiService.downloadReceiptPdfByNumber(rcptNo).subscribe({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Receipt-${rcptNo}.pdf`;
              a.click();
              window.URL.revokeObjectURL(url);
            }
          });
        }
      }
    });
  }

  close(): void {
    if (this.paymentSuccess()) {
      this.completed.emit();
    } else {
      this.cancelled.emit();
    }
  }

  onComplete(): void {
    this.completed.emit();
  }
}
