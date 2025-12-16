import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../components/authentication/auth.service';
import { NavigationService } from '../navigation/navigation.service';
import { UserRole } from '../models/user.model';
import { InpatientSearchWizardComponent } from '../components/inpatient-search-wizard/inpatient-search-wizard.component';

interface NavigationItem {
  id: string;
  label: string;
  route?: string;
  action?: () => void;
  enabled: boolean;
  icon?: string;
}

@Component({
  selector: 'app-navigation-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './navigation-panel.component.html',
  styleUrls: ['./navigation-panel.component.scss']
})
export class NavigationPanelComponent implements OnInit {
  navigationItems: NavigationItem[] = [];
  hoveredItem: string | null = null;
  currentUserRole: UserRole = UserRole.Administrator;

  constructor(
    private router: Router,
    private authService: AuthService,
    private navigationService: NavigationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user) {
        this.currentUserRole = user.role;
        this.initializeNavigationItems();
      }
    });
  }

  private initializeNavigationItems() {
    this.navigationItems = [
      {
        id: 'record-explorer',
        label: 'Record Explorer',
        enabled: true,
        icon: 'search'
      },
      {
        id: 'manage-inpatients',
        label: 'Manage Inpatients',
        route: '/inpatients',
        enabled: this.isFeatureEnabled('inpatients'),
        icon: 'local_hospital'
      },
      {
        id: 'manage-outpatients',
        label: 'Manage Outpatients',
        route: '/outpatients',
        enabled: this.isFeatureEnabled('outpatients'),
        icon: 'person'
      },
      {
        id: 'channeling-services',
        label: 'Channeling Services',
        route: '/channeling',
        enabled: this.isFeatureEnabled('channeling'),
        icon: 'schedule'
      },
      {
        id: 'manage-payments',
        label: 'Manage Payments',
        route: '/payments',
        enabled: this.isFeatureEnabled('payments'),
        icon: 'payment'
      },
      {
        id: 'reports-launch',
        label: 'Reports Quick Launch',
        route: '/reports',
        enabled: this.isFeatureEnabled('reports'),
        icon: 'assessment'
      },
      {
        id: 'search-engine',
        label: 'Search Engine',
        route: '/search',
        enabled: this.isFeatureEnabled('search'),
        icon: 'search'
      },
      {
        id: 'inpatient-search-wizard',
        label: 'Launch Inpatient Search Wizard',
        action: () => this.openInpatientSearchWizard(),
        enabled: this.isFeatureEnabled('inpatients'),
        icon: 'search'
      },
      {
        id: 'user-account',
        label: 'User Account Panel',
        enabled: true,
        icon: 'account_circle'
      },
      {
        id: 'change-password',
        label: 'Change Password',
        route: '/change-password',
        enabled: true,
        icon: 'lock'
      },
      {
        id: 'log-off-exit',
        label: 'Log Off / Exit',
        action: () => this.showLogoffDialog(),
        enabled: true,
        icon: 'exit_to_app'
      }
    ];
  }

  private isFeatureEnabled(feature: string): boolean {
    return this.navigationService.isFeatureAccessible(feature, this.currentUserRole);
  }

  onItemClick(item: NavigationItem) {
    if (!item.enabled) return;

    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      item.action();
    }
  }

  @HostListener('mouseenter', ['$event'])
  onItemHover(itemId: string) {
    this.hoveredItem = itemId;
  }

  @HostListener('mouseleave')
  onItemLeave() {
    this.hoveredItem = null;
  }

  private showLogoffDialog() {
    // Implementation for logoff dialog
    this.authService.logout();
  }

  openInpatientSearchWizard() {
    this.dialog.open(InpatientSearchWizardComponent, {
      width: '850px',
      height: '650px',
      disableClose: false,
      panelClass: 'inpatient-search-dialog'
    });
  }
}