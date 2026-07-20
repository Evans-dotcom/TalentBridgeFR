import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Application, ApplicationRequest } from '../models/application.model';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  applyForJob(application: ApplicationRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/applications/apply`, application);
  }

  getMyApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/applications/my-applications`);
  }
}