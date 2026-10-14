import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WaterConnection, WaterSupplySchedule, Complaint } from '../../core/models/models';

@Component({
  selector: 'app-water-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container dashboard-container">
      <div class="water-header card">
        <div class="header-content">
          <span class="badge badge-info">Pani Puravatha Operations Desk</span>
          <h1>Water Supply & Pipeline Management</h1>
          <p class="subtitle">Operator: Ganesh Pandurang Shinde • Shivane Gram Panchayat Reservoir Station</p>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-grid mt-4">
        <div class="card metric-card">
          <div class="icon-wrap cyan-bg"><span class="material-symbols-rounded">water_drop</span></div>
          <div>
            <div class="m-label">Water Connections</div>
            <div class="m-val">{{ connections().length }} Metered</div>
            <div class="m-sub">100% active piped supply</div>
          </div>
        </div>

        <div class="card metric-card">
          <div class="icon-wrap blue-bg"><span class="material-symbols-rounded">schedule</span></div>
          <div>
            <div class="m-label">Active Supply Zones</div>
            <div class="m-val">{{ schedules().length }} Wards</div>
            <div class="m-sub">ESR Reservoir Capacity: 5.5 Lakh Ltrs</div>
          </div>
        </div>

        <div class="card metric-card">
          <div class="icon-wrap warning-bg"><span class="material-symbols-rounded">plumbing</span></div>
          <div>
            <div class="m-label">Water Leakage / Complaints</div>
            <div class="m-val">{{ complaints().length }} Reported</div>
            <div class="m-sub">{{ activeComplaintsCount() }} Pending action</div>
          </div>
        </div>
      </div>

      <!-- Ward Water Release Schedule Manager -->
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">
            <span class="material-symbols-rounded" style="color: #0284c7">alarm</span> Ward-Wise Supply Schedule & Interruption Broadcast
          </h3>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Ward No</th>
                <th>Area & Landmark</th>
                <th>Morning Release</th>
                <th>Evening Release</th>
                <th>Current Status</th>
                <th>Advisory / Notice</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (s of schedules(); track s.id) {
                <tr>
                  <td class="font-bold">{{ s.wardNumber }}</td>
                  <td>{{ s.areaName }}</td>
                  <td>{{ s.morningTimeRange }}</td>
                  <td>{{ s.eveningTimeRange }}</td>
                  <td>
                    <span class="badge" [class.badge-regular]="s.status === 'REGULAR'" [class.badge-interrupted]="s.status === 'MAINTENANCE' || s.status === 'INTERRUPTED'">
                      {{ s.status }}
                    </span>
                  </td>
                  <td class="text-xs text-muted">{{ s.noticeMessage || 'Normal distribution' }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary" (click)="editSchedule(s)">
                      <span class="material-symbols-rounded">edit</span> Update Status
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Water Leakage & Grievance Resolution -->
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">
            <span class="material-symbols-rounded" style="color: #ea580c">plumbing</span> Water Service Complaints & Leakage Reports
          </h3>
          <span class="badge badge-info">{{ complaints().length }} Complaints</span>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Tracking No</th>
                <th>Subject</th>
                <th>Citizen</th>
                <th>Ward</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (c of complaints(); track c.id) {
                <tr>
                  <td class="font-mono font-bold">{{ c.complaintNumber }}</td>
                  <td>
                    <div class="font-bold">{{ c.title }}</div>
                    <div class="text-xs text-muted">{{ c.description }}</div>
                  </td>
                  <td>{{ c.citizen?.user?.fullName }}</td>
                  <td>{{ c.wardNumber }}</td>
                  <td><span class="badge badge-danger" *ngIf="c.priority === 'HIGH' || c.priority === 'URGENT'">{{ c.priority }}</span></td>
                  <td>
                    <span class="badge" [class.badge-resolved]="c.status === 'RESOLVED'" [class.badge-assigned]="c.status === 'ASSIGNED'">
                      {{ c.status }}
                    </span>
                  </td>
                  <td>
                    @if (c.status !== 'RESOLVED') {
                      <button class="btn btn-sm btn-primary" (click)="resolveComplaint(c)">
                        <span class="material-symbols-rounded">check</span> Mark Fixed
                      </button>
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

      <!-- Edit Schedule Modal -->
      @if (selectedSchedule()) {
        <div class="modal-backdrop" (click)="selectedSchedule.set(null)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Update Supply Status: {{ selectedSchedule()?.wardNumber }}</h3>
              <button class="close-btn" (click)="selectedSchedule.set(null)"><span class="material-symbols-rounded">close</span></button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Supply Status</label>
                <select class="form-control" [(ngModel)]="newStatus">
                  <option value="REGULAR">REGULAR (Normal Scheduled Pressure)</option>
                  <option value="DELAYED">DELAYED (Delayed by 1-2 hours)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Pipeline Repairs Ongoing)</option>
                  <option value="INTERRUPTED">INTERRUPTED (Suspended for Today)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Public Broadcast Notice</label>
                <textarea class="form-control" rows="3" [(ngModel)]="newNotice" placeholder="e.g. Pipeline replacement near Shivaji Chowk. Supply delayed until 08:00 AM."></textarea>
              </div>

              <div class="modal-actions">
                <button class="btn btn-secondary" (click)="selectedSchedule.set(null)">Cancel</button>
                <button class="btn btn-primary" (click)="saveSchedule()">Broadcast & Update</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 2.5rem 1.5rem; }
    .water-header {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: white;
      padding: 2rem 2.5rem;
    }
    .water-header h1 { color: white; font-size: 1.85rem; margin-top: 0.25rem; margin-bottom: 0.25rem; }
    .subtitle { color: #bae6fd; font-size: 0.875rem; }

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
    .cyan-bg { background: #cffafe; color: #0891b2; }
    .blue-bg { background: #e0f2fe; color: #0284c7; }
    .warning-bg { background: var(--saffron-light); color: var(--saffron); }

    .m-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .m-val { font-size: 1.65rem; font-weight: 800; color: var(--text-main); font-family: var(--font-display); }
    .m-sub { font-size: 0.75rem; color: var(--text-muted); }

    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .text-xs { font-size: 0.75rem; }
    .text-muted { color: var(--text-muted); }
    .mt-4 { margin-top: 1.5rem; }

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
  `]
})
export class WaterDashboardComponent implements OnInit {
  private apiService = inject(ApiService);

  schedules = signal<WaterSupplySchedule[]>([]);
  connections = signal<WaterConnection[]>([]);
  complaints = signal<Complaint[]>([]);

  selectedSchedule = signal<WaterSupplySchedule | null>(null);
  newStatus = 'REGULAR';
  newNotice = '';

  activeComplaintsCount(): number {
    return this.complaints().filter(c => c.status !== 'RESOLVED').length;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getWaterSchedules().subscribe({ next: r => this.schedules.set(r.data) });
    this.apiService.getWaterConnections().subscribe({ next: r => this.connections.set(r.data) });
    this.apiService.getWaterComplaints().subscribe({ next: r => this.complaints.set(r.data) });
  }

  editSchedule(s: WaterSupplySchedule): void {
    this.selectedSchedule.set(s);
    this.newStatus = s.status;
    this.newNotice = s.noticeMessage || '';
  }

  saveSchedule(): void {
    const s = this.selectedSchedule();
    if (!s) return;
    this.apiService.updateWaterSchedule(s.id, this.newStatus, this.newNotice).subscribe({
      next: () => {
        this.selectedSchedule.set(null);
        this.loadData();
      }
    });
  }

  resolveComplaint(c: Complaint): void {
    const notes = prompt('Enter resolution remarks for ' + c.complaintNumber + ':', 'Repaired water distribution pipeline.');
    if (notes !== null) {
      this.apiService.resolveWaterComplaint(c.id, notes).subscribe({
        next: () => this.loadData()
      });
    }
  }
}
