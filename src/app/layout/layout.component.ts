import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../components/authentication/auth.service';
import { User } from '../models/user.model';
import { InpatientSearchWizardComponent } from '../components/inpatient-search-wizard/inpatient-search-wizard.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="header">
        <div class="user-info">
          <span class="user-icon">💼</span>
          <div>
            <div class="welcome-text">Welcome, {{ currentUser?.designation }}</div>
            <div class="date-text">Today is {{ getCurrentDate() }}</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" (click)="logout()">
            Log Off
          </button>
        </div>
      </div>

      <div class="main-content">
        <!-- Sidebar -->
        <div class="sidebar">
          <div class="section-header">Record Explorer</div>
          <div class="menu-item" [class.active]="currentRoute === '/main/inpatients'" (click)="navigate('/main/inpatients')">
            Manage Inpatients
          </div>
          <div class="menu-item" [class.active]="currentRoute === '/main/outpatients'" (click)="navigate('/main/outpatients')">
           Manage Outpatients
          </div>
          <div class="menu-item" [class.active]="currentRoute === '/main/channeling'" (click)="navigate('/main/channeling')">
            Channelling Services
          </div>
          <div class="menu-item" [class.active]="currentRoute === '/main/payments'" (click)="navigate('/main/payments')">
           Manage Payments
          </div>
          <div class="menu-item" [class.active]="currentRoute === '/main/reports'" (click)="navigate('/main/reports')">
             Reports Quick Launch
          </div>
          <div class="menu-item">
            Search Engine
          </div>
          <div class="menu-item" (click)="openInpatientSearchWizard()">
            Launch Inpatient Search Wizard
          </div>
          
          <div class="section-header">User Account Panel</div>
          <div class="menu-item">
             Change Password
          </div>
          <div class="menu-item" (click)="logout()">
             Log Off
          </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  currentUser: User | null = null;
  currentRoute: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentRoute = (event as NavigationEnd).url;
    });
    
    this.currentRoute = this.router.url;
  }

  logout(): void {
    this.authService.logout();
  }



  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);
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