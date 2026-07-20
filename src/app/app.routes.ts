import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./modules/jobs/jobs/jobs.component').then(m => m.JobsComponent)
      },
      {
        path: 'jobs/:id',
        loadComponent: () => import('./modules/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent)
      },
      {
        path: 'apply-job/:id',
        loadComponent: () => import('./modules/jobs/apply-job/apply-job.component').then(m => m.ApplyJobComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard/cvs',
        loadComponent: () => import('./modules/dashboard/my-cvs/my-cvs.component').then(m => m.MyCVsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard/applications',
        loadComponent: () => import('./modules/dashboard/my-applications/my-applications.component').then(m => m.MyApplicationsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard/profile',
        loadComponent: () => import('./modules/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard/payments',
        loadComponent: () => import('./modules/payments/payments.component').then(m => m.MyPaymentsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'admin',
        loadComponent: () => import('./modules/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [AuthGuard, AdminGuard]
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/logins/logins.component').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./modules/auth/signupcomponent/signupcomponent').then(m => m.SignupComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];