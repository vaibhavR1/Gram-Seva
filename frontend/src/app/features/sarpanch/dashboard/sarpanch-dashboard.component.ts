import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardStats, TaxBill, Complaint, Announcement, Citizen, Property } from '../../../core/models/models';

@Component({
  selector: 'app-sarpanch-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container dashboard-container">
      <!-- Executive Header -->
      <div class="executive-header card">
        <div class="ex-left">
          <span class="badge badge-primary">Panchayat Administration Console</span>
          <h1>Gram Panchayat Executive Dashboard</h1>
          <p class="subtitle">Sarpanch & Village Development Officer Administration Desk • Shivane</p>
        </div>
        <div class="ex-actions">
          <button class="btn btn-saffron" (click)="showBillModal.set(true)">
            <span class="material-symbols-rounded">post_add</span> Generate Tax Bill
          </button>
          <button class="btn btn-primary" (click)="showNoticeModal.set(true)">
            <span class="material-symbols-rounded">campaign</span> Publish Notice
          </button>
        </div>
      </div>

      <!-- Financial & Civic Metrics Cards -->
      <div class="metrics-grid mt-4">
        <div class="metric-card card">
          <div class="metric-icon emerald-bg"><span class="material-symbols-rounded">currency_rupee</span></div>
          <div>
            <div class="m-label">Total Tax Collected</div>
            <div class="m-val text-primary">₹{{ (stats()?.totalCollected || 0) | number }}</div>
            <div class="m-sub">Total Demand: ₹{{ (stats()?.totalDemand || 0) | number }}</div>
          </div>
        </div>

        <div class="metric-card card">
          <div class="metric-icon warning-bg"><span class="material-symbols-rounded">pending_actions</span></div>
          <div>
            <div class="m-label">Outstanding Dues</div>
            <div class="m-val text-warning">₹{{ (stats()?.totalOutstanding || 0) | number }}</div>
            <div class="m-sub">{{ stats()?.pendingBills || 0 }} pending bills</div>
          </div>
        </div>

        <div class="metric-card card">
          <div class="metric-icon blue-bg"><span class="material-symbols-rounded">people</span></div>
          <div>
            <div class="m-label">Registered Citizens</div>
            <div class="m-val">{{ stats()?.totalCitizens || citizens().length }}</div>
            <div class="m-sub">{{ properties().length }} registered properties</div>
          </div>
        </div>

        <div class="metric-card card">
          <div class="metric-icon cyan-bg"><span class="material-symbols-rounded">support_agent</span></div>
          <div>
            <div class="m-label">Grievance Redressal</div>
            <div class="m-val">{{ stats()?.resolvedComplaints || 0 }} / {{ stats()?.totalComplaints || 0 }}</div>
            <div class="m-sub">{{ stats()?.activeComplaints || 0 }} active complaints</div>
          </div>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="dash-tabs mt-4">
        <button class="tab-item" [class.active]="activeTab() === 'BILLS'" (click)="activeTab.set('BILLS')">
          <span class="material-symbols-rounded">receipt_long</span> Tax Bills & Dues ({{ bills().length }})
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'COMPLAINTS'" (click)="activeTab.set('COMPLAINTS')">
          <span class="material-symbols-rounded">report_problem</span> Grievances Desk ({{ complaints().length }})
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'NOTICES'" (click)="activeTab.set('NOTICES')">
          <span class="material-symbols-rounded">campaign</span> Announcements ({{ announcements().length }})
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'CITIZENS'" (click)="activeTab.set('CITIZENS')">
          <span class="material-symbols-rounded">group</span> Citizen Register ({{ citizens().length }})
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'PROPERTIES'" (click)="activeTab.set('PROPERTIES')">
          <span class="material-symbols-rounded">home</span> Properties Master ({{ properties().length }})
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'REPORTS'" (click)="activeTab.set('REPORTS')">
          <span class="material-symbols-rounded">analytics</span> Official Reports (PDF / Excel)
        </button>
      </div>

      <!-- Tab Content 1: Tax Bills -->
      @if (activeTab() === 'BILLS') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">House Tax & Water Tariff Ledger</h3>
            <button class="btn btn-sm btn-primary" (click)="showBillModal.set(true)">
              <span class="material-symbols-rounded">add</span> Issue New Assessment
            </button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Type</th>
                  <th>Citizen / Owner</th>
                  <th>Property / Ward</th>
                  <th>Due Date</th>
                  <th>Demand</th>
                  <th>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (bill of bills(); track bill.id) {
                  <tr>
                    <td class="font-mono font-bold">{{ bill.billNumber }}</td>
                    <td>{{ bill.billType.replace('_', ' ') }}</td>
                    <td>{{ bill.citizen?.user?.fullName }}</td>
                    <td>{{ bill.property?.propertyNumber || bill.waterConnection?.connectionNumber }} ({{ bill.citizen?.wardNumber }})</td>
                    <td>{{ bill.dueDate }}</td>
                    <td class="font-bold">₹{{ bill.totalAmount }}</td>
                    <td class="text-primary font-bold">₹{{ bill.paidAmount }}</td>
                    <td>
                      <span class="badge" [class.badge-paid]="bill.status === 'PAID'" [class.badge-pending]="bill.status === 'PENDING'">
                        {{ bill.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab Content 2: Complaints Desk -->
      @if (activeTab() === 'COMPLAINTS') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">Village Grievance Management Desk</h3>
            <span class="badge badge-info">{{ stats()?.activeComplaints || 0 }} Awaiting Resolution</span>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Tracking No</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Citizen</th>
                  <th>Ward</th>
                  <th>Priority</th>
                  <th>Assigned Staff</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (c of complaints(); track c.id) {
                  <tr>
                    <td class="font-mono font-bold">{{ c.complaintNumber }}</td>
                    <td>{{ c.category.replace('_', ' ') }}</td>
                    <td>
                      <div class="font-bold">{{ c.title }}</div>
                      <div class="text-xs text-muted">{{ c.description }}</div>
                    </td>
                    <td>{{ c.citizen?.user?.fullName }}</td>
                    <td>{{ c.wardNumber }}</td>
                    <td><span class="badge badge-danger" *ngIf="c.priority === 'HIGH' || c.priority === 'URGENT'">{{ c.priority }}</span></td>
                    <td>
                      @if (c.assignedStaff) {
                        <span class="staff-tag">{{ c.assignedStaff.fullName }}</span>
                      } @else {
                        <span class="text-muted text-xs">Unassigned</span>
                      }
                    </td>
                    <td>
                      <span class="badge" [class.badge-resolved]="c.status === 'RESOLVED'" [class.badge-assigned]="c.status === 'ASSIGNED'" [class.badge-submitted]="c.status === 'SUBMITTED'">
                        {{ c.status }}
                      </span>
                    </td>
                    <td>
                      @if (c.status !== 'RESOLVED') {
                        <div class="action-buttons">
                          <button class="btn btn-sm btn-secondary" (click)="openAssign(c)" title="Assign Staff">
                            Assign
                          </button>
                          <button class="btn btn-sm btn-primary" (click)="openResolve(c)" title="Resolve">
                            Resolve
                          </button>
                        </div>
                      } @else {
                        <span class="text-xs text-primary font-bold">Resolved</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab Content 3: Announcements -->
      @if (activeTab() === 'NOTICES') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">Public Notices & Gram Sabha Updates</h3>
            <button class="btn btn-sm btn-primary" (click)="showNoticeModal.set(true)">
              <span class="material-symbols-rounded">add</span> Publish Notice
            </button>
          </div>
          <div class="notices-table">
            <table class="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Publish Date</th>
                  <th>Expiry Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (a of announcements(); track a.id) {
                  <tr>
                    <td class="font-bold">{{ a.title }}</td>
                    <td><span class="badge badge-info">{{ a.category.replace('_', ' ') }}</span></td>
                    <td><span class="badge badge-danger" *ngIf="a.priority === 'URGENT'">{{ a.priority }}</span></td>
                    <td>{{ a.publishDate }}</td>
                    <td>{{ a.expiryDate || 'N/A' }}</td>
                    <td>
                      <button class="btn btn-sm btn-danger" (click)="deleteNotice(a.id)">
                        <span class="material-symbols-rounded">delete</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab Content 4: Citizens -->
      @if (activeTab() === 'CITIZENS') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">Villager Citizen Register</h3>
            <span class="badge badge-primary">{{ citizens().length }} Registered</span>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Ward Number</th>
                <th>House No</th>
                <th>Masked Aadhaar</th>
                <th>Ration Card</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              @for (cit of citizens(); track cit.id) {
                <tr>
                  <td class="font-mono">{{ cit.id }}</td>
                  <td class="font-bold">{{ cit.user?.fullName }}</td>
                  <td>{{ cit.wardNumber }}</td>
                  <td>{{ cit.houseNumber }}</td>
                  <td class="font-mono">{{ cit.aadharMasked }}</td>
                  <td class="font-mono">{{ cit.rationCardNumber }}</td>
                  <td>{{ cit.user?.phone || cit.user?.email }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Tab Content 5: Properties -->
      @if (activeTab() === 'PROPERTIES') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">Village Properties Master (Milkat Namuna 8)</h3>
            <span class="badge badge-primary">{{ properties().length }} Properties</span>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Owner Name</th>
                <th>Type</th>
                <th>Ward</th>
                <th>Built-Up Area</th>
                <th>Annual Assessment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (p of properties(); track p.id) {
                <tr>
                  <td class="font-mono font-bold">{{ p.propertyNumber }}</td>
                  <td>{{ p.owner?.user?.fullName }}</td>
                  <td>{{ p.propertyType }}</td>
                  <td>{{ p.wardNumber }}</td>
                  <td>{{ p.constructionAreaSqFt }} sq.ft</td>
                  <td class="font-bold">₹{{ p.annualTaxAmount }}</td>
                  <td><span class="badge badge-success">{{ p.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Tab Content 6: Official Reports & Registers Download Center -->
      @if (activeTab() === 'REPORTS') {
        <div class="card mt-2">
          <div class="card-header">
            <div>
              <h3 class="card-title">Official Gram Panchayat Registers & Reports Desk</h3>
              <p class="text-sm text-muted">Download certified Monthly/Yearly House & Water Tax collection registers and Village Citizen Census in Excel (.xlsx/.csv) or PDF format.</p>
            </div>
            <span class="badge badge-paid">Official Digital Exports</span>
          </div>

          <div class="reports-grid">
            <!-- Card 1: Monthly Tax Report -->
            <div class="report-box card">
              <div class="report-icon emerald-bg">
                <span class="material-symbols-rounded">calendar_month</span>
              </div>
              <div class="report-details">
                <h4>Monthly Tax Collection Report</h4>
                <p>Itemized House Tax (Ghar Patti) & Water Tax (Pani Patti) collections, monthly demand vs. recovery, surcharge, and pending arrears.</p>
                <div class="report-filters">
                  <div class="filter-item">
                    <label>Year:</label>
                    <select class="form-control form-control-sm" [(ngModel)]="reportYear">
                      <option [value]="2026">2026</option>
                      <option [value]="2025">2025</option>
                    </select>
                  </div>
                  <div class="filter-item">
                    <label>Month:</label>
                    <select class="form-control form-control-sm" [(ngModel)]="reportMonth">
                      <option [value]="10">October</option>
                      <option [value]="9">September</option>
                      <option [value]="8">August</option>
                      <option [value]="7">July</option>
                      <option [value]="6">June</option>
                    </select>
                  </div>
                </div>
                <div class="report-actions">
                  <button class="btn btn-sm btn-primary" (click)="downloadMonthlyReport('pdf')">
                    <span class="material-symbols-rounded">picture_as_pdf</span> Download PDF
                  </button>
                  <button class="btn btn-sm btn-outline-primary" (click)="downloadMonthlyReport('excel')">
                    <span class="material-symbols-rounded">table_view</span> Download Excel (.csv/.xlsx)
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 2: Yearly Tax Report -->
            <div class="report-box card">
              <div class="report-icon warning-bg">
                <span class="material-symbols-rounded">account_balance</span>
              </div>
              <div class="report-details">
                <h4>Annual Tax Assessment & Audit Register</h4>
                <p>Full Financial Year audit ledger with Namuna 8 House Tax assessments, potable water connections, recovery rate %, and balances.</p>
                <div class="report-filters">
                  <div class="filter-item">
                    <label>Financial Year:</label>
                    <select class="form-control form-control-sm" [(ngModel)]="reportFinYear">
                      <option value="2026-2027">2026-2027 (Current FY)</option>
                      <option value="2025-2026">2025-2026 (Previous FY)</option>
                    </select>
                  </div>
                </div>
                <div class="report-actions">
                  <button class="btn btn-sm btn-primary" (click)="downloadYearlyReport('pdf')">
                    <span class="material-symbols-rounded">picture_as_pdf</span> Download PDF
                  </button>
                  <button class="btn btn-sm btn-outline-primary" (click)="downloadYearlyReport('excel')">
                    <span class="material-symbols-rounded">table_view</span> Download Excel (.csv/.xlsx)
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 3: Citizen Census & Roster Report -->
            <div class="report-box card">
              <div class="report-icon blue-bg">
                <span class="material-symbols-rounded">groups</span>
              </div>
              <div class="report-details">
                <h4>Village Citizens Census & Demographics</h4>
                <p>Complete resident census register: villager population, household numbers, ward distribution, linked properties, and tap connections.</p>
                <div class="census-stats-badge">
                  <span>Registered Villagers: <strong>{{ citizens().length }}</strong></span> • 
                  <span>Properties: <strong>{{ properties().length }}</strong></span>
                </div>
                <div class="report-actions mt-2">
                  <button class="btn btn-sm btn-primary" (click)="downloadCitizensReport('pdf')">
                    <span class="material-symbols-rounded">picture_as_pdf</span> Download PDF
                  </button>
                  <button class="btn btn-sm btn-outline-primary" (click)="downloadCitizensReport('excel')">
                    <span class="material-symbols-rounded">table_view</span> Download Excel (.csv/.xlsx)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal: Generate Tax Bill -->
      @if (showBillModal()) {
        <div class="modal-backdrop" (click)="showBillModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Generate New Tax Assessment Bill</h3>
              <button class="close-btn" (click)="showBillModal.set(false)"><span class="material-symbols-rounded">close</span></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Tax Assessment Type</label>
                <select class="form-control" [(ngModel)]="newBillType">
                  <option value="HOUSE_TAX">🏡 Ghar Tax (House Property Assessment)</option>
                  <option value="WATER_TAX">💧 Pani Tax (Water Supply Tariff)</option>
                </select>
              </div>

              @if (newBillType === 'HOUSE_TAX') {
                <div class="form-group">
                  <label class="form-label">Select Registered Property</label>
                  <select class="form-control" [(ngModel)]="selectedPropId">
                    @for (p of properties(); track p.id) {
                      <option [value]="p.id">{{ p.propertyNumber }} — {{ p.owner?.user?.fullName }} (₹{{ p.annualTaxAmount }})</option>
                    }
                  </select>
                </div>
              }

              <div class="form-group">
                <label class="form-label">Financial Year</label>
                <input type="text" class="form-control" [(ngModel)]="newBillYear" placeholder="2026-2027" />
              </div>

              <div class="modal-actions">
                <button class="btn btn-secondary" (click)="showBillModal.set(false)">Cancel</button>
                <button class="btn btn-primary" (click)="generateBill()">Generate & Issue Bill</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal: Publish Notice -->
      @if (showNoticeModal()) {
        <div class="modal-backdrop" (click)="showNoticeModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Publish Public Announcement</h3>
              <button class="close-btn" (click)="showNoticeModal.set(false)"><span class="material-symbols-rounded">close</span></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-control" [(ngModel)]="noticeCat">
                  <option value="GRAM_SABHA">🏛️ Gram Sabha Meeting</option>
                  <option value="WATER_SUPPLY">💧 Water Supply Advisory</option>
                  <option value="HEALTH_CAMP">🩺 Health / Medical Camp</option>
                  <option value="GOV_SCHEME">📜 Government Beneficiary Scheme</option>
                  <option value="GENERAL_NOTICE">📢 General Village Notice</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Notice Title</label>
                <input type="text" class="form-control" [(ngModel)]="noticeTitle" placeholder="e.g. Special Gram Sabha on 26th March" />
              </div>

              <div class="form-group">
                <label class="form-label">Notice Content</label>
                <textarea class="form-control" rows="4" [(ngModel)]="noticeContent" placeholder="Official announcement text..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-control" [(ngModel)]="noticePriority">
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent Alert</option>
                </select>
              </div>

              <div class="modal-actions">
                <button class="btn btn-secondary" (click)="showNoticeModal.set(false)">Cancel</button>
                <button class="btn btn-primary" (click)="publishNotice()">Publish to Portal</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal: Assign Complaint -->
      @if (complaintToAssign()) {
        <div class="modal-backdrop" (click)="complaintToAssign.set(null)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Assign Complaint Staff</h3>
              <button class="close-btn" (click)="complaintToAssign.set(null)"><span class="material-symbols-rounded">close</span></button>
            </div>
            <div class="modal-body">
              <p>Assign <strong>{{ complaintToAssign()?.complaintNumber }}</strong>: {{ complaintToAssign()?.title }}</p>
              <div class="form-group mt-2">
                <label class="form-label">Select Staff Member</label>
                <select class="form-control" [(ngModel)]="selectedStaffId">
                  <option [value]="3">Ganesh Shinde (Water Supply Staff)</option>
                  <option [value]="2">Surekha Patil (Sarpanch Admin)</option>
                </select>
              </div>
              <div class="modal-actions">
                <button class="btn btn-secondary" (click)="complaintToAssign.set(null)">Cancel</button>
                <button class="btn btn-primary" (click)="assignStaff()">Confirm Assignment</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Modal: Resolve Complaint -->
      @if (complaintToResolve()) {
        <div class="modal-backdrop" (click)="complaintToResolve.set(null)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Mark Complaint as Resolved</h3>
              <button class="close-btn" (click)="complaintToResolve.set(null)"><span class="material-symbols-rounded">close</span></button>
            </div>
            <div class="modal-body">
              <p>Resolving <strong>{{ complaintToResolve()?.complaintNumber }}</strong>: {{ complaintToResolve()?.title }}</p>
              <div class="form-group mt-2">
                <label class="form-label">Resolution Remarks (Visible to Citizen)</label>
                <textarea class="form-control" rows="3" [(ngModel)]="resolveNotes" placeholder="e.g. Repaired broken pipeline valve at Shivaji Chowk. Full water pressure restored."></textarea>
              </div>
              <div class="modal-actions">
                <button class="btn btn-secondary" (click)="complaintToResolve.set(null)">Cancel</button>
                <button class="btn btn-primary" (click)="confirmResolve()">Mark as Resolved</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2.5rem 1.5rem; }
    .executive-header {
      background: linear-gradient(135deg, #064e3b, #047857);
      color: white;
      padding: 2rem 2.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .ex-left h1 { color: white; font-size: 1.85rem; margin-top: 0.25rem; margin-bottom: 0.25rem; }
    .subtitle { color: #d1fae5; font-size: 0.875rem; }
    .ex-actions { display: flex; gap: 0.75rem; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 990px) { .metrics-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .metrics-grid { grid-template-columns: 1fr; } }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .emerald-bg { background: var(--primary-light); color: var(--primary); }
    .warning-bg { background: var(--saffron-light); color: var(--saffron); }
    .blue-bg { background: #e0f2fe; color: #0284c7; }
    .cyan-bg { background: #cffafe; color: #0891b2; }

    .m-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .m-val { font-size: 1.65rem; font-weight: 800; color: var(--text-main); font-family: var(--font-display); }
    .m-sub { font-size: 0.75rem; color: var(--text-muted); }

    .text-primary { color: var(--primary); }
    .text-warning { color: var(--saffron); }

    .dash-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      overflow-x: auto;
    }
    .tab-item {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.65rem 1.15rem;
      border: 1px solid var(--border);
      background: white;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: var(--transition);
    }
    .tab-item:hover { background: var(--bg-subtle); }
    .tab-item.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: 0 2px 6px rgba(4, 120, 87, 0.25);
    }

    .font-mono { font-family: monospace; font-size: 0.8125rem; }
    .font-bold { font-weight: 700; }
    .text-xs { font-size: 0.75rem; }
    .text-muted { color: var(--text-muted); }
    .staff-tag { background: #e0f2fe; color: #0369a1; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .action-buttons { display: flex; gap: 0.35rem; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-2 { margin-top: 0.75rem; }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-body { padding: 1.5rem; }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 1.5rem;
    }
    @media (max-width: 990px) {
      .reports-grid { grid-template-columns: 1fr; }
    }
    .report-box {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .report-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .report-details h4 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.35rem;
    }
    .report-details p {
      font-size: 0.8125rem;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 1rem;
    }
    .report-filters {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .filter-item .form-control-sm {
      padding: 0.3rem 0.6rem;
      font-size: 0.8125rem;
      border-radius: var(--radius-sm);
    }
    .report-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: auto;
    }
    .census-stats-badge {
      font-size: 0.8125rem;
      color: var(--text-body);
      background: var(--bg-subtle);
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius-sm);
      margin-bottom: 0.75rem;
    }
  `]
})
export class SarpanchDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  bills = signal<TaxBill[]>([]);
  complaints = signal<Complaint[]>([]);
  announcements = signal<Announcement[]>([]);
  citizens = signal<Citizen[]>([]);
  properties = signal<Property[]>([]);

  activeTab = signal<'BILLS' | 'COMPLAINTS' | 'NOTICES' | 'CITIZENS' | 'PROPERTIES' | 'REPORTS'>('BILLS');

  // Reports
  reportYear = 2026;
  reportMonth = 10;
  reportFinYear = '2026-2027';

  // Modals
  showBillModal = signal(false);
  newBillType = 'HOUSE_TAX';
  selectedPropId = 1;
  newBillYear = '2026-2027';

  showNoticeModal = signal(false);
  noticeCat = 'GRAM_SABHA';
  noticeTitle = '';
  noticeContent = '';
  noticePriority = 'NORMAL';

  complaintToAssign = signal<Complaint | null>(null);
  selectedStaffId = 3;

  complaintToResolve = signal<Complaint | null>(null);
  resolveNotes = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getSarpanchDashboard().subscribe({ next: r => this.stats.set(r.data) });
    this.apiService.getAllBills().subscribe({ next: r => this.bills.set(r.data) });
    this.apiService.getAllComplaints().subscribe({ next: r => this.complaints.set(r.data) });
    this.apiService.getAllAnnouncements().subscribe({ next: r => this.announcements.set(r.data) });
    this.apiService.getAllCitizens().subscribe({ next: r => this.citizens.set(r.data) });
    this.apiService.getAllProperties().subscribe({ next: r => {
      this.properties.set(r.data);
      if (r.data.length > 0) this.selectedPropId = r.data[0].id;
    }});
  }

  generateBill(): void {
    if (this.newBillType === 'HOUSE_TAX') {
      this.apiService.generateHouseTaxBill(this.selectedPropId, this.newBillYear).subscribe({
        next: () => {
          this.showBillModal.set(false);
          this.loadData();
          alert('House Tax Bill generated successfully!');
        }
      });
    }
  }

  publishNotice(): void {
    if (!this.noticeTitle || !this.noticeContent) return;
    this.apiService.createAnnouncement({
      title: this.noticeTitle,
      content: this.noticeContent,
      category: this.noticeCat as any,
      priority: this.noticePriority as any,
      active: true
    }).subscribe({
      next: () => {
        this.showNoticeModal.set(false);
        this.noticeTitle = '';
        this.noticeContent = '';
        this.loadData();
      }
    });
  }

  deleteNotice(id: number): void {
    if (confirm('Delete this notice?')) {
      this.apiService.deleteAnnouncement(id).subscribe({
        next: () => this.loadData()
      });
    }
  }

  openAssign(c: Complaint): void {
    this.complaintToAssign.set(c);
  }

  assignStaff(): void {
    const c = this.complaintToAssign();
    if (!c) return;
    this.apiService.assignComplaint(c.id, this.selectedStaffId).subscribe({
      next: () => {
        this.complaintToAssign.set(null);
        this.loadData();
      }
    });
  }

  openResolve(c: Complaint): void {
    this.complaintToResolve.set(c);
    this.resolveNotes = '';
  }

  confirmResolve(): void {
    const c = this.complaintToResolve();
    if (!c) return;
    this.apiService.updateComplaintStatus(c.id, 'RESOLVED', this.resolveNotes).subscribe({
      next: () => {
        this.complaintToResolve.set(null);
        this.loadData();
      }
    });
  }

  // Report Downloads
  downloadMonthlyReport(format: 'pdf' | 'excel'): void {
    const obs = format === 'pdf'
      ? this.apiService.downloadMonthlyReportPdf(this.reportYear, this.reportMonth)
      : this.apiService.downloadMonthlyReportExcel(this.reportYear, this.reportMonth);

    obs.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Monthly_Tax_Report_${this.reportYear}_${this.reportMonth}.${format === 'pdf' ? 'pdf' : 'csv'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to download report: ' + (err.error?.message || err.message))
    });
  }

  downloadYearlyReport(format: 'pdf' | 'excel'): void {
    const obs = format === 'pdf'
      ? this.apiService.downloadYearlyReportPdf(this.reportFinYear)
      : this.apiService.downloadYearlyReportExcel(this.reportFinYear);

    obs.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Annual_Tax_Audit_Report_${this.reportFinYear}.${format === 'pdf' ? 'pdf' : 'csv'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to download yearly report: ' + (err.error?.message || err.message))
    });
  }

  downloadCitizensReport(format: 'pdf' | 'excel'): void {
    const obs = format === 'pdf'
      ? this.apiService.downloadCitizensCensusPdf()
      : this.apiService.downloadCitizensCensusExcel();

    obs.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Citizens_Census_Register_Shivane.${format === 'pdf' ? 'pdf' : 'csv'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert('Failed to download citizen roster: ' + (err.error?.message || err.message))
    });
  }
}
