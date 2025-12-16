import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { UserRole, User, LoginRequest, LoginResponse, ValidateResponse } from '../../models/user.model';
import { API_CONFIG } from '../../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();



  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      
      this.validateToken().subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.logout();
          }
        },
        error: () => {
          console.warn('Token validation failed, but keeping user logged in');
        }
      });
    }
  }

  login(username: string, password: string): Observable<boolean> {
    const loginRequest: LoginRequest = {
      empId: username,
      password: password
    };

    return this.http.post<LoginResponse>(`${API_CONFIG.BASE_URL}/api/Auth/login`, loginRequest)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const user: User = {
              userId: response.data.userId,
              username: username,
              designation: response.data.fullName,
              role: this.mapApiRoleToUserRole(response.data.role)
            };

            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('tokenExpiry', response.data.expiresAt);
            localStorage.setItem('loginTime', new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }));
            
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            this.resetLoginAttempts();
            
            this.snackBar.open(`Welcome, ${user.designation}!`, 'Close', {
              duration: 3000
            });
            
            this.router.navigate(['/dashboard']);
            return true;
          } else {
            this.incrementLoginAttempts();
            this.snackBar.open(response.message || 'Login failed', 'Close', {
              duration: 3000
            });
            return false;
          }
        }),
        catchError(error => {
          this.incrementLoginAttempts();
          this.snackBar.open('Login failed. Please try again.', 'Close', {
            duration: 3000
          });
          return of(false);
        })
      );
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('tokenExpiry');
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/login']);
    
    this.snackBar.open('Logged out successfully', 'Close', {
      duration: 2000
    });
  }

  private mapApiRoleToUserRole(apiRole: string): UserRole {
    const roleMap: { [key: string]: UserRole } = {
      'Administrator': UserRole.Administrator,
      'Cashier': UserRole.Cashier,
      'Receptionist': UserRole.Receptionist,
      'Inpatient Staff': UserRole.InpatientStaff,
      'Outpatient Staff': UserRole.OutpatientStaff
    };
    
    return roleMap[apiRole] || UserRole.Administrator;
  }

  validateToken(): Observable<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) return of(false);

    return this.http.post<ValidateResponse>(`${API_CONFIG.BASE_URL}/api/Auth/validate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loginAttemptsSubject = new BehaviorSubject<number>(0);
  public loginAttempts$ = this.loginAttemptsSubject.asObservable();
  private readonly MAX_LOGIN_ATTEMPTS = 3;

  getLoginAttempts(): number {
    return this.loginAttemptsSubject.value;
  }

  isMaxAttemptsReached(): boolean {
    return this.getLoginAttempts() >= this.MAX_LOGIN_ATTEMPTS;
  }

  private incrementLoginAttempts(): void {
    const currentAttempts = this.loginAttemptsSubject.value;
    this.loginAttemptsSubject.next(currentAttempts + 1);
  }

  private resetLoginAttempts(): void {
    this.loginAttemptsSubject.next(0);
  }
}