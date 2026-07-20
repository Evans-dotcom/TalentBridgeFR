import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private publicEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/jobs/public'
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const isPublic = this.publicEndpoints.some(endpoint => request.url.includes(endpoint));

        if (error.status === 401 && !isPublic) {
          const returnUrl = this.router.url;
          this.authService.logout(false);
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl, sessionExpired: true }
          });
        }

        return throwError(() => error);
      })
    );
  }
}