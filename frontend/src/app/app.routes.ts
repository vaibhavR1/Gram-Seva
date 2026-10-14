import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { NoticesComponent } from './features/public/notices/notices.component';
import { WaterScheduleComponent } from './features/public/water-schedule/water-schedule.component';
import { AboutComponent } from './features/public/about/about.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CitizenDashboardComponent } from './features/citizen/dashboard/citizen-dashboard.component';
import { CitizenPropertiesComponent } from './features/citizen/properties/citizen-properties.component';
import { CitizenBillsComponent } from './features/citizen/bills/citizen-bills.component';
import { CitizenComplaintsComponent } from './features/citizen/complaints/citizen-complaints.component';
import { SarpanchDashboardComponent } from './features/sarpanch/dashboard/sarpanch-dashboard.component';
import { WaterDashboardComponent } from './features/water-staff/water-dashboard.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';

export const routes: Routes = [
  // Public Routes
  { path: '', component: HomeComponent, title: 'GramSeva — Digital Gram Panchayat Portal' },
  { path: 'notices', component: NoticesComponent, title: 'Notices & Gram Sabha — GramSeva' },
  { path: 'water-schedule', component: WaterScheduleComponent, title: 'Water Supply Timings — GramSeva' },
  { path: 'about', component: AboutComponent, title: 'About Shivane Gram Panchayat — GramSeva' },

  // Auth Routes
  { path: 'login', component: LoginComponent, title: 'Sign In — GramSeva Portal' },
  { path: 'register', component: RegisterComponent, title: 'Villager Registration — GramSeva' },

  // Citizen Dashboard Routes
  { path: 'citizen/dashboard', component: CitizenDashboardComponent, title: 'Citizen Portal — GramSeva' },
  { path: 'citizen/properties', component: CitizenPropertiesComponent, title: 'My Properties — GramSeva' },
  { path: 'citizen/bills', component: CitizenBillsComponent, title: 'Tax Bills & Receipts — GramSeva' },
  { path: 'citizen/complaints', component: CitizenComplaintsComponent, title: 'Grievance Redressal — GramSeva' },

  // Role Dashboards
  { path: 'sarpanch/dashboard', component: SarpanchDashboardComponent, title: 'Sarpanch Admin Desk — GramSeva' },
  { path: 'water/dashboard', component: WaterDashboardComponent, title: 'Water Operations — GramSeva' },
  { path: 'admin/dashboard', component: AdminDashboardComponent, title: 'Super Admin — GramSeva' },

  // Fallback
  { path: '**', redirectTo: '' }
];
