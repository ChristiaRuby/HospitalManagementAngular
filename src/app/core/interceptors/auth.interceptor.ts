import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to requests
    const token = localStorage.getItem('authToken');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only handle 401 errors for automatic logout
        // Don't logout on other errors like 400, 500, etc.
        if (error.status === 401 && !req.url.includes('/api/Auth/login')) {
          // Clear auth data and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('loginTime');
          localStorage.removeItem('tokenExpiry');
          
          this.snackBar.open('Session expired. Please login again.', 'Close', {
            duration: 3000
          });
          
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}