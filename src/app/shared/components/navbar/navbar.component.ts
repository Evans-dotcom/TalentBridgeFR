import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  profileDropdownOpen = false;
  isMobileSearchOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  isAdminPage = false;
  isScrolled = false;
  searchFocused = false;
  searchQuery = '';
  applicationCount = 3;
  user: any = null;

  private avatarColors = [
    'linear-gradient(135deg, #4f46e5, #7c3aed)',
    'linear-gradient(135deg, #0891b2, #06b6d4)',
    'linear-gradient(135deg, #059669, #34d399)',
    'linear-gradient(135deg, #d97706, #f59e0b)',
    'linear-gradient(135deg, #dc2626, #ef4444)',
    'linear-gradient(135deg, #7c3aed, #a855f7)'
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.user = user;
      this.isAdmin = user?.role === 'ADMIN' || false;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminPage = event.url.startsWith('/admin');
      this.profileDropdownOpen = false;
      this.mobileMenuOpen = false;
      this.isMobileSearchOpen = false;
    });

    this.isAdminPage = this.router.url.startsWith('/admin');
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      this.profileDropdownOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.isMobileSearchOpen = false;
    }
  }

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    if (this.isMobileSearchOpen) {
      this.mobileMenuOpen = false;
    }
  }

  closeMenu(): void {
    this.mobileMenuOpen = false;
    this.isMobileSearchOpen = false;
  }

  closeDropdown(): void {
    this.profileDropdownOpen = false;
  }

  closeMobileSearch(): void {
    this.isMobileSearchOpen = false;
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/jobs'], { 
        queryParams: { search: this.searchQuery.trim() }
      });
      this.searchQuery = '';
      this.closeMenu();
    }
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  getAvatarGradient(): string {
    if (!this.user) return this.avatarColors[0];
    const index = (this.user.id || 0) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  logout(): void {
    this.authService.logout();
    this.profileDropdownOpen = false;
    this.mobileMenuOpen = false;
    this.router.navigateByUrl('/');
  }
}