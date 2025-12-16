import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { InpatientService } from '../inpatient/inpatient.service';
import { ValidationService } from '../validation/validation.service';
import { Inpatient, Gender, CivilStatus, AccountType, Company } from '../models/inpatient.model';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { InpatientSearchWizardComponent } from '../components/inpatient-search-wizard/inpatient-search-wizard.component';
import { CompanySearchWizardComponent } from '../components/company-search-wizard/company-search-wizard.component';

@Component({
  selector: 'app-inpatient-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCardModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './inpatient-maintenance.component.html',
  styleUrls: ['./inpatient-maintenance.component.scss']
})
export class InpatientMaintenanceComponent implements OnInit, OnDestroy {
  inpatientForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  currentStep = 1;
  
  // Enums for templates
  genderOptions = Object.values(Gender);
  civilStatusOptions = Object.values(CivilStatus);
  accountTypeOptions = Object.values(AccountType);
  
  // Navigation state
  currentPatient: Inpatient | null = null;
  hasNext = true;
  hasPrevious = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private inpatientService: InpatientService,
    private validationService: ValidationService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadInpatients();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.inpatientForm = this.fb.group({
      patientId: [''],
      firstName: ['', [Validators.required, ValidationService.alphabetsOnlyValidator()]],
      surname: ['', [Validators.required, ValidationService.alphabetsOnlyValidator()]],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nicNumber: ['', ValidationService.nicValidator()],
      address: ['', Validators.required],
      phoneHome: ['', ValidationService.phoneValidator()],
      phoneMob: ['', ValidationService.phoneValidator()],
      patientOccupation: ['', [Validators.required, Validators.maxLength(30), ValidationService.alphabetsOnlyValidator()]],
      civilStatus: ['', Validators.required],
      accountType: ['', Validators.required],
      companyId: [''],
      companyName: ['']
    });

    // Add cross-field validation for phone numbers
    this.inpatientForm.get('phoneMob')?.setValidators([
      ValidationService.phoneValidator()
    ]);
  }

  private setupFormSubscriptions(): void {
    // Account type change handler
    this.inpatientForm.get('accountType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(accountType => {
        this.handleAccountTypeChange(accountType);
      });

    // Phone number cross-validation
    this.inpatientForm.get('phoneHome')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.inpatientForm.get('phoneMob')?.updateValueAndValidity();
      });
  }

  private handleAccountTypeChange(accountType: string): void {
    const companyIdControl = this.inpatientForm.get('companyId');
    const companyNameControl = this.inpatientForm.get('companyName');

    if (accountType === AccountType.CORPORATE) {
      companyIdControl?.enable();
      companyNameControl?.enable();
      companyIdControl?.setValidators([Validators.required]);
      companyNameControl?.setValidators([Validators.required]);
    } else {
      companyIdControl?.disable();
      companyNameControl?.disable();
      companyIdControl?.clearValidators();
      companyNameControl?.clearValidators();
      companyIdControl?.setValue('');
      companyNameControl?.setValue('');
    }
    
    companyIdControl?.updateValueAndValidity();
    companyNameControl?.updateValueAndValidity();
  }

  private cleanValue(value: string): string {
    return (value && value !== '-') ? value : '';
  }

  // CRUD Operations
  onAddNew(): void {
    this.isEditMode = true;
    this.currentPatient = null;
    this.inpatientForm.reset();
    this.setDefaultValues();
  }

  onSave(): void {
    if (this.inpatientForm.valid) {
      const confirmRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Save Record',
          message: 'Are you sure you wish to save this record?'
        }
      });

      confirmRef.afterClosed().subscribe(result => {
        if (result) {
          this.saveInpatient();
        }
      });
    } else {
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  onUpdate(): void {
    if (this.inpatientForm.valid) {
      const confirmRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Update Record',
          message: 'Are you sure you wish to update this record?'
        }
      });

      confirmRef.afterClosed().subscribe(result => {
        if (result) {
          this.updateInpatient();
        }
      });
    } else {
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  onDelete(): void {
    const patientId = this.inpatientForm.get('patientId')?.value;
    
    if (!patientId) {
      this.snackBar.open('No record selected for deletion', 'Close', { duration: 3000 });
      return;
    }

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Record',
        message: `Are you sure you wish to delete Patient ID ${patientId}'s record?`
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteInpatient(patientId);
      }
    });
  }

  // Navigation Methods
  onFirst(): void {
    this.isLoading = true;
    this.inpatientService.getFirstInpatient()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.loadInpatientData(patient);
          this.hasPrevious = false;
          this.hasNext = true;
          this.checkNavigationState(patient.patientId);
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError('Failed to load first record', error);
          this.isLoading = false;
        }
      });
  }

  onPrevious(): void {
    const currentId = this.inpatientForm.get('patientId')?.value;
    if (!currentId) return;

    this.isLoading = true;
    this.inpatientService.getPreviousInpatient(currentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.loadInpatientData(patient);
          this.hasNext = true;
          this.checkNavigationState(patient.patientId);
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('This is the first record!', 'Close', { duration: 2000 });
          this.isLoading = false;
        }
      });
  }

  onNext(): void {
    const currentId = this.inpatientForm.get('patientId')?.value;
    if (!currentId) {
      this.onFirst();
      return;
    }

    this.isLoading = true;
    this.inpatientService.getNextInpatient(currentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.loadInpatientData(patient);
          this.hasPrevious = true;
          this.checkNavigationState(patient.patientId);
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('This is the last record!', 'Close', { duration: 2000 });
          this.isLoading = false;
        }
      });
  }

  onLast(): void {
    this.isLoading = true;
    this.inpatientService.getLastInpatient()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.loadInpatientData(patient);
          this.hasNext = false;
          this.hasPrevious = true;
          this.checkNavigationState(patient.patientId);
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError('Failed to load last record', error);
          this.isLoading = false;
        }
      });
  }

  // Step Navigation
  onStep2(): void {
    const patientId = this.inpatientForm.get('patientId')?.value;
    if (patientId) {
      this.inpatientService.setCurrentPatient(this.inpatientForm.value);
      this.router.navigate(['/guardians-maintenance'], { 
        queryParams: { patientId, step: 2 } 
      });
    }
  }

  onStep3(): void {
    this.router.navigate(['/medical-records'], { 
      queryParams: { step: 3 } 
    });
  }

  onLaunchSearch(): void {
    this.openSearchWizard();
  }

  openSearchWizard(): void {
    this.dialog.open(InpatientSearchWizardComponent, {
      width: '850px',
      height: '650px',
      disableClose: false,
      panelClass: 'search-wizard-dialog'
    });
  }

  onCompanySearch(): void {
    this.openCompanySearchWizard();
  }

  openCompanySearchWizard(): void {
    const dialogRef = this.dialog.open(CompanySearchWizardComponent, {
      width: '850px',
      height: '650px',
      disableClose: false,
      panelClass: 'search-wizard-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.inpatientForm.patchValue({
          companyId: result.companyId,
          companyName: result.companyFullName
        });
      }
    });
  }

  onClose(): void {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Close Interface',
        message: 'Are you sure you wish to close this interface?'
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  // Helper Methods
  private loadInpatients(): void {
    this.onFirst();
  }

  private checkNavigationState(patientId: string): void {
    // Check if there are next/previous records
    this.inpatientService.getNextInpatient(patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.hasNext = true,
        error: () => this.hasNext = false
      });

    this.inpatientService.getPreviousInpatient(patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.hasPrevious = true,
        error: () => this.hasPrevious = false
      });
  }

  // private generatePatientId(): void {
  //   this.inpatientService.generatePatientId()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (patientId: any) => {
  //         this.inpatientForm.patchValue({ patientId });
  //       },
  //       error: (error: any) => {
  //         this.handleError('Failed to generate Patient ID', error);
  //       }
  //     });
  // }

  private saveInpatient(): void {
    this.isLoading = true;
    const inpatientData = this.prepareFormData();
    
    this.inpatientService.createInpatient(inpatientData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedInpatient: any) => {
          this.snackBar.open('Record saved successfully!', 'Close', { duration: 3000 });
          this.loadInpatientData(savedInpatient);
          this.checkNavigationState(savedInpatient.patientId);
          this.isLoading = false;
        },
        error: (error: any) => {
          this.handleError('Failed to save inpatient', error);
          this.isLoading = false;
        }
      });
  }

  private updateInpatient(): void {
    this.isLoading = true;
    const patientId = this.inpatientForm.get('patientId')?.value;
    const inpatientData = this.prepareFormData();
    
    this.inpatientService.updateInpatient(patientId, inpatientData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedInpatient: any) => {
          this.snackBar.open('Record updated successfully!', 'Close', { duration: 3000 });
          this.loadInpatientData(updatedInpatient || { ...inpatientData, patientId });
          this.checkNavigationState(patientId);
          this.isLoading = false;
        },
        error: (error: any) => {
          this.handleError('Failed to update inpatient', error);
          this.isLoading = false;
        }
      });
  }

  private deleteInpatient(patientId: string): void {
    this.isLoading = true;
    
    this.inpatientService.deleteInpatient(patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Record deleted successfully!', 'Close', { duration: 3000 });
          this.currentPatient = null;
          this.inpatientForm.reset();
          this.isEditMode = false;
          // Refresh by loading first record
          this.loadInpatients();
        },
        error: (error: any) => {
          this.handleError('Failed to delete inpatient', error);
          this.isLoading = false;
        }
      });
  }

  private loadInpatientData(inpatient: Inpatient): void {
    this.currentPatient = inpatient;
    this.inpatientForm.patchValue({
      patientId: inpatient.patientId || '',
      firstName: this.cleanValue(inpatient.firstName),
      surname: this.cleanValue(inpatient.surname),
      gender: this.cleanValue(inpatient.gender),
      dateOfBirth: inpatient.dateOfBirth && inpatient.dateOfBirth !== '-' ? inpatient.dateOfBirth.split('T')[0] : '',
      nicNumber: this.cleanValue(inpatient.nicNumber),
      address: this.cleanValue(inpatient.address),
      phoneHome: this.cleanValue(inpatient.phoneHome),
      phoneMob: this.cleanValue(inpatient.phoneMobile),
      patientOccupation: this.cleanValue(inpatient.occupation),
      civilStatus: this.cleanValue(inpatient.civilStatus),
      accountType: this.cleanValue(inpatient.accountType),
      companyId: this.cleanValue(inpatient.companyId),
      companyName: this.cleanValue(inpatient.companyName)
    });
    this.isEditMode = false;
  }

  private prepareFormData(): any {
    const formValue = this.inpatientForm.getRawValue();
    
    return {
      firstName: formValue.firstName,
      surname: formValue.surname,
      gender: formValue.gender,
      dateOfBirth: formValue.dateOfBirth,
      nicNumber: formValue.nicNumber,
      address: formValue.address,
      phoneHome: formValue.phoneHome,
      phoneMobile: formValue.phoneMob,
      occupation: formValue.patientOccupation,
      civilStatus: formValue.civilStatus,
      accountType: formValue.accountType,
      companyId: formValue.companyId,
      companyName: formValue.companyName
    };
  }

  private setDefaultValues(): void {
    const today = new Date().toISOString().split('T')[0];
    this.inpatientForm.patchValue({
      dateOfBirth: today
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.inpatientForm.controls).forEach(key => {
      const control = this.inpatientForm.get(key);
      control?.markAsTouched();
    });
  }

  private showValidationErrors(): void {
    const errors: string[] = [];
    
    Object.keys(this.inpatientForm.controls).forEach(key => {
      const control = this.inpatientForm.get(key);
      if (control?.errors && control.touched) {
        const fieldName = this.getFieldDisplayName(key);
        const errorMessage = this.validationService.getErrorMessage(fieldName, control.errors);
        errors.push(errorMessage);
      }
    });

    if (errors.length > 0) {
      this.snackBar.open(`Please fix the following errors: ${errors.join(', ')}`, 'Close', { 
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First Name',
      surname: 'Surname',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      nicNumber: 'NIC Number',
      address: 'Address',
      phoneHome: 'Home Phone',
      phoneMob: 'Mobile Phone',
      patientOccupation: 'Occupation',
      civilStatus: 'Civil Status',
      accountType: 'Account Type',
      companyId: 'Company ID',
      companyName: 'Company Name'
    };
    
    return fieldNames[fieldName] || fieldName;
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    
    let errorMessage = error.message;
    if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Error',
        message: `${message}: ${errorMessage}`
      }
    });
  }

  // Getters for template
  get isFirstRecord(): boolean {
    return !this.hasPrevious;
  }

  get isLastRecord(): boolean {
    return !this.hasNext;
  }

  get canNavigate(): boolean {
    return !this.isEditMode;
  }

  get canEdit(): boolean {
    return this.currentPatient !== null;
  }

  get canAddNew(): boolean {
    return !this.isEditMode;
  }

  get canSave(): boolean {
    return this.isEditMode;
  }

  get canUpdate(): boolean {
    return this.currentPatient !== null && !this.isEditMode;
  }

  get canDelete(): boolean {
    return this.currentPatient !== null && !this.isEditMode;
  }

  get showCompanyFields(): boolean {
    return this.inpatientForm.get('accountType')?.value === AccountType.CORPORATE;
  }

  getFieldError(fieldName: string): string {
    const control = this.inpatientForm.get(fieldName);
    if (control?.errors && control.touched) {
      const displayName = this.getFieldDisplayName(fieldName);
      return this.validationService.getErrorMessage(displayName, control.errors);
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.inpatientForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }
}