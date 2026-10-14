import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { WaterSupplySchedule } from '../../../core/models/models';

@Component({
  selector: 'app-water-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container page-container">
      <div class="page-header">
        <div>
          <span class="badge badge-info">Pani Puravatha Monitoring</span>
          <h1 class="page-title">Village Water Supply Timings & Alerts</h1>
          <p class="page-desc">Daily drinking water release timings by ward, service interruption advisories, and emergency tanker contacts.</p>
        </div>
      </div>

      <!-- Quick Alert Banner -->
      <div class="alert-banner">
        <span class="material-symbols-rounded alert-icon">info</span>
        <div>
          <strong>Drinking Water Purification Status:</strong> The Shivane ESR reservoir water was tested today with 100% potable safety parameters (Chlorine level: 0.2 ppm).
        </div>
      </div>

      <!-- Ward Schedules Grid -->
      <div class="schedules-grid">
        @for (item of schedules(); track item.id) {
          <div class="card schedule-card" [class.interrupted]="item.status === 'MAINTENANCE' || item.status === 'INTERRUPTED'">
            <div class="schedule-head">
              <div class="ward-badge">{{ item.wardNumber }}</div>
              <span class="badge" [class.badge-success]="item.status === 'REGULAR'" [class.badge-danger]="item.status !== 'REGULAR'">
                {{ item.status }}
              </span>
            </div>

            <h3 class="area-name">{{ item.areaName }}</h3>
            
            <div class="time-slots">
              <div class="slot-box">
                <span class="slot-label">🌅 Morning Release</span>
                <span class="slot-val">{{ item.morningTimeRange || 'Closed' }}</span>
              </div>
              <div class="slot-box">
                <span class="slot-label">🌇 Evening Release</span>
                <span class="slot-val">{{ item.eveningTimeRange || 'Closed' }}</span>
              </div>
            </div>

            @if (item.noticeMessage) {
              <div class="advisory-box">
                <span class="material-symbols-rounded">warning</span>
                <span>{{ item.noticeMessage }}</span>
              </div>
            }

            <div class="schedule-foot">
              <span>Effective: {{ item.effectiveDate }}</span>
              <span>Updated by: Water Department</span>
            </div>
          </div>
        }
      </div>

      <!-- Emergency Contacts & Tanker Support -->
      <div class="card support-card mt-4">
        <div class="support-content">
          <span class="material-symbols-rounded support-icon">local_shipping</span>
          <div>
            <h3>Need Emergency Drinking Water Tanker?</h3>
            <p>If water supply is interrupted in your area for more than 6 hours, call the Panchayat Water Emergency cell for immediate mobile tanker dispatch.</p>
          </div>
        </div>
        <div class="support-cta">
          <a href="tel:+919822445566" class="btn btn-primary">
            <span class="material-symbols-rounded">call</span> Call Water Supplier (+91 9822 445566)
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 3rem 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2.25rem; margin-top: 0.5rem; margin-bottom: 0.25rem; }
    .page-desc { color: var(--text-muted); font-size: 1rem; }

    .alert-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #1e40af;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .alert-icon { font-size: 1.5rem; color: #2563eb; }

    .schedules-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .schedules-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .schedules-grid { grid-template-columns: 1fr; }
    }

    .schedule-card {
      display: flex;
      flex-direction: column;
      border-top: 4px solid var(--primary);
    }
    .schedule-card.interrupted {
      border-top-color: var(--danger);
    }
    .schedule-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .ward-badge {
      font-size: 0.875rem;
      font-weight: 800;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
    }
    .area-name {
      font-size: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .time-slots {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .slot-box {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .slot-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
    .slot-val { font-size: 0.875rem; font-weight: 700; color: var(--text-main); }

    .advisory-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
      color: #991b1b;
      display: flex;
      gap: 0.4rem;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .advisory-box .material-symbols-rounded { font-size: 1.15rem; flex-shrink: 0; }

    .schedule-foot {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
      margin-top: auto;
    }

    .support-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      background: linear-gradient(135deg, #f0fdf4, #ffffff);
      border: 1px solid #bbf7d0;
    }
    .support-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .support-icon {
      font-size: 3rem;
      color: var(--primary);
    }
    .mt-4 { margin-top: 2rem; }
  `]
})
export class WaterScheduleComponent implements OnInit {
  private apiService = inject(ApiService);
  schedules = signal<WaterSupplySchedule[]>([]);

  ngOnInit(): void {
    this.apiService.getWaterSchedules().subscribe({
      next: res => this.schedules.set(res.data)
    });
  }
}
