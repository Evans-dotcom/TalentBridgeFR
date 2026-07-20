import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Application } from 'src/app/core/models/application.model';
import { Job } from 'src/app/core/models/job.model';
import { AuthResponse } from 'src/app/core/models/user.model';
import { ApplicationService } from 'src/app/core/services/application.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobService } from 'src/app/core/services/job.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: AuthResponse | null = null;
  recentJobs: Job[] = [];
  recentApplications: Application[] = [];
  hasPaid = false;
  totalApplications = 0;
  totalJobs = 0;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.hasPaid = this.authService.hasPaid();
    this.loadData();
  }

  loadData(): void {
    this.jobService.getActiveJobs().subscribe({
      next: (jobs) => {
        this.recentJobs = jobs.slice(0, 5);
        this.totalJobs = jobs.length;
      }
    });

    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        this.recentApplications = apps.slice(0, 5);
        this.totalApplications = apps.length;
      }
    });
  }

  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`;
  }
}