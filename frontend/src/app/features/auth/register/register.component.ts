import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-wrapper">
      <div class="register-box card">
        <div class="register-header text-center">
          <div class="reg-icon">
            <span class="material-symbols-rounded">person_add</span>
          </div>
          <h2>Villager Citizen Registration</h2>
          <p class="subtitle">Create your personal account to pay taxes, view receipts, and submit grievances</p>
        </div>

        @if (errorMessage()) {
          <div class="alert-error">
            <span class="material-symbols-rounded">error</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Full Name (as per Aadhaar)</label>
              <input type="text" class="form-control" [(ngModel)]="fullName" name="fullName" required placeholder="e.g. Ramesh Dinkar Patil" />
            </div>

            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-control" [(ngModel)]="username" name="username" required placeholder="e.g. rameshpatil" />
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-control" [(ngModel)]="email" name="email" required placeholder="name@example.com" />
            </div>

            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input type="tel" class="form-control" [(ngModel)]="phone" name="phone" placeholder="+91 9822334455" />
            </div>

            <div class="form-group">
              <label class="form-label">Ward Number</label>
              <select class="form-control" [(ngModel)]="wardNumber" name="wardNumber">
                <option value="Ward-1">Ward 1 (Shivaji Chowk / Main)</option>
                <option value="Ward-2">Ward 2 (Mandir Galli / Shindevasti)</option>
                <option value="Ward-3">Ward 3 (School Road / Dongarwadi)</option>
                <option value="Ward-4">Ward 4 (Bazar Peth / New Colony)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">House Number / Milkat No</label>
              <input type="text" class="form-control" [(ngModel)]="houseNumber" name="houseNumber" placeholder="e.g. H-104" />
            </div>

            <div class="form-group">
              <label class="form-label">Aadhaar Number (Last 4 digits stored)</label>
              <input type="text" class="form-control" [(ngModel)]="aadharNumber" name="aadharNumber" placeholder="12-digit Aadhaar" maxlength="12" />
            </div>

            <div class="form-group">
              <label class="form-label">Ration Card Number</label>
              <input type="text" class="form-control" [(ngModel)]="rationCardNumber" name="rationCardNumber" placeholder="e.g. RC-MH-2024-XXXX" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Village Address</label>
            <input type="text" class="form-control" [(ngModel)]="address" name="address" placeholder="e.g. House No 104, Shivaji Chowk, Shivane" />
          </div>

          <div class="form-group">
            <label class="form-label">Create Password</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password" required placeholder="At least 6 characters" />
          </div>

          <button type="submit" class="btn btn-primary full-width btn-lg mt-3" [disabled]="loading()">
            @if (loading()) {
              <span class="material-symbols-rounded spin">progress_activity</span> Registering...
            } @else {
              <span class="material-symbols-rounded">how_to_reg</span> Complete Citizen Registration
            }
          </button>
        </form>

        <div class="register-footer text-center">
          <p>Already have an account? <a routerLink="/login" class="link-primary">Sign In here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-wrapper {
      min-height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      background: radial-gradient(circle at top right, #ecfdf5, #f8fafc);
    }
    .register-box {
      width: 100%;
      max-width: 680px;
      padding: 2.5rem;
      box-shadow: var(--shadow-xl);
      border-radius: var(--radius-lg);
    }
    .text-center { text-align: center; }
    .reg-icon {
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
    .reg-icon .material-symbols-rounded { font-size: 1.75rem; }
    .register-header h2 { font-size: 1.65rem; margin-bottom: 0.25rem; }
    .subtitle { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 2rem; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }

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
      margin-bottom: 1.5rem;
    }
    .full-width { width: 100%; }
    .mt-3 { margin-top: 1rem; }
    .register-footer {
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
      font-size: 0.8125rem;
    }
    .link-primary { color: var(--primary); font-weight: 700; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  username = '';
  email = '';
  phone = '';
  password = '';
  wardNumber = 'Ward-1';
  houseNumber = '';
  aadharNumber = '';
  rationCardNumber = '';
  address = '';

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.username || !this.email || !this.password || !this.fullName) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    const payload = {
      username: this.username,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      phone: this.phone,
      wardNumber: this.wardNumber,
      houseNumber: this.houseNumber,
      aadharNumber: this.aadharNumber,
      rationCardNumber: this.rationCardNumber,
      address: this.address
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/citizen/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed');
      }
    });
  }
}
