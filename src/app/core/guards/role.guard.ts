import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../components/authentication/auth.service';
import { UserRole } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private featurePermissions: { [key: string]: UserRole[] } = {
    'inpatients': [UserRole.Administrator, UserRole.InpatientStaff],
    'outpatients': [UserRole.Administrator, UserRole.OutpatientStaff],
    'channeling': [UserRole.Administrator, UserRole.Receptionist],
    'payments': [UserRole.Administrator, UserRole.Cashier],
    'reports': [UserRole.Administrator]
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const requiredFeature = route.data['requiredFeature'];
    
    if (!user.role || !requiredFeature) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    const allowedRoles = this.featurePermissions[requiredFeature];
    if (allowedRoles && allowedRoles.includes(user.role)) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}