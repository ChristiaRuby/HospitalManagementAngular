import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  // Custom Validators
  static nicValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value === '-') return null;
      
      const nicPattern = /^[0-9]{9}[vVxX]$/;
      const isValid = nicPattern.test(control.value) && control.value.length === 10;
      
      return isValid ? null : { invalidNic: true };
    };
  }

  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value === '-') return null;
      
      const phonePattern = /^[0-9\s]{1,15}$/;
      const isValid = phonePattern.test(control.value);
      
      return isValid ? null : { invalidPhone: true };
    };
  }

  static alphabetsOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const alphabetPattern = /^[a-zA-Z\s]+$/;
      const isValid = alphabetPattern.test(control.value);
      
      return isValid ? null : { alphabetsOnly: true };
    };
  }

  static requiredPhoneValidator(homePhoneControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const homePhone = homePhoneControl?.value;
      const mobPhone = control.value;
      
      if ((!homePhone || homePhone === '-') && (!mobPhone || mobPhone === '-')) {
        return { requiredPhone: true };
      }
      
      return null;
    };
  }

  // Error message helper
  getErrorMessage(fieldName: string, errors: ValidationErrors): string {
    if (errors['required']) {
      return `${fieldName} is required`;
    }
    if (errors['invalidNic']) {
      return 'NIC Number must be 10 characters (9 digits + V/X)';
    }
    if (errors['invalidPhone']) {
      return 'Phone number can only contain digits and spaces (max 15 characters)';
    }
    if (errors['alphabetsOnly']) {
      return `${fieldName} can only contain letters and spaces`;
    }
    if (errors['requiredPhone']) {
      return 'At least one phone number must be provided';
    }
    if (errors['maxlength']) {
      return `${fieldName} exceeds maximum length of ${errors['maxlength'].requiredLength}`;
    }
    
    return `Invalid ${fieldName}`;
  }
}