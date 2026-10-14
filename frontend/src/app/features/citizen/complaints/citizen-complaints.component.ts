import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Complaint } from '../../../core/models/models';

@Component({
  selector: 'app-citizen-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container page-container">
      <div class="page-header flex-between">
        <div>
          <span class="badge badge-primary">Public Grievance Redressal</span>
          <h1 class="page-title">Grievance & Takrar Portal</h1>
          <p class="page-desc">Register complaints for village civic issues (Water leakage, Street lights, Drainage overflow) and track resolution transparently.</p>
        </div>
        <button class="btn btn-primary" (click)="showNewModal.set(true)">
          <span class="material-symbols-rounded">add_circle</span> File New Grievance
        </button>
      </div>

      <!-- Grievances List -->
      <div class="complaints-grid">
        @for (item of complaints(); track item.id) {
          <div class="card complaint-card" [class.resolved-card]="item.status === 'RESOLVED'">
            <div class="c-header">
              <div class="c-num-wrap">
                <span class="font-mono font-bold">{{ item.complaintNumber }}</span>
                <span class="badge" [class.badge-resolved]="item.status === 'RESOLVED'" [class.badge-assigned]="item.status === 'ASSIGNED'" [class.badge-submitted]="item.status === 'SUBMITTED'">
                  {{ item.status }}
                </span>
              </div>
              <span class="badge badge-danger" *ngIf="item.priority === 'URGENT' || item.priority === 'HIGH'">{{ item.priority }}</span>
            </div>

            <div class="c-body">
              <div class="c-cat-pill">
                <span class="material-symbols-rounded">category</span>
                <span>{{ item.category.replace('_', ' ') }}</span>
              </div>
              <h3 class="c-heading">{{ item.title }}</h3>
              <p class="c-desc">{{ item.description }}</p>
            </div>

            <!-- Resolution Tracker Timeline -->
            <div class="timeline-box">
              <div class="timeline-step" [class.completed]="true">
                <span class="dot"></span>
                <span class="step-text">Submitted</span>
              </div>
              <div class="timeline-step" [class.completed]="item.status === 'ASSIGNED' || item.status === 'IN_PROGRESS' || item.status === 'RESOLVED'">
                <span class="dot"></span>
                <span class="step-text">Assigned</span>
              </div>
              <div class="timeline-step" [class.completed]="item.status === 'IN_PROGRESS' || item.status === 'RESOLVED'">
                <span class="dot"></span>
                <span class="step-text">In Progress</span>
              </div>
              <div class="timeline-step" [class.completed]="item.status === 'RESOLVED'">
                <span class="dot"></span>
                <span class="step-text">Resolved</span>
              </div>
            </div>

            @if (item.assignedStaff) {
              <div class="assigned-box">
                <span class="material-symbols-rounded">engineering</span>
                <span>Assigned Staff: <strong>{{ item.assignedStaff.fullName }}</strong></span>
              </div>
            }

            @if (item.resolutionNotes) {
              <div class="notes-box">
                <span class="material-symbols-rounded">verified</span>
                <div>
                  <strong>Resolution Remark:</strong>
                  <p>{{ item.resolutionNotes }}</p>
                </div>
              </div>
            }

            <div class="c-footer">
              <span>Ward: <strong>{{ item.wardNumber }}</strong></span>
              <span>Submitted: {{ item.submittedAt | date:'mediumDate' }}</span>
            </div>
          </div>
        } @empty {
          <div class="empty-box card">
            <span class="material-symbols-rounded empty-icon">check_circle</span>
            <h3>No Complaints Registered</h3>
            <p>You have not filed any grievances yet. Click "File New Grievance" above if you encounter civic issues.</p>
          </div>
        }
      </div>

      <!-- New Complaint Modal -->
      @if (showNewModal()) {
        <div class="modal-backdrop" (click)="showNewModal.set(false)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>File New Village Grievance</h3>
              <button class="close-btn" (click)="showNewModal.set(false)">
                <span class="material-symbols-rounded">close</span>
              </button>
            </div>

            <form (ngSubmit)="submitGrievance()" class="modal-body">
              <div class="form-group">
                <label class="form-label">Grievance Category</label>
                <select class="form-control" [(ngModel)]="newCategory" name="category">
                  <option value="WATER_SUPPLY">💧 Water Supply / Leakage / Low Pressure</option>
                  <option value="STREET_LIGHT">💡 Street Light Breakdown / Sparking</option>
                  <option value="SANITATION_DRAINAGE">🧹 Open Gutter & Sanitation Overflow</option>
                  <option value="ROAD_REPAIR">🛣️ Road Potholes & Concrete Damage</option>
                  <option value="PROPERTY_TAX">📄 Property Assessment Correction</option>
                  <option value="OTHER">📌 Other Village Matter</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Subject / Title</label>
                <input type="text" class="form-control" [(ngModel)]="newTitle" name="title" required placeholder="e.g. Broken water pipe near House 104" />
              </div>

              <div class="form-group">
                <label class="form-label">Ward Number</label>
                <select class="form-control" [(ngModel)]="newWard" name="ward">
                  <option value="Ward-1">Ward 1 (Shivaji Chowk / Main)</option>
                  <option value="Ward-2">Ward 2 (Mandir Galli / Shindevasti)</option>
                  <option value="Ward-3">Ward 3 (School Road / Dongarwadi)</option>
                  <option value="Ward-4">Ward 4 (Bazar Peth / New Colony)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Description</label>
                <textarea class="form-control" rows="3" [(ngModel)]="newDescription" name="description" required placeholder="Describe location, duration of issue, landmark..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Priority Level</label>
                <select class="form-control" [(ngModel)]="newPriority" name="priority">
                  <option value="LOW">Low (Routine maintenance)</option>
                  <option value="MEDIUM">Medium (Normal priority)</option>
                  <option value="HIGH">High (Affecting multiple households)</option>
                  <option value="URGENT">Urgent (Hazard / Main line pipe burst)</option>
                </select>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showNewModal.set(false)">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="submitting()">
                  @if (submitting()) {
                    Submitting...
                  } @else {
                    Submit Grievance
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 3rem 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-size: 2.25rem; margin-top: 0.5rem; margin-bottom: 0.25rem; }
    .page-desc { color: var(--text-muted); font-size: 1rem; }

    .complaints-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 800px) {
      .complaints-grid { grid-template-columns: 1fr; }
    }

    .complaint-card {
      display: flex;
      flex-direction: column;
    }
    .resolved-card {
      border-left: 4px solid var(--success);
    }
    .c-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .c-num-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .font-mono { font-family: monospace; font-size: 0.875rem; }
    .font-bold { font-weight: 700; }

    .c-cat-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .c-cat-pill .material-symbols-rounded { font-size: 0.95rem; }
    .c-heading { font-size: 1.15rem; margin-bottom: 0.5rem; }
    .c-desc { font-size: 0.875rem; color: var(--text-body); line-height: 1.5; margin-bottom: 1rem; flex-grow: 1; }

    /* Timeline Tracker */
    .timeline-box {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: var(--bg-subtle);
      border-radius: var(--radius-sm);
      padding: 0.65rem 0.5rem;
      margin-bottom: 1rem;
      position: relative;
    }
    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #cbd5e1;
    }
    .step-text { font-size: 0.6875rem; color: var(--text-muted); font-weight: 600; }
    .timeline-step.completed .dot { background: var(--primary); box-shadow: 0 0 6px rgba(4, 120, 87, 0.4); }
    .timeline-step.completed .step-text { color: var(--primary); font-weight: 700; }

    .assigned-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: var(--radius-sm);
      padding: 0.4rem 0.65rem;
      font-size: 0.75rem;
      color: #0369a1;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.5rem;
    }
    .notes-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-sm);
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
      color: #166534;
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    .notes-box .material-symbols-rounded { font-size: 1.15rem; color: var(--success); flex-shrink: 0; }
    .notes-box p { font-size: 0.75rem; margin-top: 0.15rem; }

    .c-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
      margin-top: auto;
    }

    .empty-box {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
    }
    .empty-icon { font-size: 3.5rem; color: var(--primary); margin-bottom: 0.5rem; }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 { font-size: 1.25rem; }
    .modal-body { padding: 1.5rem; }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
  `]
})
export class CitizenComplaintsComponent implements OnInit {
  private apiService = inject(ApiService);
  complaints = signal<Complaint[]>([]);

  showNewModal = signal(false);
  submitting = signal(false);

  newCategory = 'WATER_SUPPLY';
  newTitle = '';
  newWard = 'Ward-1';
  newDescription = '';
  newPriority = 'MEDIUM';

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.apiService.getMyComplaints().subscribe({
      next: r => this.complaints.set(r.data)
    });
  }

  submitGrievance(): void {
    if (!this.newTitle || !this.newDescription) return;
    this.submitting.set(true);

    this.apiService.submitComplaint({
      category: this.newCategory,
      title: this.newTitle,
      wardNumber: this.newWard,
      description: this.newDescription,
      priority: this.newPriority
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showNewModal.set(false);
        this.newTitle = '';
        this.newDescription = '';
        this.loadComplaints();
      },
      error: (err) => {
        this.submitting.set(false);
        alert('Failed to register grievance: ' + (err.error?.message || err.message));
      }
    });
  }
}
