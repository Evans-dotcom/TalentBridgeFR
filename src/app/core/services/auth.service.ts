import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
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
    console.log('[Auth] service initializing, apiUrl =', this.apiUrl);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('[Auth] restored user from localStorage', parsed);
        this.currentUserSubject.next(parsed);
      } catch (err) {
        console.error('[Auth] failed to parse stored user, clearing localStorage', err);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    } else {
      console.log('[Auth] no stored user found in localStorage');
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const url = `${this.apiUrl}/auth/login`;
    console.log('[Auth] login() called, url =', url, 'email =', credentials.email);
    return this.http.post<AuthResponse>(url, credentials)
      .pipe(
        tap(response => {
          console.log('[Auth] login success', response);
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('[Auth] login failed');
          console.error('[Auth] status =', err.status, 'statusText =', err.statusText);
          console.error('[Auth] url =', err.url);
          console.error('[Auth] error body =', err.error);
          console.error('[Auth] full error object =', err);
          if (err.status === 0) {
            console.error('[Auth] status 0 usually means CORS block or server unreachable (ERR_CONNECTION_REFUSED, DNS failure, mixed content)');
          }
          return throwError(() => err);
        })
      );
  }

  signup(userData: SignupRequest): Observable<string> {
    const url = `${this.apiUrl}/auth/signup`;
    console.log('[Auth] signup() called, url =', url, 'email =', userData.email);
    return this.http.post<string>(url, userData)
      .pipe(
        tap(response => {
          console.log('[Auth] signup success', response);
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('[Auth] signup failed');
          console.error('[Auth] status =', err.status, 'statusText =', err.statusText);
          console.error('[Auth] url =', err.url);
          console.error('[Auth] error body =', err.error);
          console.error('[Auth] full error object =', err);
          return throwError(() => err);
        })
      );
  }

  logout(redirect: boolean = true): void {
    console.log('[Auth] logout() called, redirect =', redirect);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    if (redirect) {
      console.log('[Auth] navigating to /auth/login after logout');
      this.router.navigate(['/auth/login']);
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[Auth] getToken() called, no token found in localStorage');
    }
    return token;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const result = !!this.getToken();
    console.log('[Auth] isAuthenticated() =', result);
    return result;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    const result = user?.role === 'ADMIN';
    console.log('[Auth] isAdmin() =', result, 'user role =', user?.role);
    return result;
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
      console.log('[Auth] updateUserHasPaid(), updated user =', updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    } else {
      console.warn('[Auth] updateUserHasPaid() called but no current user is set');
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    const result = user?.role === role;
    console.log('[Auth] hasRole(', role, ') =', result, 'user role =', user?.role);
    return result;
  }

  getAllUsers(): Observable<any[]> {
    const url = `${this.apiUrl}/auth/admin/users`;
    console.log('[Auth] getAllUsers() called, url =', url);
    return this.http.get<any[]>(url)
      .pipe(
        tap(users => console.log('[Auth] getAllUsers success, count =', users?.length)),
        catchError((err: HttpErrorResponse) => {
          console.error('[Auth] getAllUsers failed', err.status, err.error);
          return throwError(() => err);
        })
      );
  }

  assignRole(userId: number, roleName: string): Observable<string> {
    const url = `${this.apiUrl}/auth/admin/assign-role/${userId}?roleName=${roleName}`;
    console.log('[Auth] assignRole() called, url =', url);
    return this.http.put<string>(url, {})
      .pipe(
        tap(response => console.log('[Auth] assignRole success', response)),
        catchError((err: HttpErrorResponse) => {
          console.error('[Auth] assignRole failed', err.status, err.error);
          return throwError(() => err);
        })
      );
  }
}