import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../components/authentication/auth.service';
import { User } from '../models/user.model';
import { InpatientSearchWizardComponent } from '../components/inpatient-search-wizard/inpatient-search-wizard.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="hospital-info">
      <div class="hospital-details">
        <h2>Durdans Hospitals (Pvt) Ltd.</h2>
        <div class="user-session">
          <p>Welcome, {{ currentUser?.designation }}</p>
          <p>Time In : {{ loginTime }}</p>
          <p>Present Time : {{ currentTime }}</p>
        </div>
      </div> 
    </div>
    
    <div class="bottom-section">
      <div class="hospital-logo">
        <div class="logo-circle">
        </div>
      </div>
      <div class="hospital-tagline">
        <img src="assets/logo.png" alt="Durdans Hospital Logo" class="hospital-logo-img">
        <div class="tagline-text">
          <h1>DURDANS HOSPITAL</h1>
          <p>It's All About Caring...</p>
        </div>
      </div>
      <div class="current-date">
        Today is {{ getCurrentDate() }}
      </div>
    </div>
  `,
  styleUrls: ['../dashboard/dashboard.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  loginTime: string = '';
  currentTime: string = '';

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loginTime = this.getTimeIn();
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getTimeIn(): string {
    const loginTime = localStorage.getItem('loginTime');
    return loginTime || new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  openInpatientSearchWizard(): void {
    this.dialog.open(InpatientSearchWizardComponent, {
      width: '850px',
      height: '650px',
      disableClose: false,
      panelClass: 'inpatient-search-dialog'
    });
  }
}