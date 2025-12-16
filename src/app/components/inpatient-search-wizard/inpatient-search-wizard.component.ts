import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { InpatientService } from '../../inpatient/inpatient.service';
import { Inpatient } from '../../models/inpatient.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-inpatient-search-wizard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './inpatient-search-wizard.component.html',
  styleUrls: ['./inpatient-search-wizard.component.scss']
})
export class InpatientSearchWizardComponent implements OnInit {
  dataSource = new MatTableDataSource<Inpatient>([]);
  searchType = 'patientId';
  searchValue = '';
  displayedColumns = ['patientId', 'firstName', 'surname', 'gender', 'dateOfBirth', 'nicNumber', 'address', 'phoneHome', 'phoneMobile', 'occupation', 'civilStatus', 'accountType'];
  editedPatients = new Set<string>();
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<InpatientSearchWizardComponent>,
    private inpatientService: InpatientService
  ) {}

  ngOnInit() {
    this.loadInpatients();
  }

  loadInpatients() {
    this.inpatientService.getInpatients().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
      },
      error: (error) => {
        console.error('Error loading inpatients:', error);
      }
    });
  }

  onSearchChange() {
    this.filterData();
  }

  onCriteriaChange() {
    this.filterData();
  }

  private filterData() {
    if (!this.searchValue.trim()) {
      this.dataSource.filter = '';
      return;
    }

    const filterValue = this.searchValue.toLowerCase().trim();
    this.dataSource.filterPredicate = (data: Inpatient, filter: string) => {
      switch (this.searchType) {
        case 'patientId':
          return data.patientId?.toLowerCase().includes(filter) || false;
        case 'firstName':
          return data.firstName?.toLowerCase().includes(filter) || false;
        case 'surname':
          return data.surname?.toLowerCase().includes(filter) || false;
        case 'nicNumber':
          return data.nicNumber?.toLowerCase().includes(filter) || false;
        default:
          return false;
      }
    };
    this.dataSource.filter = filterValue;
  }

  markAsEdited(patient: Inpatient) {
    this.editedPatients.add(patient.patientId);
  }

  isEdited(patient: Inpatient): boolean {
    return this.editedPatients.has(patient.patientId);
  }

  private cleanValue(value: string): string {
    return (value && value !== '-') ? value : '';
  }

  apply() {
    if (this.editedPatients.size === 0) {
      console.log('No changes to save');
      this.close();
      return;
    }

    this.isLoading = true;
    const editedData = this.dataSource.data.filter(patient => 
      this.editedPatients.has(patient.patientId)
    );

    console.log('Saving changes for patients:', editedData);
    let completedUpdates = 0;
    let hasErrors = false;

    editedData.forEach(patient => {
      // Clean the patient data before sending
      const cleanPatient: Inpatient = {
        patientId: patient.patientId,
        firstName: this.cleanValue(patient.firstName),
        surname: this.cleanValue(patient.surname),
        gender: this.cleanValue(patient.gender) || 'Male',
        dateOfBirth: patient.dateOfBirth && patient.dateOfBirth !== '-' ? new Date(patient.dateOfBirth).toISOString() : new Date().toISOString(),
        nicNumber: this.cleanValue(patient.nicNumber),
        address: this.cleanValue(patient.address),
        phoneHome: this.cleanValue(patient.phoneHome),
        phoneMobile: this.cleanValue(patient.phoneMobile),
        occupation: this.cleanValue(patient.occupation),
        civilStatus: this.cleanValue(patient.civilStatus) || 'Unmarried',
        accountType: this.cleanValue(patient.accountType) || 'Individual',
        companyId: this.cleanValue(patient.companyId),
        companyName: this.cleanValue(patient.companyName),
        modDate: new Date().toISOString().split('T')[0]
      };

      this.inpatientService.updateInpatient(patient.patientId, cleanPatient).subscribe({
        next: (response) => {
          console.log(`Patient ${patient.patientId} updated successfully:`, response);
          completedUpdates++;
          
          if (completedUpdates === editedData.length && !hasErrors) {
            console.log('All patients updated successfully');
            this.editedPatients.clear();
            this.isLoading = false;
            this.close();
            window.location.reload();
          }
        },
        error: (error) => {
          console.error(`Error updating patient ${patient.patientId}:`, error);
          hasErrors = true;
          completedUpdates++;
          
          if (completedUpdates === editedData.length) {
            console.log('Some updates failed. Please check the console for details.');
            this.isLoading = false;
          }
        }
      });
    });
  }

  close() {
    this.dialogRef.close();
  }
}