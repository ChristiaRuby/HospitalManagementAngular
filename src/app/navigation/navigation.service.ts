import { Injectable } from '@angular/core';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private rolePermissions: { [key in UserRole]: string[] } = {
    [UserRole.Administrator]: [
      'inpatients', 'outpatients', 'channeling', 'payments', 
      'reports', 'search', 'maintenance', 'user-management'
    ],
    [UserRole.Cashier]: [
      'payments', 'search-payments'
    ],
    [UserRole.Receptionist]: [
      'channeling', 'search'
    ],
    [UserRole.InpatientStaff]: [
      'inpatients'
    ],
    [UserRole.OutpatientStaff]: [
      'outpatients'
    ]
  };

  isFeatureAccessible(feature: string, userRole: UserRole): boolean {
    return this.rolePermissions[userRole]?.includes(feature) || false;
  }

  getAccessibleFeatures(userRole: UserRole): string[] {
    return this.rolePermissions[userRole] || [];
  }
}