import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, JobRequest } from '../models/job.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getActiveJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs/public`);
  }

  getJobById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/jobs/public/${id}`);
  }

  searchJobs(keyword?: string, location?: string, jobType?: string, industry?: string): Observable<Job[]> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (location) params = params.set('location', location);
    if (jobType) params = params.set('jobType', jobType);
    if (industry) params = params.set('industry', industry);
    return this.http.get<Job[]>(`${this.apiUrl}/jobs/public/search`, { params });
  }

  createJob(job: JobRequest): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/jobs/admin/create`, job);
  }

  updateJob(id: number, job: JobRequest): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/jobs/admin/update/${id}`, job);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/jobs/admin/delete/${id}`);
  }

  activateJob(id: number): Observable<Job> {
    return this.http.patch<Job>(`${this.apiUrl}/jobs/admin/activate/${id}`, {});
  }

  deactivateJob(id: number): Observable<Job> {
    return this.http.patch<Job>(`${this.apiUrl}/jobs/admin/deactivate/${id}`, {});
  }

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs/admin/all`);
  }
}