import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Job } from 'src/app/core/models/job.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { JobService } from 'src/app/core/services/job.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading = true;

  searchTerm = '';
  locationTerm = '';
  selectedJobType = '';

  readonly jobTypes: string[] = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'];

  constructor(
    public authService: AuthService,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.jobService.getActiveJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    const location = this.locationTerm.trim().toLowerCase();

    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = !search
        || job.title.toLowerCase().includes(search)
        || job.company.toLowerCase().includes(search);
      const matchesLocation = !location || job.location.toLowerCase().includes(location);
      const matchesType = !this.selectedJobType || job.jobType === this.selectedJobType;
      return matchesSearch && matchesLocation && matchesType;
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.locationTerm || this.selectedJobType);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.locationTerm = '';
    this.selectedJobType = '';
    this.filteredJobs = this.jobs;
  }

  getBadgeClass(jobType: string): string {
    return 'badge-' + (jobType || '').toLowerCase().trim().replace(/\s+/g, '-');
  }

  getRelativeTime(date: string | Date): string {
    const posted = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    if (diffWeek < 5) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
    return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
  }
}