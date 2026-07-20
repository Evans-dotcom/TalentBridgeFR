import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { AuthLayoutComponent } from '../../layouts/auth-layout/auth-layout.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginComponent } from './logins/logins.component';
import { SignupComponent } from './signupcomponent/signupcomponent';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, data: { title: 'Login' } },
      { path: 'register', component: SignupComponent, data: { title: 'Register' } },
      { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Forgot Password' } },
      { path: 'reset-password', component: ResetPasswordComponent, data: { title: 'Reset Password' } },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    AuthLayoutComponent,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ]
})
export class AuthModule { }