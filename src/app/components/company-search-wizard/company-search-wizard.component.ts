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
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-company-search-wizard',
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
  templateUrl: './company-search-wizard.component.html',
  styleUrls: ['./company-search-wizard.component.scss']
})
export class CompanySearchWizardComponent implements OnInit {
  dataSource = new MatTableDataSource<Company>([]);
  searchType = 'companyId';
  searchValue = '';
  displayedColumns = ['companyId', 'companyFullName', 'companyShortName', 'companyAddress', 'contactPerson', 'phoneNumber', 'discountAllowed'];
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<CompanySearchWizardComponent>,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.isLoading = true;
    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.dataSource.data = companies;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.isLoading = false;
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
    this.dataSource.filterPredicate = (data: Company, filter: string) => {
      switch (this.searchType) {
        case 'companyId':
          return data.companyId?.toLowerCase().includes(filter) || false;
        case 'companyFullName':
          return data.companyFullName?.toLowerCase().includes(filter) || false;
        case 'companyShortName':
          return data.companyShortName?.toLowerCase().includes(filter) || false;
        case 'contactPerson':
          return data.contactPerson?.toLowerCase().includes(filter) || false;
        default:
          return false;
      }
    };
    this.dataSource.filter = filterValue;
  }

  selectCompany(company: Company) {
    this.dialogRef.close(company);
  }

  close() {
    this.dialogRef.close();
  }
}