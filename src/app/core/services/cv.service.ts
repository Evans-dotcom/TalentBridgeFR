import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { CV, CVRequest } from '../models/cv.model';

@Injectable({
  providedIn: 'root'
})
export class CVService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadCV(file: File): Observable<CV> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<CV>(`${this.apiUrl}/cv/upload`, formData);
  }

  createManualCV(content: string): Observable<CV> {
    const request: CVRequest = { content, cvType: 'MANUAL' };
    return this.http.post<CV>(`${this.apiUrl}/cv/create-manual`, request);
  }

  generateAICV(jobDescription: string): Observable<CV> {
    return this.http.post<CV>(`${this.apiUrl}/cv/generate-ai`, jobDescription);
  }

  getMyCVs(): Observable<CV[]> {
    return this.http.get<CV[]>(`${this.apiUrl}/cv/my-cvs`);
  }

  deleteCV(cvId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/cv/delete/${cvId}`);
  }
}