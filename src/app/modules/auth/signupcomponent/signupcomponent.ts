import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './signupcomponent.html',
  styleUrls: ['./signupcomponent.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  serverWaking = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) return;

    this.loading = true;
    this.serverWaking = false;
    this.error = '';
    this.success = '';

    const wakingTimer = setTimeout(() => {
      if (this.loading) {
        this.serverWaking = true;
      }
    }, 5000);

    this.authService.signup(this.signupForm.value).subscribe({
      next: () => {
        clearTimeout(wakingTimer);
        this.loading = false;
        this.serverWaking = false;
        this.success = 'Account created successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        clearTimeout(wakingTimer);
        this.loading = false;
        this.serverWaking = false;
        this.error = this.extractError(err);
      }
    });
  }

  private extractError(err: any): string {
    if (!err) return 'Something went wrong. Please try again.';

    if (err.error?.message) return err.error.message;

    if (err.error?.errors) {
      return Object.values(err.error.errors).join('. ');
    }

    if (typeof err.error === 'string' && err.error.length > 0) {
      return err.error;
    }

    if (err.status === 0) {
      return 'Cannot connect to server. Please check your internet connection.';
    }

    if (err.status === 409) {
      return 'An account with this email or phone number already exists. Please login instead.';
    }

    if (err.status === 400) {
      return 'Please check your details and try again.';
    }

    if (err.status === 500) {
      return 'Server error. Please try again in a moment.';
    }

    return 'Something went wrong. Please try again.';
  }
}