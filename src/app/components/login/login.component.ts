import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../authentication/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  loginAttempts = 0;
  maxAttempts = 3;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.loginForm = this.createLoginForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.subscribeToLoginAttempts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  private initializeComponent(): void {
    // Focus on username field
    setTimeout(() => {
      const usernameField = document.getElementById('username');
      if (usernameField) {
        usernameField.focus();
      }
    }, 100);
  }

  private subscribeToLoginAttempts(): void {
    this.authService.loginAttempts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(attempts => {
        this.loginAttempts = attempts;
      });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.authService.isMaxAttemptsReached()) {
      this.showMaxAttemptsError();
      return;
    }

    this.performLogin();
  }

  private performLogin(): void {
    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (!response) {
            this.handleLoginError('Invalid credentials');
          }
          // Success navigation is handled in the service
        },
        error: (error) => {
          this.isLoading = false;
          this.handleLoginError(error.message);
        }
      });
  }

  private handleLoginError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });

    // Clear password field and focus on it
    this.loginForm.patchValue({ password: '' });
    setTimeout(() => {
      const passwordField = document.getElementById('password');
      if (passwordField) {
        passwordField.focus();
      }
    }, 100);
  }

  private showMaxAttemptsError(): void {
    this.snackBar.open(
      'Sorry! You have to login within three tries! Application will close.',
      'Close',
      {
        duration: 5000,
        panelClass: ['error-snackbar']
      }
    );
    
    setTimeout(() => {
      this.exitApplication();
    }, 5000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  onUsernameKeydown(event: KeyboardEvent): void {
    this.preventCopyPaste(event);
    if (event.key === 'Enter') {
      event.preventDefault();
      const passwordField = document.getElementById('password');
      if (passwordField) {
        passwordField.focus();
      }
    }
  }

  onPasswordKeydown(event: KeyboardEvent): void {
    this.preventCopyPaste(event);
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
    }
  }

  private preventCopyPaste(event: KeyboardEvent): void {
    // Prevent Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey && (event.key === 'c' || event.key === 'v' || event.key === 'x')) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  onCopy(event: ClipboardEvent): void {
    event.preventDefault();
  }

  onExit(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Quit Application?',
        message: 'Are you sure you wish to quit the application?',
        confirmText: 'Yes',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.exitApplication();
      }
    });
  }

  private exitApplication(): void {
    // In a web application, we can't actually close the browser window
    // Instead, we can redirect to a goodbye page or show a message
    window.location.href = 'about:blank';
  }

  get isLoginDisabled(): boolean {
    return this.loginForm.get('username')?.value?.trim() === '' || 
           this.isLoading || 
           this.authService.isMaxAttemptsReached();
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    return '';
  }
}