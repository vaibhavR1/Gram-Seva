import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Panchayat } from '../../../core/models/models';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container page-container">
      <div class="page-header text-center">
        <span class="badge badge-primary">Panchayat Administration</span>
        <h1 class="page-title">About Shivane Gram Panchayat</h1>
        <p class="page-desc">History, Governance Structure, Key Development Milestones, and Village Administration.</p>
      </div>

      <!-- Sarpanch Message Card -->
      <div class="card leader-card">
        <div class="leader-avatar-wrap">
          <div class="leader-avatar">
            <span class="material-symbols-rounded leader-icon">person</span>
          </div>
          <div class="leader-badge">Sarpanch</div>
        </div>
        <div class="leader-message">
          <span class="quote-mark">“</span>
          <h2 class="leader-name">Smt. Surekha Babanrao Patil</h2>
          <p class="leader-title">Sarpanch, Shivane Gram Panchayat</p>
          <p class="message-body">
            "Our vision for Shivane is to achieve 100% digital governance where every villager can pay house and water taxes with a single click, track infrastructure works transparently, and receive clean, purified tap water every morning. GramSeva ensures zero middlemen, digital transparency, and direct accountability to the Gram Sabha."
          </p>
        </div>
      </div>

      <!-- Panchayat Office Info Grid -->
      <div class="info-grid mt-4">
        <div class="card">
          <h3 class="card-title">
            <span class="material-symbols-rounded">location_city</span> Administrative Profile
          </h3>
          <div class="info-list">
            <div class="info-row">
              <span class="label">Panchayat Name:</span>
              <span class="value">{{ panchayat()?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Taluka & District:</span>
              <span class="value">{{ panchayat()?.taluka }}, {{ panchayat()?.district }}</span>
            </div>
            <div class="info-row">
              <span class="label">State & PIN:</span>
              <span class="value">{{ panchayat()?.state }} — {{ panchayat()?.pinCode }}</span>
            </div>
            <div class="info-row">
              <span class="label">Total Population:</span>
              <span class="value">{{ panchayat()?.villagePopulation | number }}</span>
            </div>
            <div class="info-row">
              <span class="label">Wards:</span>
              <span class="value">6 Administrative Wards</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">
            <span class="material-symbols-rounded">contact_phone</span> Contact & Working Hours
          </h3>
          <div class="info-list">
            <div class="info-row">
              <span class="label">Office Address:</span>
              <span class="value">{{ panchayat()?.officeAddress }}</span>
            </div>
            <div class="info-row">
              <span class="label">Official Email:</span>
              <span class="value">{{ panchayat()?.contactEmail }}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone Line:</span>
              <span class="value">{{ panchayat()?.contactPhone }}</span>
            </div>
            <div class="info-row">
              <span class="label">Public Hours:</span>
              <span class="value">Mon to Sat (09:30 AM to 05:30 PM)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Development Priorities -->
      <div class="priorities-section mt-4">
        <h2 class="sub-heading">Key Development Priorities 2026-27</h2>
        <div class="priorities-grid">
          <div class="priority-card card">
            <div class="p-icon emerald"><span class="material-symbols-rounded">water_drop</span></div>
            <h4>Jal Jeevan Mission 100% Tap Connectivity</h4>
            <p>Underground pipeline network expansion to all newly developed areas in Ward 3 and 4 with metered connections.</p>
          </div>
          <div class="priority-card card">
            <div class="p-icon saffron"><span class="material-symbols-rounded">solar_power</span></div>
            <h4>Solar LED Village Street Lighting</h4>
            <p>120 new solar-powered street lighting fixtures on village roads and internal gullies with automatic dusk sensors.</p>
          </div>
          <div class="priority-card card">
            <div class="p-icon blue"><span class="material-symbols-rounded">delete_sweep</span></div>
            <h4>Solid & Liquid Waste Management</h4>
            <p>Daily door-to-door segregated waste collection vehicle and bio-compost pit maintenance near Mandir Galli.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 3rem 1.5rem; }
    .page-header { margin-bottom: 2.5rem; }
    .text-center { text-align: center; }
    .page-title { font-size: 2.25rem; margin-top: 0.5rem; margin-bottom: 0.25rem; }
    .page-desc { color: var(--text-muted); font-size: 1rem; }

    .leader-card {
      display: flex;
      align-items: center;
      gap: 2.5rem;
      background: linear-gradient(135deg, #f0fdf4, #ffffff);
      border: 1px solid #bbf7d0;
      padding: 2.5rem;
    }
    @media (max-width: 768px) {
      .leader-card { flex-direction: column; text-align: center; }
    }
    .leader-avatar-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    .leader-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(4, 120, 87, 0.25);
    }
    .leader-icon { font-size: 3.5rem; }
    .leader-badge {
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .leader-name { font-size: 1.5rem; margin-bottom: 0.2rem; }
    .leader-title { font-size: 0.875rem; color: var(--primary); font-weight: 600; margin-bottom: 1rem; }
    .message-body { font-size: 0.95rem; line-height: 1.7; color: var(--text-body); font-style: italic; }
    .quote-mark { font-size: 3rem; color: #a7f3d0; line-height: 0; display: inline-block; vertical-align: bottom; }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 768px) {
      .info-grid { grid-template-columns: 1fr; }
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      font-size: 0.875rem;
    }
    .info-row:last-child { border-bottom: none; }
    .info-row .label { color: var(--text-muted); font-weight: 500; }
    .info-row .value { color: var(--text-main); font-weight: 600; text-align: right; }

    .sub-heading { font-size: 1.5rem; margin-bottom: 1.25rem; text-align: center; }
    .priorities-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 800px) {
      .priorities-grid { grid-template-columns: 1fr; }
    }
    .priority-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .p-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .p-icon.emerald { background: var(--primary-light); color: var(--primary); }
    .p-icon.saffron { background: var(--saffron-light); color: var(--saffron); }
    .p-icon.blue { background: #e0f2fe; color: #0284c7; }
    .priority-card h4 { font-size: 1.05rem; }
    .priority-card p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; }
    .mt-4 { margin-top: 2rem; }
  `]
})
export class AboutComponent implements OnInit {
  private apiService = inject(ApiService);
  panchayat = signal<Panchayat | null>(null);

  ngOnInit(): void {
    this.apiService.getPanchayatInfo().subscribe({
      next: res => this.panchayat.set(res.data)
    });
  }
}
