import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Inpatient, InpatientResponse } from '../models/inpatient.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class InpatientService {
  private currentPatientSubject = new BehaviorSubject<Inpatient | null>(null);
  public currentPatient$ = this.currentPatientSubject.asObservable();

  constructor(private http: HttpClient) {}



  getInpatients(pageNumber: number = 1, pageSize: number = 10): Observable<InpatientResponse> {
    return this.http.get<InpatientResponse>(`${API_CONFIG.BASE_URL}/api/Inpatients`, {
      params: { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() }
    }).pipe(catchError(this.handleError));
  }

  // Navigation methods using the main API endpoint
  private allInpatients: Inpatient[] = [];
  private currentIndex = -1;

  private loadAllInpatients(): Observable<Inpatient[]> {
    if (this.allInpatients.length > 0) {
      return new Observable(observer => {
        observer.next(this.allInpatients);
        observer.complete();
      });
    }
    
    return this.getInpatients(1, 10).pipe(
      map(response => {
        this.allInpatients = response.data;
        return this.allInpatients;
      })
    );
  }

  getFirstInpatient(): Observable<Inpatient> {
    return this.loadAllInpatients().pipe(
      map(patients => {
        this.currentIndex = 0;
        return patients[0];
      })
    );
  }

  getLastInpatient(): Observable<Inpatient> {
    return this.loadAllInpatients().pipe(
      map(patients => {
        this.currentIndex = patients.length - 1;
        return patients[this.currentIndex];
      })
    );
  }

  getNextInpatient(currentId: string): Observable<Inpatient> {
    return this.loadAllInpatients().pipe(
      map(patients => {
        const index = patients.findIndex(p => p.patientId === currentId);
        if (index >= 0 && index < patients.length - 1) {
          this.currentIndex = index + 1;
          return patients[this.currentIndex];
        }
        throw new Error('No next record');
      })
    );
  }

  getPreviousInpatient(currentId: string): Observable<Inpatient> {
    return this.loadAllInpatients().pipe(
      map(patients => {
        const index = patients.findIndex(p => p.patientId === currentId);
        if (index > 0) {
          this.currentIndex = index - 1;
          return patients[this.currentIndex];
        }
        throw new Error('No previous record');
      })
    );
  }



  // Navigation helpers
  setCurrentPatient(patient: Inpatient): void {
    this.currentPatientSubject.next(patient);
  }

  getCurrentPatient(): Inpatient | null {
    return this.currentPatientSubject.value;
  }

  getInpatientById(id: string): Observable<Inpatient> {
    return this.http.get<Inpatient>(`${API_CONFIG.BASE_URL}/api/Inpatients/${id}`)
      .pipe(catchError(this.handleError));
  }

  // generatePatientId(): Observable<string> {
  //   return this.http.get<{nextId: string}>(`${API_CONFIG.BASE_URL}/api/Inpatients/generate-id`, {
  //     headers: this.getAuthHeaders()
  //   }).pipe(
  //     map(response => response.nextId),
  //     catchError(this.handleError)
  //   );
  // }

  createInpatient(inpatient: Inpatient): Observable<Inpatient> {
    return this.http.post<Inpatient>(`${API_CONFIG.BASE_URL}/api/Inpatients`, inpatient)
      .pipe(catchError(this.handleError));
  }

  updateInpatient(id: string, inpatient: Inpatient): Observable<Inpatient> {
    return this.http.put<Inpatient>(`${API_CONFIG.BASE_URL}/api/Inpatients/${id}`, inpatient)
      .pipe(catchError(this.handleError));
  }

  deleteInpatient(id: string): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.BASE_URL}/api/Inpatients/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('InpatientService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}