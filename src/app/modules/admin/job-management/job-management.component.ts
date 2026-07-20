import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Job } from 'src/app/core/models/job.model';
import { JobService } from 'src/app/core/services/job.service';

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css']
})
export class JobManagementComponent implements OnInit {
  jobs: Job[] = [];
  editingJob: Job | null = null;
  loading = false;
  submitting = false;
  error = '';
  success = '';
  showForm = false;
  jobForm: FormGroup;
  jobTypes: string[] = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'];
  industries: string[] = ['Technology', 'Telecommunications', 'Finance', 'Healthcare', 'Education', 'Construction'];
  experienceLevels: string[] = ['Entry Level', 'Mid-Level', 'Senior', 'Lead', 'Manager'];
  educationLevels: string[] = ['High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];

  constructor(
    private jobService: JobService,
    private fb: FormBuilder
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      salaryRange: [''],
      description: ['', Validators.required],
      requirements: ['', Validators.required],
      jobType: ['', Validators.required],
      industry: ['', Validators.required],
      experienceLevel: ['', Validators.required],
      educationLevel: ['', Validators.required],
      expiresAt: ['']
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.editingJob = null;
    this.jobForm.reset();
    this.showForm = true;
  }

  editJob(job: Job): void {
    this.editingJob = job;
    this.jobForm.patchValue(job);
    if (job.expiresAt) {
      this.jobForm.patchValue({ expiresAt: job.expiresAt.toString().split('T')[0] });
    }
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingJob = null;
    this.jobForm.reset();
    this.error = '';
    this.success = '';
  }

  submitJob(): void {
    if (this.jobForm.invalid) return;
    this.submitting = true;
    this.error = '';
    this.success = '';

    const jobData = this.jobForm.value;

    if (this.editingJob) {
      this.jobService.updateJob(this.editingJob.id, jobData).subscribe({
        next: () => {
          this.submitting = false;
          this.success = 'Job updated successfully!';
          this.loadJobs();
          setTimeout(() => this.cancelForm(), 2000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = 'Failed to update job: ' + err.error;
        }
      });
    } else {
      this.jobService.createJob(jobData).subscribe({
        next: () => {
          this.submitting = false;
          this.success = 'Job created successfully!';
          this.loadJobs();
          setTimeout(() => this.cancelForm(), 2000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = 'Failed to create job: ' + err.error;
        }
      });
    }
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this job?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.success = 'Job deleted successfully!';
          this.loadJobs();
        },
        error: (err) => {
          this.error = 'Failed to delete job: ' + err.error;
        }
      });
    }
  }

  toggleJobStatus(job: Job): void {
    if (job.isActive) {
      this.jobService.deactivateJob(job.id).subscribe({
        next: () => {
          this.success = 'Job deactivated!';
          this.loadJobs();
        },
        error: (err) => {
          this.error = 'Failed to deactivate job: ' + err.error;
        }
      });
    } else {
      this.jobService.activateJob(job.id).subscribe({
        next: () => {
          this.success = 'Job activated!';
          this.loadJobs();
        },
        error: (err) => {
          this.error = 'Failed to activate job: ' + err.error;
        }
      });
    }
  }
}