import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Announcement } from '../../../core/models/models';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container page-container">
      <div class="page-header">
        <div>
          <span class="badge badge-primary">Public Information</span>
          <h1 class="page-title">Announcements & Gram Sabha Notices</h1>
          <p class="page-desc">Official notifications, development meetings, health campaigns, and village updates.</p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="card filter-card">
        <div class="filters-row">
          <div class="category-pills">
            <button class="pill-btn" [class.active]="selectedCategory() === 'ALL'" (click)="selectedCategory.set('ALL')">
              All Notices ({{ announcements().length }})
            </button>
            <button class="pill-btn" [class.active]="selectedCategory() === 'GRAM_SABHA'" (click)="selectedCategory.set('GRAM_SABHA')">
              🏛️ Gram Sabha
            </button>
            <button class="pill-btn" [class.active]="selectedCategory() === 'WATER_SUPPLY'" (click)="selectedCategory.set('WATER_SUPPLY')">
              💧 Water Supply
            </button>
            <button class="pill-btn" [class.active]="selectedCategory() === 'HEALTH_CAMP'" (click)="selectedCategory.set('HEALTH_CAMP')">
              🩺 Health Camps
            </button>
            <button class="pill-btn" [class.active]="selectedCategory() === 'GOV_SCHEME'" (click)="selectedCategory.set('GOV_SCHEME')">
              📜 Govt Schemes
            </button>
          </div>

          <div class="search-box">
            <input type="text" class="form-control" placeholder="Search notices..." [(ngModel)]="searchQuery" />
          </div>
        </div>
      </div>

      <!-- Notices Grid -->
      <div class="notices-grid">
        @for (notice of filteredNotices(); track notice.id) {
          <div class="card notice-card" [class.urgent-card]="notice.priority === 'URGENT'">
            <div class="notice-top">
              <span class="badge" [class.badge-danger]="notice.priority === 'URGENT'" [class.badge-primary]="notice.priority !== 'URGENT'">
                {{ notice.category.replace('_', ' ') }}
              </span>
              <span class="notice-date">Published: {{ notice.publishDate }}</span>
            </div>

            <h3 class="notice-title">{{ notice.title }}</h3>
            <p class="notice-body">{{ notice.content }}</p>

            <div class="notice-footer">
              <span class="authority">Issued by: Gram Panchayat Administration</span>
              @if (notice.expiryDate) {
                <span class="expiry">Valid till: {{ notice.expiryDate }}</span>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state card">
            <span class="material-symbols-rounded empty-icon">notifications_off</span>
            <h3>No Notices Found</h3>
            <p>No announcements match your selected category or filter query.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 3rem 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2.25rem; margin-top: 0.5rem; margin-bottom: 0.25rem; }
    .page-desc { color: var(--text-muted); font-size: 1rem; }

    .filter-card {
      margin-bottom: 2rem;
      padding: 1rem 1.25rem;
    }
    .filters-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .category-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .pill-btn {
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.8125rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: white;
      color: var(--text-body);
      transition: var(--transition);
      cursor: pointer;
    }
    .pill-btn:hover {
      background: var(--bg-subtle);
      border-color: var(--border-strong);
    }
    .pill-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: 0 2px 6px rgba(4, 120, 87, 0.25);
    }
    .search-box {
      width: 260px;
    }

    .notices-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 800px) {
      .notices-grid { grid-template-columns: 1fr; }
    }

    .notice-card {
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .urgent-card {
      border-left: 4px solid #dc2626;
    }
    .notice-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .notice-date { font-size: 0.75rem; color: var(--text-muted); }
    .notice-title { font-size: 1.15rem; margin-bottom: 0.75rem; line-height: 1.35; }
    .notice-body { font-size: 0.875rem; color: var(--text-body); line-height: 1.6; margin-bottom: 1.25rem; flex-grow: 1; }
    .notice-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 0.75rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
    }
    .empty-icon { font-size: 3rem; color: var(--text-muted); margin-bottom: 0.5rem; }
  `]
})
export class NoticesComponent implements OnInit {
  private apiService = inject(ApiService);

  announcements = signal<Announcement[]>([]);
  selectedCategory = signal<string>('ALL');
  searchQuery = '';

  filteredNotices = computed(() => {
    const list = this.announcements();
    const cat = this.selectedCategory();
    const query = this.searchQuery.toLowerCase().trim();

    return list.filter(item => {
      const matchCat = cat === 'ALL' || item.category === cat;
      const matchQuery = !query || item.title.toLowerCase().includes(query) || item.content.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  });

  ngOnInit(): void {
    this.apiService.getPublicAnnouncements().subscribe({
      next: res => this.announcements.set(res.data)
    });
  }
}
