import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Top Gov Strip -->
    <div class="top-strip">
      <div class="container top-strip-inner">
        <div class="top-info">
          <span class="emblem-text">🇮🇳 Government of Maharashtra | Zilla Parishad Pune</span>
          <span class="divider">|</span>
          <span class="helpline">Toll-Free Helpline: <strong>1800-233-4567</strong></span>
        </div>
        <div class="top-actions">
          <!-- Quick Role Selector for Instant Demo -->
          <div class="demo-selector">
            <span class="demo-label">Quick Demo Role:</span>
            <button class="role-chip" (click)="quickLogin('CITIZEN')" title="Login as Villager (Ramesh Patil)">
              👤 Citizen
            </button>
            <button class="role-chip" (click)="quickLogin('SARPANCH')" title="Login as Sarpanch Admin">
              👑 Sarpanch
            </button>
            <button class="role-chip" (click)="quickLogin('WATER_SUPPLIER')" title="Login as Water Staff">
              💧 Water Staff
            </button>
            <button class="role-chip" (click)="quickLogin('SUPER_ADMIN')" title="Login as Zilla Admin">
              🛡️ Super Admin
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="main-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <span class="material-symbols-rounded icon-filled">assured_workload</span>
          </div>
          <div class="brand-text">
            <div class="brand-title">GramSeva <span class="badge-portal">PORTAL</span></div>
            <div class="brand-subtitle">Shivane Gram Panchayat • Haveli, Pune</div>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <span class="material-symbols-rounded">home</span> Home
          </a>
          <a routerLink="/notices" routerLinkActive="active" class="nav-link">
            <span class="material-symbols-rounded">campaign</span> Notices & Sabha
          </a>
          <a routerLink="/water-schedule" routerLinkActive="active" class="nav-link">
            <span class="material-symbols-rounded">water_drop</span> Water Supply
          </a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">
            <span class="material-symbols-rounded">info</span> About Panchayat
          </a>
        </nav>

        <!-- User Controls / Auth -->
        <div class="header-auth">
          @if (authService.isAuthenticated()) {
            <div class="user-pill">
              <div class="user-avatar">
                {{ getUserInitials() }}
              </div>
              <div class="user-meta">
                <div class="user-name">{{ authService.currentUser()?.fullName }}</div>
                <div class="user-role-badge badge-{{ authService.userRole()?.toLowerCase() }}">
                  {{ formatRole(authService.userRole()) }}
                </div>
              </div>
              
              <a [routerLink]="getDashboardRoute()" class="btn btn-sm btn-primary">
                <span class="material-symbols-rounded">dashboard</span> Dashboard
              </a>
              
              <button class="btn btn-sm btn-secondary" (click)="logout()" title="Sign Out">
                <span class="material-symbols-rounded">logout</span>
              </button>
            </div>
          } @else {
            <div class="auth-buttons">
              <a routerLink="/login" class="btn btn-secondary btn-sm">
                <span class="material-symbols-rounded">login</span> Sign In
              </a>
              <a routerLink="/register" class="btn btn-primary btn-sm">
                <span class="material-symbols-rounded">person_add</span> Register Citizen
              </a>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-strip {
      background: #0f172a;
      color: #94a3b8;
      font-size: 0.75rem;
      border-bottom: 1px solid #1e293b;
      padding: 0.35rem 0;
    }
    .top-strip-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .top-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .emblem-text {
      color: #cbd5e1;
      font-weight: 500;
    }
    .divider { color: #475569; }
    .helpline strong { color: #f8fafc; }
    
    .demo-selector {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .demo-label {
      color: #e2e8f0;
      font-weight: 600;
      font-size: 0.7rem;
      margin-right: 0.2rem;
    }
    .role-chip {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .role-chip:hover {
      background: #047857;
      border-color: #10b981;
      color: #ffffff;
      transform: translateY(-1px);
    }

    .main-header {
      background: #ffffff;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      gap: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(4, 120, 87, 0.25);
    }
    .brand-icon .material-symbols-rounded {
      font-size: 1.75rem;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .badge-portal {
      font-size: 0.625rem;
      font-weight: 700;
      background: var(--saffron-light);
      color: var(--saffron);
      border: 1px solid #fed7aa;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.85rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-body);
      border-radius: var(--radius-md);
      transition: var(--transition);
    }
    .nav-link:hover {
      color: var(--primary);
      background-color: var(--primary-light);
    }
    .nav-link.active {
      color: var(--primary);
      background-color: var(--primary-light);
      font-weight: 700;
    }
    .nav-link .material-symbols-rounded {
      font-size: 1.15rem;
    }

    .header-auth {
      display: flex;
      align-items: center;
    }
    .auth-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.35rem 0.5rem 0.35rem 0.35rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 9999px;
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--blue));
      color: white;
      font-weight: 700;
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      padding-right: 0.25rem;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role-badge {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  quickLogin(role: Role): void {
    this.authService.quickLogin(role).subscribe({
      next: () => {
        this.router.navigate([this.getDashboardRoute()]);
      },
      error: err => console.error(err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getDashboardRoute(): string {
    const role = this.authService.userRole();
    switch (role) {
      case 'CITIZEN': return '/citizen/dashboard';
      case 'SARPANCH': return '/sarpanch/dashboard';
      case 'WATER_SUPPLIER': return '/water/dashboard';
      case 'SUPER_ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  formatRole(role: Role | null | undefined): string {
    if (!role) return '';
    return role.replace('_', ' ');
  }
}
