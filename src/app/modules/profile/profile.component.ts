import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthResponse, AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab = 'personal';
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: AuthResponse | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Sample data
  skills: string[] = ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js', 'Spring Boot'];
  recentActivities: any[] = [];
  activeSessions: any[] = [];
  twoFactorEnabled = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSampleData();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: ''
        });
      }
    });
  }

  loadSampleData(): void {
    this.recentActivities = [
      { icon: 'fas fa-briefcase', description: 'Applied for Senior Software Engineer', time: '2 hours ago' },
      { icon: 'fas fa-file-alt', description: 'Uploaded new CV', time: '1 day ago' },
      { icon: 'fas fa-check-circle', description: 'Application reviewed for Frontend Developer', time: '2 days ago' },
      { icon: 'fas fa-credit-card', description: 'Payment of Ksh 500 completed', time: '1 week ago' }
    ];

    this.activeSessions = [
      { id: 1, browser: 'Chrome', device: 'Desktop', location: 'Nairobi, Kenya', lastActive: 'Now', current: true },
      { id: 2, browser: 'Firefox', device: 'Mobile', location: 'Mombasa, Kenya', lastActive: '2 hours ago', current: false },
      { id: 3, browser: 'Safari', device: 'Tablet', location: 'Kisumu, Kenya', lastActive: '1 day ago', current: false }
    ];
  }

  getAvatarColor(): string {
    const colors = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];
    const index = this.currentUser?.userId ? this.currentUser.userId % colors.length : 0;
    return colors[index];
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Simulate API call
    setTimeout(() => {
      this.successMessage = 'Profile updated successfully!';
      this.isLoading = false;
      this.profileForm.markAsPristine();
      setTimeout(() => this.successMessage = '', 3000);
    }, 1500);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.passwordForm.reset();
    this.successMessage = 'Password updated successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    this.successMessage = `Two-factor authentication ${this.twoFactorEnabled ? 'enabled' : 'disabled'}`;
    setTimeout(() => this.successMessage = '', 3000);
  }

  logoutSession(sessionId: number): void {
    this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
    this.successMessage = 'Session logged out successfully';
    setTimeout(() => this.successMessage = '', 3000);
  }

  getFullName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || 'User';
  }

  hasPaid(): boolean {
    return this.currentUser?.hasPaid || false;
  }

  getRole(): string {
    return this.currentUser?.role || 'USER';
  }
}