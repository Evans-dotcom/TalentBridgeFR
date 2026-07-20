import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { Application } from '../../../core/models/application.model';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,ReactiveFormsModule],
  templateUrl: 'my-applications.component.html',
  styleUrls: ['my-applications.component.scss']
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  loading = true;
  error = '';
  success = '';
  searchTerm = '';
  statusFilter = '';
  statuses = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'];

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';
    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.filteredApplications = apps;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications: ' + (err.error || 'Unknown error');
        this.loading = false;
      }
    });
  }

  filterApplications(): void {
    this.filteredApplications = this.applications.filter(app => {
      const matchSearch = !this.searchTerm ||
        app.jobTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        app.referenceNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || app.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: {[key: string]: string} = {
      'PENDING': 'status-pending',
      'REVIEWED': 'status-reviewed',
      'ACCEPTED': 'status-accepted',
      'REJECTED': 'status-rejected'
    };
    return classes[status] || 'status-pending';
  }

  getStatusIcon(status: string): string {
    const icons: {[key: string]: string} = {
      'PENDING': '⏳',
      'REVIEWED': '📋',
      'ACCEPTED': '✅',
      'REJECTED': '❌'
    };
    return icons[status] || '📌';
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'PENDING': 'Under Review',
      'REVIEWED': 'Reviewed',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Not Selected'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}