import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hasPaid: boolean;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
        })
      );
  }

  signup(userData: SignupRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/auth/signup`, userData);
  }

  logout(redirect: boolean = true): void {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
  this.currentUserSubject.next(null);
  if (redirect) {
    this.router.navigate(['/auth/login']);
  }
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  hasPaid(): boolean {
    const user = this.getCurrentUser();
    return user?.hasPaid || false;
  }

  getUser(): AuthResponse | null {
    return this.getCurrentUser();
  }

  updateUserHasPaid(): void {
  const currentUser = this.getCurrentUser();
  if (currentUser) {
    const updatedUser: AuthResponse = {
      ...currentUser,
      hasPaid: true
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }
}
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
getAllUsers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/auth/admin/users`);
}

assignRole(userId: number, roleName: string): Observable<string> {
  return this.http.put<string>(`${this.apiUrl}/auth/admin/assign-role/${userId}?roleName=${roleName}`, {});
}
}
