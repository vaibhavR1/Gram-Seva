import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Panchayat, User, DashboardStats } from '../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container dashboard-container">
      <div class="admin-header card">
        <div>
          <span class="badge badge-primary">Zilla Parishad Administration</span>
          <h1>Super Admin Control Center</h1>
          <p class="subtitle">Platform Governance • User Roles & Permissions • Audit Logs & Security Trails</p>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-grid mt-4">
        <div class="card metric-card">
          <div class="icon-wrap emerald-bg"><span class="material-symbols-rounded">domain</span></div>
          <div>
            <div class="m-label">Active Panchayats</div>
            <div class="m-val">{{ panchayats().length }}</div>
            <div class="m-sub">Shivane Gram Panchayat</div>
          </div>
        </div>

        <div class="card metric-card">
          <div class="icon-wrap blue-bg"><span class="material-symbols-rounded">manage_accounts</span></div>
          <div>
            <div class="m-label">System Users</div>
            <div class="m-val">{{ users().length }} Accounts</div>
            <div class="m-sub">Role-based access enabled</div>
          </div>
        </div>

        <div class="card metric-card">
          <div class="icon-wrap saffron-bg"><span class="material-symbols-rounded">receipt_long</span></div>
          <div>
            <div class="m-label">Total System Revenue</div>
            <div class="m-val text-primary">₹{{ (stats()?.totalCollected || 0) | number }}</div>
            <div class="m-sub">Across registered milkat assessments</div>
          </div>
        </div>
      </div>

      <!-- Sub Navigation -->
      <div class="dash-tabs mt-4">
        <button class="tab-item" [class.active]="activeTab() === 'USERS'" (click)="activeTab.set('USERS')">
          <span class="material-symbols-rounded">group</span> User Accounts ({{ users().length }})
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'AUDIT'" (click)="activeTab.set('AUDIT')">
          <span class="material-symbols-rounded">security</span> Security Audit Logs ({{ auditLogs().length }})
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'PANCHAYATS'" (click)="activeTab.set('PANCHAYATS')">
          <span class="material-symbols-rounded">apartment</span> Panchayat Office Details
        </button>
        <button class="tab-item" [class.active]="activeTab() === 'REPORTS'" (click)="activeTab.set('REPORTS')">
          <span class="material-symbols-rounded">analytics</span> Zilla Parishad & Tax Audit Reports (PDF & Excel)
        </button>
      </div>

      <!-- Tab: Users -->
      @if (activeTab() === 'USERS') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">Platform User Accounts & Permissions</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr>
                    <td class="font-mono">{{ u.id }}</td>
                    <td class="font-bold">{{ u.fullName }}</td>
                    <td class="font-mono">{{ u.username }}</td>
                    <td>{{ u.email }}</td>
                    <td>
                      <span class="badge" [class.badge-primary]="u.role === 'SUPER_ADMIN'" [class.badge-success]="u.role === 'SARPANCH'" [class.badge-info]="u.role === 'WATER_SUPPLIER'" [class.badge-warning]="u.role === 'CITIZEN'">
                        {{ u.role }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" [class.badge-success]="u.active" [class.badge-danger]="!u.active">
                        {{ u.active ? 'ACTIVE' : 'SUSPENDED' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm" [class.btn-danger]="u.active" [class.btn-primary]="!u.active" (click)="toggleUser(u)">
                        {{ u.active ? 'Suspend' : 'Activate' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab: Audit Logs -->
      @if (activeTab() === 'AUDIT') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">Security & Administrative Audit Trail</h3>
            <span class="badge badge-info">Real-Time Event Stream</span>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Performed By</th>
                  <th>IP Address</th>
                  <th>Audit Details</th>
                </tr>
              </thead>
              <tbody>
                @for (log of auditLogs(); track log.id) {
                  <tr>
                    <td class="font-mono text-xs">{{ log.createdAt | date:'short' }}</td>
                    <td><span class="badge badge-primary">{{ log.action }}</span></td>
                    <td class="font-mono">{{ log.entityName }}</td>
                    <td class="font-mono">{{ log.entityId }}</td>
                    <td class="font-bold">{{ log.performedBy?.fullName || 'System' }}</td>
                    <td class="font-mono text-xs">{{ log.ipAddress }}</td>
                    <td class="text-xs">{{ log.details }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Tab: Panchayats -->
      @if (activeTab() === 'PANCHAYATS') {
        <div class="card mt-2">
          <div class="card-header">
            <h3 class="card-title">Gram Panchayat Office Profile</h3>
          </div>
          @for (p of panchayats(); track p.id) {
            <div class="panchayat-details">
              <div class="p-row"><strong>Panchayat Name:</strong> <span>{{ p.name }}</span></div>
              <div class="p-row"><strong>Taluka & District:</strong> <span>{{ p.taluka }}, {{ p.district }}</span></div>
              <div class="p-row"><strong>State:</strong> <span>{{ p.state }} (PIN: {{ p.pinCode }})</span></div>
              <div class="p-row"><strong>Office Address:</strong> <span>{{ p.officeAddress }}</span></div>
              <div class="p-row"><strong>Sarpanch:</strong> <span>{{ p.sarpanchName }}</span></div>
              <div class="p-row"><strong>Population:</strong> <span>{{ p.villagePopulation | number }}</span></div>
              <div class="p-row"><strong>Official Contact:</strong> <span>{{ p.contactEmail }} | {{ p.contactPhone }}</span></div>
            </div>
          }
        </div>
      }

      <!-- Tab: Official Reports & Exports -->
      @if (activeTab() === 'REPORTS') {
        <div class="card mt-2">
          <div class="card-header">
            <div>
              <h3 class="card-title">Zilla Parishad & District Audit Reports Center</h3>
              <p class="text-sm text-muted">Generate certified financial audit spreadsheets, monthly collection registers, and citizen census rosters in Excel (.xlsx/.csv) or PDF.</p>
            </div>
            <span class="badge badge-primary">District Super Admin Export</span>
          </div>

          <div class="reports-grid">
            <!-- Card 1: Monthly Tax Report -->
            <div class="report-box card">
              <div class="report-icon emerald-bg">
                <span class="material-symbols-rounded">calendar_month</span>
              </div>
              <div class="report-details">
                <h4>Monthly Tax Revenue Audit</h4>
                <p>Complete breakdown of Ghar Patti (House Tax) & Pani Patti (Water Tax) collections, recovery metrics, and pending defaults.</p>
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
              <div class="report-icon saffron-bg">
                <span class="material-symbols-rounded">account_balance</span>
              </div>
              <div class="report-details">
                <h4>Annual Financial Year Tax Register</h4>
                <p>District audit ledger for Namuna 8 House Tax, drinking water connections, annual realization rate %, and arrears carried forward.</p>
                <div class="report-filters">
                  <div class="filter-item">
                    <label>Financial Year:</label>
                    <select class="form-control form-control-sm" [(ngModel)]="reportFinYear">
                      <option value="2026-2027">2026-2027 (Current)</option>
                      <option value="2025-2026">2025-2026 (Previous)</option>
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
                <p>Comprehensive resident census register: verified villager population, household addresses, ward breakdown, and utility connections.</p>
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
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2.5rem 1.5rem; }
    .admin-header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: white;
      padding: 2rem 2.5rem;
    }
    .admin-header h1 { color: white; font-size: 1.85rem; margin-top: 0.25rem; margin-bottom: 0.25rem; }
    .subtitle { color: #94a3b8; font-size: 0.875rem; }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 800px) { .metrics-grid { grid-template-columns: 1fr; } }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .emerald-bg { background: var(--primary-light); color: var(--primary); }
    .blue-bg { background: #e0f2fe; color: #0284c7; }
    .saffron-bg { background: var(--saffron-light); color: var(--saffron); }

    .m-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .m-val { font-size: 1.65rem; font-weight: 800; color: var(--text-main); font-family: var(--font-display); }
    .m-sub { font-size: 0.75rem; color: var(--text-muted); }

    .dash-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
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
      transition: var(--transition);
    }
    .tab-item:hover { background: var(--bg-subtle); }
    .tab-item.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-xs { font-size: 0.75rem; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-2 { margin-top: 0.75rem; }

    .panchayat-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }
    .p-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 1.5rem;
    }
    @media (max-width: 900px) { .reports-grid { grid-template-columns: 1fr; } }
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
    .report-details h4 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.35rem; }
    .report-details p { font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem; }
    .report-filters { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .filter-item { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .filter-item .form-control-sm { padding: 0.3rem 0.6rem; font-size: 0.8125rem; border-radius: var(--radius-sm); }
    .report-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: auto; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  users = signal<User[]>([]);
  panchayats = signal<Panchayat[]>([]);
  auditLogs = signal<any[]>([]);
  stats = signal<DashboardStats | null>(null);

  activeTab = signal<'USERS' | 'AUDIT' | 'PANCHAYATS' | 'REPORTS'>('USERS');

  // Reports filters
  reportYear = 2026;
  reportMonth = 10;
  reportFinYear = '2026-2027';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getAdminDashboard().subscribe({ next: r => this.stats.set(r.data) });
    this.apiService.getUsers().subscribe({ next: r => this.users.set(r.data) });
    this.apiService.getPanchayats().subscribe({ next: r => this.panchayats.set(r.data) });
    this.apiService.getAuditLogs().subscribe({ next: r => this.auditLogs.set(r.data) });
  }

  toggleUser(u: User): void {
    this.apiService.toggleUserStatus(u.id).subscribe({
      next: () => this.loadData()
    });
  }

  // Reports Downloads
  downloadMonthlyReport(format: 'pdf' | 'excel'): void {
    const obs = format === 'pdf'
      ? this.apiService.downloadMonthlyReportPdf(this.reportYear, this.reportMonth)
      : this.apiService.downloadMonthlyReportExcel(this.reportYear, this.reportMonth);

    obs.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Monthly_Tax_Audit_${this.reportYear}_${this.reportMonth}.${format === 'pdf' ? 'pdf' : 'csv'}`;
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
        a.download = `Annual_Tax_Register_${this.reportFinYear}.${format === 'pdf' ? 'pdf' : 'csv'}`;
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
