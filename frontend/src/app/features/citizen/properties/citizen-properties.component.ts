import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Property, WaterConnection } from '../../../core/models/models';

@Component({
  selector: 'app-citizen-properties',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container page-container">
      <div class="page-header">
        <div>
          <span class="badge badge-primary">Property Registry (Namuna 8)</span>
          <h1 class="page-title">My Registered Village Properties</h1>
          <p class="page-desc">Official Gram Panchayat ownership records, construction assessments, and water service linkages.</p>
        </div>
      </div>

      <div class="properties-grid">
        @for (prop of properties(); track prop.id) {
          <div class="card property-card">
            <div class="property-header">
              <div class="prop-id-tag">
                <span class="material-symbols-rounded">tag</span>
                <span>{{ prop.propertyNumber }}</span>
              </div>
              <span class="badge" [class.badge-success]="prop.status === 'ACTIVE'">{{ prop.status }}</span>
            </div>

            <div class="prop-main">
              <div class="type-icon" [class.comm]="prop.propertyType === 'COMMERCIAL'">
                <span class="material-symbols-rounded">{{ prop.propertyType === 'COMMERCIAL' ? 'store' : 'cottage' }}</span>
              </div>
              <div>
                <h3>{{ prop.propertyType === 'COMMERCIAL' ? 'Commercial Premise / Shop' : 'Residential House (Niwas)' }}</h3>
                <p class="prop-addr">{{ prop.address }}</p>
              </div>
            </div>

            <div class="specs-grid">
              <div class="spec-box">
                <span class="spec-label">Ward Number</span>
                <span class="spec-val">{{ prop.wardNumber }}</span>
              </div>
              <div class="spec-box">
                <span class="spec-label">Built-Up Area</span>
                <span class="spec-val">{{ prop.constructionAreaSqFt }} sq.ft</span>
              </div>
              <div class="spec-box">
                <span class="spec-label">Plot Area</span>
                <span class="spec-val">{{ prop.plotAreaSqFt }} sq.ft</span>
              </div>
              <div class="spec-box">
                <span class="spec-label">Annual Assessment</span>
                <span class="spec-val text-primary font-bold">₹{{ prop.annualTaxAmount }}</span>
              </div>
            </div>

            <div class="prop-footer">
              <span class="meta-tag">Owner: {{ prop.owner?.user?.fullName }}</span>
              <a routerLink="/citizen/bills" class="btn btn-sm btn-outline-primary">View Tax Bills</a>
            </div>
          </div>
        }
      </div>

      <!-- Water Connections Linked -->
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">
            <span class="material-symbols-rounded" style="color: #0284c7">water_drop</span> Linked Drinking Water Connections
          </h3>
          <a routerLink="/water-schedule" class="btn btn-sm btn-secondary">Check Timings</a>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Connection No</th>
                <th>Meter Number</th>
                <th>Type</th>
                <th>Pipe Size</th>
                <th>Monthly Rate</th>
                <th>Installed Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (conn of waterConnections(); track conn.id) {
                <tr>
                  <td class="font-mono font-bold">{{ conn.connectionNumber }}</td>
                  <td class="font-mono">{{ conn.meterNumber }}</td>
                  <td>{{ conn.connectionType }}</td>
                  <td>{{ conn.pipeSizeMm }} mm (1/2")</td>
                  <td class="font-bold">₹{{ conn.monthlyRate }}/mo</td>
                  <td>{{ conn.installedDate }}</td>
                  <td><span class="badge badge-success">{{ conn.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 3rem 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2.25rem; margin-top: 0.5rem; margin-bottom: 0.25rem; }
    .page-desc { color: var(--text-muted); font-size: 1rem; }

    .properties-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 800px) {
      .properties-grid { grid-template-columns: 1fr; }
    }

    .property-card {
      display: flex;
      flex-direction: column;
    }
    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .prop-id-tag {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      font-family: monospace;
      font-weight: 700;
      color: var(--primary);
      font-size: 0.8125rem;
    }
    .prop-id-tag .material-symbols-rounded { font-size: 1rem; }

    .prop-main {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .type-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .type-icon.comm {
      background: var(--saffron-light);
      color: var(--saffron);
    }
    .prop-addr { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .spec-box {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.65rem 0.85rem;
      display: flex;
      flex-direction: column;
    }
    .spec-label { font-size: 0.75rem; color: var(--text-muted); }
    .spec-val { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-top: 0.15rem; }
    .text-primary { color: var(--primary); }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }

    .prop-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      margin-top: auto;
    }
    .meta-tag { font-size: 0.8125rem; color: var(--text-muted); }
    .mt-4 { margin-top: 2rem; }
  `]
})
export class CitizenPropertiesComponent implements OnInit {
  private apiService = inject(ApiService);
  properties = signal<Property[]>([]);
  waterConnections = signal<WaterConnection[]>([]);

  ngOnInit(): void {
    this.apiService.getMyProperties().subscribe({ next: r => this.properties.set(r.data) });
    this.apiService.getMyWaterConnections().subscribe({ next: r => this.waterConnections.set(r.data) });
  }
}
