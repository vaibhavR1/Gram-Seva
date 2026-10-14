import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-box card">
        <div class="login-header text-center">
          <div class="login-icon">
            <span class="material-symbols-rounded">lock</span>
          </div>
          <h2>Sign In to GramSeva</h2>
          <p class="subtitle">Access Citizen Services & Administration Portal</p>
        </div>

        <!-- Quick 1-Click Role Fill Buttons -->
        <div class="demo-fill-card">
          <span class="demo-fill-title">⚡ Quick 1-Click Demo Login:</span>
          <div class="demo-buttons-grid">
            <button type="button" class="btn-demo" (click)="quickLogin('CITIZEN')">
              <span class="demo-role">👤 Villager</span>
              <span class="demo-name">Ramesh Patil</span>
            </button>
            <button type="button" class="btn-demo" (click)="quickLogin('SARPANCH')">
              <span class="demo-role">👑 Sarpanch</span>
              <span class="demo-name">Surekha Patil</span>
            </button>
            <button type="button" class="btn-demo" (click)="quickLogin('WATER_SUPPLIER')">
              <span class="demo-role">💧 Water Staff</span>
              <span class="demo-name">Ganesh Shinde</span>
            </button>
            <button type="button" class="btn-demo" (click)="quickLogin('SUPER_ADMIN')">
              <span class="demo-role">🛡️ Super Admin</span>
              <span class="demo-name">Zilla Officer</span>
            </button>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert-error">
            <span class="material-symbols-rounded">error</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Username or Registered Email</label>
            <input type="text" class="form-control" [(ngModel)]="username" name="username" required placeholder="e.g. citizen1 or ramesh@example.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password" required placeholder="••••••••" />
          </div>

          <button type="submit" class="btn btn-primary full-width btn-lg" [disabled]="loading()">
            @if (loading()) {
              <span class="material-symbols-rounded spin">progress_activity</span> Signing In...
            } @else {
              <span class="material-symbols-rounded">login</span> Secure Login
            }
          </button>
        </form>

        <div class="login-footer text-center">
          <p>Don't have a citizen account? <a routerLink="/register" class="link-primary">Register Here</a></p>
          <p class="help-text">Forgot password or need help? Contact Panchayat Karyalay: 020-2529-1100</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      background: radial-gradient(circle at top right, #ecfdf5, #f8fafc);
    }
    .login-box {
      width: 100%;
      max-width: 480px;
      padding: 2.25rem;
      box-shadow: var(--shadow-xl);
      border-radius: var(--radius-lg);
    }
    .text-center { text-align: center; }
    .login-icon {
      width: 54px;
      height: 54px;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;
    }
    .login-icon .material-symbols-rounded { font-size: 1.75rem; }
    .login-header h2 { font-size: 1.65rem; margin-bottom: 0.25rem; }
    .subtitle { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem; }

    .demo-fill-card {
      background: #f0fdf4;
      border: 1px dashed #86efac;
      border-radius: var(--radius-md);
      padding: 0.875rem;
      margin-bottom: 1.5rem;
    }
    .demo-fill-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #166534;
      display: block;
      margin-bottom: 0.5rem;
    }
    .demo-buttons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .btn-demo {
      background: #ffffff;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-sm);
      padding: 0.4rem 0.5rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
    }
    .btn-demo:hover {
      background: #dcfce7;
      border-color: #4ade80;
      transform: translateY(-1px);
    }
    .demo-role { font-size: 0.75rem; font-weight: 700; color: #15803d; }
    .demo-name { font-size: 0.6875rem; color: #4b5563; }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      color: #b91c1c;
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .full-width { width: 100%; margin-top: 0.5rem; }
    .login-footer {
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
      font-size: 0.8125rem;
    }
    .link-primary { color: var(--primary); font-weight: 700; }
    .help-text { color: var(--text-muted); font-size: 0.75rem; margin-top: 0.5rem; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.redirectByRole(res.data.role);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid username or password');
      }
    });
  }

  quickLogin(role: Role): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.quickLogin(role).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.redirectByRole(res.data.role);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Quick login failed');
      }
    });
  }

  private redirectByRole(role: Role): void {
    switch (role) {
      case 'CITIZEN': this.router.navigate(['/citizen/dashboard']); break;
      case 'SARPANCH': this.router.navigate(['/sarpanch/dashboard']); break;
      case 'WATER_SUPPLIER': this.router.navigate(['/water/dashboard']); break;
      case 'SUPER_ADMIN': this.router.navigate(['/admin/dashboard']); break;
      default: this.router.navigate(['/']); break;
    }
  }
}
