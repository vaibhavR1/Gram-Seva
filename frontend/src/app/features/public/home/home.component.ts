import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Announcement, DashboardStats, TaxBill, Complaint, WaterSupplySchedule } from '../../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-inner">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span> Digital Gram Panchayat Initiative
          </div>
          <h1 class="hero-title">
            Empowering Shivane Village Through <span class="highlight">Digital E-Governance</span>
          </h1>
          <p class="hero-desc">
            Access village services seamlessly from home: pay House Tax (Ghar Patti) and Water Tariff online, track water supply timings, register grievances, and review Gram Sabha resolutions with full transparency.
          </p>
          
          <div class="hero-cta">
            <a routerLink="/citizen/bills" class="btn btn-lg btn-saffron">
              <span class="material-symbols-rounded">receipt_long</span> Pay Tax Online
            </a>
            <a routerLink="/citizen/complaints" class="btn btn-lg btn-outline-light">
              <span class="material-symbols-rounded">report_problem</span> Register Grievance
            </a>
          </div>

          <div class="hero-highlights">
            <div class="highlight-item">
              <span class="material-symbols-rounded">verified</span>
              <span>Instant Digital PDF Receipts</span>
            </div>
            <div class="highlight-item">
              <span class="material-symbols-rounded">schedule</span>
              <span>Real-Time Water Alerts</span>
            </div>
            <div class="highlight-item">
              <span class="material-symbols-rounded">security</span>
              <span>100% Transparent Records</span>
            </div>
          </div>
        </div>

        <div class="hero-card-col">
          <!-- Quick Search & Track Widget -->
          <div class="quick-widget-card card">
            <div class="widget-tabs">
              <button class="tab-btn" [class.active]="activeTab() === 'BILL'" (click)="activeTab.set('BILL')">
                <span class="material-symbols-rounded">search</span> Check Tax Bill
              </button>
              <button class="tab-btn" [class.active]="activeTab() === 'TRACK'" (click)="activeTab.set('TRACK')">
                <span class="material-symbols-rounded">track_changes</span> Track Grievance
              </button>
            </div>

            <!-- Tab 1: Check Tax Bill -->
            @if (activeTab() === 'BILL') {
              <div class="tab-body">
                <p class="tab-intro">Search outstanding dues or verify payments by Bill Number.</p>
                <div class="input-with-button">
                  <input type="text" class="form-control" placeholder="e.g. TB-HT-2026-1001" [(ngModel)]="searchBillNo" />
                  <button class="btn btn-primary" (click)="searchBill()">Search</button>
                </div>
                <div class="hint">Try sample: <code (click)="searchBillNo = 'TB-HT-2026-1001'; searchBill()">TB-HT-2026-1001</code></div>

                @if (searchedBill()) {
                  <div class="result-box">
                    <div class="result-header">
                      <span class="font-bold">{{ searchedBill()?.billNumber }}</span>
                      <span class="badge" [class.badge-paid]="searchedBill()?.status === 'PAID'" [class.badge-pending]="searchedBill()?.status === 'PENDING'">
                        {{ searchedBill()?.status }}
                      </span>
                    </div>
                    <div class="result-details">
                      <div><strong>Owner:</strong> {{ searchedBill()?.citizen?.user?.fullName }}</div>
                      <div><strong>Ward:</strong> {{ searchedBill()?.citizen?.wardNumber }}</div>
                      <div><strong>Type:</strong> {{ searchedBill()?.billType?.replace('_', ' ') }}</div>
                      <div><strong>Amount:</strong> ₹{{ searchedBill()?.totalAmount }}</div>
                    </div>
                    @if (searchedBill()?.status === 'PENDING') {
                      <a routerLink="/login" class="btn btn-sm btn-saffron mt-2 full-width">Sign In to Pay Now</a>
                    }
                  </div>
                }
              </div>
            }

            <!-- Tab 2: Track Grievance -->
            @if (activeTab() === 'TRACK') {
              <div class="tab-body">
                <p class="tab-intro">Track current status and staff assignment of your filed complaint.</p>
                <div class="input-with-button">
                  <input type="text" class="form-control" placeholder="e.g. CMP-2026-101" [(ngModel)]="searchComplaintNo" />
                  <button class="btn btn-primary" (click)="trackComplaint()">Track</button>
                </div>
                <div class="hint">Try sample: <code (click)="searchComplaintNo = 'CMP-2026-101'; trackComplaint()">CMP-2026-101</code></div>

                @if (searchedComplaint()) {
                  <div class="result-box">
                    <div class="result-header">
                      <span class="font-bold">{{ searchedComplaint()?.complaintNumber }}</span>
                      <span class="badge badge-info">{{ searchedComplaint()?.status }}</span>
                    </div>
                    <div class="result-details">
                      <div><strong>Subject:</strong> {{ searchedComplaint()?.title }}</div>
                      <div><strong>Category:</strong> {{ searchedComplaint()?.category?.replace('_', ' ') }}</div>
                      <div><strong>Ward:</strong> {{ searchedComplaint()?.wardNumber }}</div>
                      @if (searchedComplaint()?.assignedStaff) {
                        <div><strong>Assigned To:</strong> {{ searchedComplaint()?.assignedStaff?.fullName }}</div>
                      }
                      @if (searchedComplaint()?.resolutionNotes) {
                        <div class="notes-callout"><strong>Remark:</strong> {{ searchedComplaint()?.resolutionNotes }}</div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Operational Metrics Banner -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon emerald">
              <span class="material-symbols-rounded">group</span>
            </div>
            <div class="stat-value">12,450+</div>
            <div class="stat-label">Village Population Served</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue">
              <span class="material-symbols-rounded">home_work</span>
            </div>
            <div class="stat-value">{{ stats()?.totalProperties || 3 }} Properties</div>
            <div class="stat-label">Digitally Registered Milkat</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan">
              <span class="material-symbols-rounded">water_drop</span>
            </div>
            <div class="stat-value">{{ stats()?.totalWaterConnections || 2 }} Connections</div>
            <div class="stat-label">Metred Water Supply</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon saffron">
              <span class="material-symbols-rounded">account_balance_wallet</span>
            </div>
            <div class="stat-value">₹{{ (stats()?.totalCollected || 1350) | number }}</div>
            <div class="stat-label">Tax Collected This Year</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Overview -->
    <section class="services-section">
      <div class="container">
        <div class="section-title-wrap">
          <span class="section-subtitle">Comprehensive Citizen Services</span>
          <h2 class="section-title">Everything Your Village Needs, In One Portal</h2>
        </div>

        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon-wrap emerald">
              <span class="material-symbols-rounded">receipt_long</span>
            </div>
            <h3>Ghar Tax (House Tax)</h3>
            <p>Annual assessment based on built-up area and property category. Check outstanding dues, download assessment notices, and pay online.</p>
            <a routerLink="/citizen/bills" class="service-link">View House Tax <span class="material-symbols-rounded">arrow_forward</span></a>
          </div>

          <div class="service-card">
            <div class="service-icon-wrap cyan">
              <span class="material-symbols-rounded">water_full</span>
            </div>
            <h3>Water Tax & Supply</h3>
            <p>Household water connection records, monthly tariff tracking, and real-time alerts for morning/evening water supply timings.</p>
            <a routerLink="/water-schedule" class="service-link">Check Timings <span class="material-symbols-rounded">arrow_forward</span></a>
          </div>

          <div class="service-card">
            <div class="service-icon-wrap saffron">
              <span class="material-symbols-rounded">assignment_late</span>
            </div>
            <h3>Grievance Redressal (Takrar)</h3>
            <p>File complaints regarding street lights, drainage, water supply, or road repairs with photos. Track resolution progress transparently.</p>
            <a routerLink="/citizen/complaints" class="service-link">File Complaint <span class="material-symbols-rounded">arrow_forward</span></a>
          </div>

          <div class="service-card">
            <div class="service-icon-wrap purple">
              <span class="material-symbols-rounded">campaign</span>
            </div>
            <h3>Gram Sabha & Notices</h3>
            <p>Public publication of Gram Sabha meetings, health camps, beneficiary schemes like PM Awas Yojana, and urgent maintenance alerts.</p>
            <a routerLink="/notices" class="service-link">Read Notices <span class="material-symbols-rounded">arrow_forward</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- Urgent Notices & Water Schedule Snippet -->
    <section class="notices-snippet-section">
      <div class="container grid-2-col">
        <!-- Notices -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="material-symbols-rounded" style="color: #ea580c">campaign</span> Latest Announcements
            </h3>
            <a routerLink="/notices" class="btn btn-sm btn-secondary">View All</a>
          </div>
          <div class="notices-list">
            @for (notice of announcements().slice(0, 3); track notice.id) {
              <div class="notice-item" [class.urgent]="notice.priority === 'URGENT'">
                <div class="notice-meta">
                  <span class="badge" [class.badge-danger]="notice.priority === 'URGENT'" [class.badge-info]="notice.priority !== 'URGENT'">
                    {{ notice.category.replace('_', ' ') }}
                  </span>
                  <span class="notice-date">{{ notice.publishDate }}</span>
                </div>
                <h4 class="notice-heading">{{ notice.title }}</h4>
                <p class="notice-snippet">{{ notice.content }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Water Schedule Preview -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="material-symbols-rounded" style="color: #0284c7">water_drop</span> Today's Water Supply Schedule
            </h3>
            <a routerLink="/water-schedule" class="btn btn-sm btn-secondary">Full Schedule</a>
          </div>
          <div class="schedules-list">
            @for (sched of waterSchedules(); track sched.id) {
              <div class="schedule-item">
                <div class="schedule-top">
                  <span class="ward-tag">{{ sched.wardNumber }}</span>
                  <span class="area-name">{{ sched.areaName }}</span>
                  <span class="badge" [class.badge-regular]="sched.status === 'REGULAR'" [class.badge-interrupted]="sched.status === 'MAINTENANCE'">
                    {{ sched.status }}
                  </span>
                </div>
                <div class="schedule-times">
                  <div><strong>Morning:</strong> {{ sched.morningTimeRange || 'N/A' }}</div>
                  <div><strong>Evening:</strong> {{ sched.eveningTimeRange || 'N/A' }}</div>
                </div>
                @if (sched.noticeMessage) {
                  <div class="schedule-notice">{{ sched.noticeMessage }}</div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
      color: white;
      padding: 4.5rem 0 3.5rem 0;
      position: relative;
      overflow: hidden;
    }
    .hero-inner {
      display: grid;
      grid-template-columns: 1.25fr 0.95fr;
      gap: 3rem;
      align-items: center;
    }
    @media (max-width: 960px) {
      .hero-inner { grid-template-columns: 1fr; }
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
      color: #a7f3d0;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }
    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: white;
      margin-bottom: 1.25rem;
      line-height: 1.15;
    }
    .highlight {
      color: #fed7aa;
      text-decoration: underline;
      text-decoration-color: #f97316;
    }
    .hero-desc {
      font-size: 1.05rem;
      color: #d1fae5;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .hero-cta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }
    .btn-outline-light {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: white;
    }
    .btn-outline-light:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
    }
    .hero-highlights {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      font-size: 0.8125rem;
      color: #a7f3d0;
    }
    .highlight-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .highlight-item .material-symbols-rounded {
      font-size: 1.15rem;
      color: #34d399;
    }

    /* Quick Widget Card */
    .quick-widget-card {
      background: #ffffff;
      color: var(--text-body);
      padding: 0;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
    }
    .widget-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid var(--border);
      background: var(--bg-subtle);
    }
    .tab-btn {
      padding: 0.875rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-muted);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: var(--transition);
    }
    .tab-btn.active {
      background: #ffffff;
      color: var(--primary);
      border-bottom: 2px solid var(--primary);
    }
    .tab-body {
      padding: 1.5rem;
    }
    .tab-intro {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .input-with-button {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .hint code {
      background: var(--bg-subtle);
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      cursor: pointer;
      color: var(--primary);
      font-weight: 600;
    }
    .result-box {
      margin-top: 1.25rem;
      padding: 1rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      animation: fadeIn 0.2s ease-out;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .result-details {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.8125rem;
    }
    .font-bold { font-weight: 700; }
    .full-width { width: 100%; }
    .mt-2 { margin-top: 0.75rem; }
    .notes-callout {
      background: #fef3c7;
      border-left: 3px solid #f59e0b;
      padding: 0.4rem 0.6rem;
      border-radius: 0 4px 4px 0;
      margin-top: 0.35rem;
      font-size: 0.75rem;
    }

    /* Stats Section */
    .stats-section {
      margin-top: -2.5rem;
      position: relative;
      z-index: 10;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 500px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
    .stat-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: var(--transition);
    }
    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    .stat-icon.emerald { background: var(--primary-light); color: var(--primary); }
    .stat-icon.blue { background: #e0f2fe; color: #0284c7; }
    .stat-icon.cyan { background: #cffafe; color: #0891b2; }
    .stat-icon.saffron { background: var(--saffron-light); color: var(--saffron); }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      font-family: var(--font-display);
      margin-bottom: 0.25rem;
    }
    .stat-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Services Section */
    .services-section {
      padding: 5rem 0 3rem 0;
    }
    .section-title-wrap {
      text-align: center;
      margin-bottom: 3rem;
    }
    .section-subtitle {
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.075em;
      color: var(--primary);
    }
    .section-title {
      font-size: 2rem;
      color: var(--text-main);
      margin-top: 0.25rem;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 960px) {
      .services-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .services-grid { grid-template-columns: 1fr; }
    }
    .service-card {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
    }
    .service-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
      border-color: var(--primary-border);
    }
    .service-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .service-icon-wrap.emerald { background: var(--primary-light); color: var(--primary); }
    .service-icon-wrap.cyan { background: #cffafe; color: #0891b2; }
    .service-icon-wrap.saffron { background: var(--saffron-light); color: var(--saffron); }
    .service-icon-wrap.purple { background: #f3e8ff; color: #9333ea; }
    .service-card h3 {
      font-size: 1.15rem;
      margin-bottom: 0.65rem;
    }
    .service-card p {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 1.25rem;
      flex-grow: 1;
    }
    .service-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--primary);
    }
    .service-link:hover { color: var(--primary-hover); }

    /* Notices & Water Section */
    .notices-snippet-section {
      padding: 2rem 0 4rem 0;
    }
    .grid-2-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 800px) {
      .grid-2-col { grid-template-columns: 1fr; }
    }
    .notice-item {
      padding: 1rem 0;
      border-bottom: 1px solid var(--border);
    }
    .notice-item:last-child { border-bottom: none; }
    .notice-item.urgent {
      border-left: 3px solid #dc2626;
      padding-left: 0.75rem;
    }
    .notice-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }
    .notice-date { font-size: 0.75rem; color: var(--text-muted); }
    .notice-heading { font-size: 0.95rem; margin-bottom: 0.25rem; }
    .notice-snippet {
      font-size: 0.8125rem;
      color: var(--text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .schedule-item {
      padding: 0.875rem 0;
      border-bottom: 1px solid var(--border);
    }
    .schedule-item:last-child { border-bottom: none; }
    .schedule-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }
    .ward-tag {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
    }
    .area-name { font-weight: 600; font-size: 0.875rem; flex-grow: 1; }
    .schedule-times {
      display: flex;
      gap: 1.5rem;
      font-size: 0.8125rem;
      color: var(--text-body);
    }
    .schedule-notice {
      margin-top: 0.35rem;
      font-size: 0.75rem;
      color: #b91c1c;
      background: #fef2f2;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
  `]
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  authService = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  announcements = signal<Announcement[]>([]);
  waterSchedules = signal<WaterSupplySchedule[]>([]);

  activeTab = signal<'BILL' | 'TRACK'>('BILL');
  searchBillNo = 'TB-HT-2026-1001';
  searchComplaintNo = 'CMP-2026-101';

  searchedBill = signal<TaxBill | null>(null);
  searchedComplaint = signal<Complaint | null>(null);

  ngOnInit(): void {
    this.apiService.getPublicStats().subscribe({
      next: (res) => this.stats.set(res.data)
    });
    this.apiService.getPublicAnnouncements().subscribe({
      next: (res) => this.announcements.set(res.data)
    });
    this.apiService.getWaterSchedules().subscribe({
      next: (res) => this.waterSchedules.set(res.data)
    });
  }

  searchBill(): void {
    if (!this.searchBillNo) return;
    this.apiService.searchBill(this.searchBillNo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.searchedBill.set(res.data);
        } else {
          alert('No bill record found for: ' + this.searchBillNo);
        }
      }
    });
  }

  trackComplaint(): void {
    if (!this.searchComplaintNo) return;
    this.apiService.trackComplaint(this.searchComplaintNo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.searchedComplaint.set(res.data);
        } else {
          alert('No grievance record found for: ' + this.searchComplaintNo);
        }
      }
    });
  }
}
