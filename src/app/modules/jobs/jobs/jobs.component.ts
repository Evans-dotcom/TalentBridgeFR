import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { Job } from 'src/app/core/models/job.model';
import { JobService } from 'src/app/core/services/job.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  loading = false;
  searchForm: FormGroup;
  jobTypes: string[] = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'];
  industries: string[] = ['Technology', 'Telecommunications', 'Finance', 'Healthcare', 'Education', 'Construction'];

  constructor(
    private jobService: JobService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      keyword: [''],
      location: [''],
      jobType: [''],
      industry: ['']
    });
  }

  ngOnInit(): void {
    this.loadJobs();
    this.searchForm.valueChanges.subscribe(() => this.filterJobs());
  }

  loadJobs(): void {
    this.loading = true;
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

  filterJobs(): void {
    const { keyword, location, jobType, industry } = this.searchForm.value;
    this.filteredJobs = this.jobs.filter(job => {
      let match = true;
      if (keyword) {
        match = match && (job.title.toLowerCase().includes(keyword.toLowerCase()) ||
                          job.company.toLowerCase().includes(keyword.toLowerCase()) ||
                          job.description.toLowerCase().includes(keyword.toLowerCase()));
      }
      if (location) {
        match = match && job.location.toLowerCase().includes(location.toLowerCase());
      }
      if (jobType) {
        match = match && job.jobType === jobType;
      }
      if (industry) {
        match = match && job.industry === industry;
      }
      return match;
    });
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.filteredJobs = this.jobs;
  }
}