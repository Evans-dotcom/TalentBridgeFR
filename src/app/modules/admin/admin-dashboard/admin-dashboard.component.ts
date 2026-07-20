import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { PaymentService } from '../../../core/services/payment.service';
import { CVService } from '../../../core/services/cv.service';
import { Job, JobRequest } from '../../../core/models/job.model';
import { Application } from '../../../core/models/application.model';
import { Payment } from '../../../core/models/payment.model';
import { CV } from '../../../core/models/cv.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  user: any;
  activeSection = 'dashboard';
  loading = false;

  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { id: 'jobs', label: 'Jobs', icon: 'fas fa-briefcase' },
    { id: 'applications', label: 'Applications', icon: 'fas fa-file-alt' },
    { id: 'users', label: 'Users', icon: 'fas fa-users' },
    { id: 'payments', label: 'Payments', icon: 'fas fa-credit-card' },
    { id: 'cvs', label: 'CVs', icon: 'fas fa-file-pdf' }
  ];

  // Stats
  stats = {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0
  };

  // Jobs
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  jobSearchTerm = '';
  showJobForm = false;
  editingJob: Job | null = null;
  jobForm: JobRequest = {
    title: '',
    company: '',
    location: '',
    salaryRange: '',
    description: '',
    requirements: '',
    jobType: '',
    industry: '',
    experienceLevel: '',
    educationLevel: '',
    expiresAt: ''
  };
  jobSaving = false;
  jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'];
  industries = ['Technology', 'Telecommunications', 'Finance', 'Healthcare', 'Education', 'Construction', 'Retail', 'Manufacturing'];
  experienceLevels = ['Entry Level', 'Mid-Level', 'Senior', 'Lead', 'Manager', 'Director'];
  educationLevels = ['High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];

  // Applications
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  appSearchTerm = '';
  appStatusFilter = '';
  appStatuses = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'];

  // Users
  users: any[] = [];
  filteredUsers: any[] = [];
  userSearchTerm = '';
  roles = ['USER', 'ADMIN', 'EMPLOYER'];

  // Payments
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  paymentSearchTerm = '';
  paymentStatusFilter = '';
  paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'];

  // CVs
  cvs: CV[] = [];
  filteredCvs: CV[] = [];
  cvSearchTerm = '';
  cvTypes = ['UPLOADED', 'MANUAL', 'AI_GENERATED'];

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private paymentService: PaymentService,
    private cvService: CVService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.loadJobs();
    this.loadApplications();
    this.loadUsers();
    this.loadPayments();
    this.loadCVs();
  }

  setSection(section: string): void {
    this.activeSection = section;
    if (section === 'jobs') this.loadJobs();
    if (section === 'applications') this.loadApplications();
    if (section === 'users') this.loadUsers();
    if (section === 'payments') this.loadPayments();
    if (section === 'cvs') this.loadCVs();
  }

  // ============================================================
  // DASHBOARD STATS
  // ============================================================
  loadStats(): void {
    this.jobService.getActiveJobs().subscribe({
      next: (jobs) => {
        this.stats.activeJobs = jobs.length;
        this.stats.totalJobs = jobs.length;
      }
    });

    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        this.stats.totalApplications = apps.length;
        this.stats.pendingApplications = apps.filter(a => a.status === 'PENDING').length;
      }
    });
  }

  // ============================================================
  // JOBS MANAGEMENT
  // ============================================================
  loadJobs(): void {
    this.loading = true;
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.filteredJobs = jobs;
        this.loading = false;
        this.loadStats();
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load jobs');
      }
    });
  }

  filterJobs(): void {
    this.filteredJobs = this.jobs.filter(j =>
      !this.jobSearchTerm ||
      j.title.toLowerCase().includes(this.jobSearchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(this.jobSearchTerm.toLowerCase()) ||
      j.location.toLowerCase().includes(this.jobSearchTerm.toLowerCase())
    );
  }

  openCreateJob(): void {
    this.editingJob = null;
    this.jobForm = {
      title: '',
      company: '',
      location: '',
      salaryRange: '',
      description: '',
      requirements: '',
      jobType: '',
      industry: '',
      experienceLevel: '',
      educationLevel: '',
      expiresAt: ''
    };
    this.showJobForm = true;
  }

  openEditJob(job: Job): void {
    this.editingJob = job;
    this.jobForm = {
      title: job.title,
      company: job.company,
      location: job.location,
      salaryRange: job.salaryRange || '',
      description: job.description,
      requirements: job.requirements,
      jobType: job.jobType,
      industry: job.industry,
      experienceLevel: job.experienceLevel,
      educationLevel: job.educationLevel,
      expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : ''
    };
    this.showJobForm = true;
  }

  closeJobForm(): void {
    this.showJobForm = false;
    this.editingJob = null;
  }

  saveJob(): void {
    if (!this.jobForm.title || !this.jobForm.company || !this.jobForm.location) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    this.jobSaving = true;
    const request = this.editingJob
      ? this.jobService.updateJob(this.editingJob.id, this.jobForm)
      : this.jobService.createJob(this.jobForm);

    request.subscribe({
      next: () => {
        this.jobSaving = false;
        this.toastr.success(this.editingJob ? 'Job updated successfully!' : 'Job created successfully!');
        this.closeJobForm();
        this.loadJobs();
      },
      error: (err) => {
        this.jobSaving = false;
        this.toastr.error('Failed to save job: ' + (err.error || 'Unknown error'));
      }
    });
  }

  deleteJob(id: number): void {
    if (!confirm('Are you sure you want to delete this job?')) return;
    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.toastr.success('Job deleted successfully!');
        this.loadJobs();
      },
      error: () => this.toastr.error('Failed to delete job')
    });
  }

  toggleJobStatus(job: Job): void {
    const action = job.isActive ? this.jobService.deactivateJob(job.id) : this.jobService.activateJob(job.id);
    action.subscribe({
      next: () => {
        this.toastr.success(job.isActive ? 'Job deactivated' : 'Job activated');
        this.loadJobs();
      },
      error: () => this.toastr.error('Failed to update job status')
    });
  }

  // ============================================================
  // APPLICATIONS MANAGEMENT
  // ============================================================
  loadApplications(): void {
    this.loading = true;
    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.filteredApplications = apps;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load applications');
      }
    });
  }

  filterApplications(): void {
    this.filteredApplications = this.applications.filter(a => {
      const matchSearch = !this.appSearchTerm ||
        a.jobTitle.toLowerCase().includes(this.appSearchTerm.toLowerCase()) ||
        a.company.toLowerCase().includes(this.appSearchTerm.toLowerCase()) ||
        a.referenceNumber.toLowerCase().includes(this.appSearchTerm.toLowerCase());
      const matchStatus = !this.appStatusFilter || a.status === this.appStatusFilter;
      return matchSearch && matchStatus;
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'badge-pending',
      'REVIEWED': 'badge-reviewed',
      'ACCEPTED': 'badge-accepted',
      'REJECTED': 'badge-rejected'
    };
    return colors[status] || 'badge-pending';
  }

  // ============================================================
  // USERS MANAGEMENT
  // ============================================================
  loadUsers(): void {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
        this.stats.totalUsers = users.length;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load users');
      }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(u =>
      !this.userSearchTerm ||
      u.firstName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      u.phoneNumber.includes(this.userSearchTerm)
    );
  }

  assignRole(userId: number, roleName: string): void {
    this.authService.assignRole(userId, roleName).subscribe({
      next: () => {
        this.toastr.success('Role assigned successfully!');
        this.loadUsers();
      },
      error: () => this.toastr.error('Failed to assign role')
    });
  }
  onRoleChange(userId: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.assignRole(userId, target.value);
  }

  // ============================================================
  // PAYMENTS MANAGEMENT
  // ============================================================
  loadPayments(): void {
    this.loading = true;
    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.filteredPayments = payments;
        this.loading = false;
        this.stats.totalPayments = payments.length;
        this.stats.totalRevenue = payments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load payments');
      }
    });
  }

  filterPayments(): void {
    this.filteredPayments = this.payments.filter(p => {
      const matchSearch = !this.paymentSearchTerm ||
        p.paymentReference?.toLowerCase().includes(this.paymentSearchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(this.paymentSearchTerm.toLowerCase()) ||
        p.mpesaReceiptNumber?.toLowerCase().includes(this.paymentSearchTerm.toLowerCase());
      const matchStatus = !this.paymentStatusFilter || p.status === this.paymentStatusFilter;
      return matchSearch && matchStatus;
    });
  }

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'badge-pending',
      'PAID': 'badge-accepted',
      'FAILED': 'badge-rejected',
      'CANCELLED': 'badge-rejected'
    };
    return colors[status] || 'badge-pending';
  }

  // ============================================================
  // CVs MANAGEMENT
  // ============================================================
  loadCVs(): void {
    this.loading = true;
    this.cvService.getMyCVs().subscribe({
      next: (cvs) => {
        this.cvs = cvs;
        this.filteredCvs = cvs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load CVs');
      }
    });
  }

  filterCVs(): void {
    this.filteredCvs = this.cvs.filter(c => {
      const matchSearch = !this.cvSearchTerm ||
        c.cvType.toLowerCase().includes(this.cvSearchTerm.toLowerCase());
      return matchSearch;
    });
  }

  deleteCV(id: number): void {
    if (!confirm('Are you sure you want to delete this CV?')) return;
    this.cvService.deleteCV(id).subscribe({
      next: () => {
        this.toastr.success('CV deleted successfully!');
        this.loadCVs();
      },
      error: () => this.toastr.error('Failed to delete CV')
    });
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================
  formatPrice(price: number): string {
    if (!price) return 'KES 0';
    if (price >= 1000000) return `KES ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `KES ${(price / 1000).toFixed(0)}K`;
    return `KES ${price}`;
  }

  goToWebsite(): void {
    this.router.navigateByUrl('/');
  }

  getInitials(firstName: string, lastName: string): string {
    return ((firstName || '')[0] + (lastName || '')[0]).toUpperCase() || 'U';
  }

  getCvTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'UPLOADED': '📄',
      'MANUAL': '✍️',
      'AI_GENERATED': '🤖'
    };
    return icons[type] || '📄';
  }
}