import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobsComponent } from './jobs/jobs.component';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { ApplyJobComponent } from './apply-job/apply-job.component';


const routes: Routes = [
  { path: '', component: JobsComponent },
  { path: ':id', component: JobDetailComponent },
  { path: ':id/apply', component: ApplyJobComponent }
];

@NgModule({
  declarations: [JobsComponent, JobDetailComponent, ApplyJobComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class JobsModule { }