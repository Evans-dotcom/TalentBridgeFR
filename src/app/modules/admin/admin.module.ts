import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { JobManagementComponent } from './job-management/job-management.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'jobs', component: JobManagementComponent },
];

@NgModule({
  declarations: [
    AdminDashboardComponent,
    JobManagementComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }