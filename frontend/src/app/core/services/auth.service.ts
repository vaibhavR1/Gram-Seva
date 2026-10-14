import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, AuthResponse, ApiResponse, Role } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  
  // Reactive Signals for State Management
  readonly currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly token = signal<string | null>(localStorage.getItem('gramseva_token'));
  
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role || null);
  readonly isCitizen = computed(() => this.userRole() === 'CITIZEN');
  readonly isSarpanch = computed(() => this.userRole() === 'SARPANCH');
  readonly isSuperAdmin = computed(() => this.userRole() === 'SUPER_ADMIN');
  readonly isWaterSupplier = computed(() => this.userRole() === 'WATER_SUPPLIER');

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  register(data: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('gramseva_token');
    localStorage.removeItem('gramseva_user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  // Quick Demo Role Switcher for seamless evaluation
  quickLogin(role: Role): Observable<ApiResponse<AuthResponse>> {
    const creds: Record<Role, { username: string; password: string }> = {
      SUPER_ADMIN: { username: 'superadmin', password: 'Admin@123' },
      SARPANCH: { username: 'sarpanch', password: 'Sarpanch@123' },
      CITIZEN: { username: 'citizen1', password: 'Citizen@123' },
      WATER_SUPPLIER: { username: 'waterstaff', password: 'Water@123' }
    };
    return this.login(creds[role]);
  }

  private setSession(auth: AuthResponse): void {
    localStorage.setItem('gramseva_token', auth.token);
    const user: User = {
      id: auth.userId,
      username: auth.username,
      email: auth.email,
      fullName: auth.fullName,
      role: auth.role,
      active: true
    };
    localStorage.setItem('gramseva_user', JSON.stringify(user));
    this.token.set(auth.token);
    this.currentUser.set(user);
  }

  private loadUserFromStorage(): User | null {
    const saved = localStorage.getItem('gramseva_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
}
