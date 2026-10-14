import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-col">
          <div class="footer-brand">
            <span class="material-symbols-rounded emblem-icon">assured_workload</span>
            <div>
              <h3>GramSeva Portal</h3>
              <p class="tagline">Shivane Gram Panchayat Administration</p>
            </div>
          </div>
          <p class="about-text">
            Digitizing rural governance, local tax assessment, sustainable water distribution, and citizen services for transparent, accountable, and citizen-first village administration.
          </p>
          <div class="gov-seal">
            <span>🇮🇳 Digital India & Panchayat Raj Initiative</span>
          </div>
        </div>

        <div class="footer-col">
          <h4>Citizen Services</h4>
          <ul class="footer-links">
            <li><a routerLink="/citizen/bills">House Tax (Ghar Patti)</a></li>
            <li><a routerLink="/citizen/bills">Water Tax (Pani Patti)</a></li>
            <li><a routerLink="/citizen/complaints">Submit Grievance / Takrar</a></li>
            <li><a routerLink="/water-schedule">Water Supply Schedule</a></li>
            <li><a routerLink="/notices">Gram Sabha Notices</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Administration Portals</h4>
          <ul class="footer-links">
            <li><a routerLink="/login">Sarpanch Admin Login</a></li>
            <li><a routerLink="/login">Water Supply Staff Portal</a></li>
            <li><a routerLink="/login">Zilla Parishad Super Admin</a></li>
            <li><a routerLink="/about">Panchayat Body Members</a></li>
            <li><a routerLink="/about">Development Projects</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Office & Contact</h4>
          <p class="contact-line">
            <span class="material-symbols-rounded">location_on</span>
            <span>Gram Panchayat Karyalay, Shivaji Chowk, Shivane, Taluka Haveli, Dist Pune — 411023</span>
          </p>
          <p class="contact-line">
            <span class="material-symbols-rounded">phone</span>
            <span>+91 20 2529 1100 (Office)</span>
          </p>
          <p class="contact-line">
            <span class="material-symbols-rounded">mail</span>
            <span>contact&#64;panchayatshivane.gov.in</span>
          </p>
          <p class="contact-line">
            <span class="material-symbols-rounded">schedule</span>
            <span>Mon - Sat: 09:30 AM - 05:30 PM</span>
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>© 2026 GramSeva Digital Gram Panchayat Portal. Designed for Rural E-Governance.</p>
          <div class="bottom-links">
            <a href="#">Privacy Policy</a>
            <span>•</span>
            <a href="#">Terms of Service</a>
            <span>•</span>
            <a href="#">Citizen Charter</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0f172a;
      color: #94a3b8;
      padding-top: 3.5rem;
      border-top: 1px solid #1e293b;
      margin-top: 4rem;
    }
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 2.5rem;
      padding-bottom: 3rem;
    }
    @media (max-width: 900px) {
      .footer-content {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 600px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .emblem-icon {
      font-size: 2.25rem;
      color: #10b981;
    }
    .footer-brand h3 {
      color: #ffffff;
      font-size: 1.25rem;
      font-weight: 700;
    }
    .tagline {
      font-size: 0.75rem;
      color: #64748b;
    }
    .about-text {
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
      color: #94a3b8;
    }
    .gov-seal {
      font-size: 0.75rem;
      color: #f97316;
      font-weight: 600;
      background: rgba(249, 115, 22, 0.1);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      display: inline-block;
      border: 1px solid rgba(249, 115, 22, 0.2);
    }
    .footer-col h4 {
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .footer-links a {
      color: #94a3b8;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: #10b981;
    }
    .contact-line {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.8125rem;
      color: #94a3b8;
      line-height: 1.4;
    }
    .contact-line .material-symbols-rounded {
      color: #10b981;
      font-size: 1.15rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .footer-bottom {
      border-top: 1px solid #1e293b;
      padding: 1.25rem 0;
      font-size: 0.8125rem;
      color: #64748b;
    }
    .footer-bottom-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .bottom-links {
      display: flex;
      gap: 0.75rem;
    }
    .bottom-links a {
      color: #64748b;
    }
    .bottom-links a:hover {
      color: #cbd5e1;
    }
  `]
})
export class FooterComponent {}
