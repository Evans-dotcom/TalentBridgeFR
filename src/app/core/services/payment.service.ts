import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, interval, switchMap, takeWhile, take } from 'rxjs';
import { Payment, PaymentRequest, MpesaPaymentResponse, PesalinkInitiateResponse, PaymentStatusResponse } from '../models/payment.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  initiateMpesaPayment(request: PaymentRequest): Observable<MpesaPaymentResponse> {
    console.log('[PaymentService] Initiating M-Pesa payment:', request);
    return this.http.post<MpesaPaymentResponse>(`${this.apiUrl}/payments/mpesa/initiate`, request).pipe(
      tap(response => {
        console.log('[PaymentService] M-Pesa initiate response:', response);
        console.log('[PaymentService] CheckoutRequestID:', (response as any).checkoutRequestId || (response as any).CheckoutRequestID);
        console.log('[PaymentService] MerchantRequestID:', (response as any).merchantRequestId || (response as any).MerchantRequestID);
        console.log('[PaymentService] ResponseCode:', (response as any).responseCode || (response as any).ResponseCode);
        console.log('[PaymentService] ResponseDescription:', (response as any).responseDescription || (response as any).ResponseDescription);
      }),
      catchError(err => {
        console.error('[PaymentService] M-Pesa initiate FAILED:', err);
        console.error('[PaymentService] Status:', err.status);
        console.error('[PaymentService] Error body:', err.error);
        return throwError(() => err);
      })
    );
  }

  initiatePesalinkPayment(): Observable<PesalinkInitiateResponse> {
    console.log('[PaymentService] Initiating Pesalink payment');
    return this.http.post<PesalinkInitiateResponse>(`${this.apiUrl}/payments/pesalink/initiate`, {}).pipe(
      tap(response => {
        console.log('[PaymentService] Pesalink initiate response:', response);
      }),
      catchError(err => {
        console.error('[PaymentService] Pesalink initiate FAILED:', err);
        console.error('[PaymentService] Status:', err.status);
        console.error('[PaymentService] Error body:', err.error);
        return throwError(() => err);
      })
    );
  }

  getPaymentStatus(): Observable<boolean> {
    console.log('[PaymentService] Checking payment status (boolean)');
    return this.http.get<boolean>(`${this.apiUrl}/payments/status`).pipe(
      tap(status => {
        console.log('[PaymentService] Payment status (boolean):', status);
      }),
      catchError(err => {
        console.error('[PaymentService] getPaymentStatus FAILED:', err);
        return throwError(() => err);
      })
    );
  }

  getPaymentAttemptStatus(paymentId: number): Observable<PaymentStatusResponse> {
    console.log('[PaymentService] Polling payment attempt status for paymentId:', paymentId);
    return this.http.get<PaymentStatusResponse>(`${this.apiUrl}/payments/${paymentId}/status`).pipe(
      tap(response => {
        console.log('[PaymentService] Payment attempt status response:', response);
        console.log('[PaymentService] Status value:', (response as any).status);
        console.log('[PaymentService] Paid:', (response as any).paid);
        console.log('[PaymentService] Amount:', (response as any).amount);
      }),
      catchError(err => {
        console.error('[PaymentService] getPaymentAttemptStatus FAILED for paymentId:', paymentId, err);
        return throwError(() => err);
      })
    );
  }

  pollPaymentStatus(paymentId: number, intervalMs = 5000, maxAttempts = 12): Observable<PaymentStatusResponse> {
    console.log(`[PaymentService] Starting polling for paymentId: ${paymentId}, every ${intervalMs}ms, max ${maxAttempts} attempts`);
    let attempts = 0;

    return interval(intervalMs).pipe(
      take(maxAttempts),
      switchMap(() => {
        attempts++;
        console.log(`[PaymentService] Poll attempt ${attempts}/${maxAttempts} for paymentId: ${paymentId}`);
        return this.getPaymentAttemptStatus(paymentId);
      }),
      tap(response => {
        const status = (response as any).status;
        console.log(`[PaymentService] Poll result — status: ${status}, attempt: ${attempts}`);
        if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
          console.log('[PaymentService] Terminal status reached, stopping poll:', status);
        }
      }),
      takeWhile(response => {
        const status = (response as any).status;
        const keepPolling = status !== 'COMPLETED' && status !== 'FAILED' && status !== 'CANCELLED';
        if (!keepPolling) {
          console.log('[PaymentService] Polling stopped — terminal status:', status);
        }
        return keepPolling;
      }, true),
      catchError(err => {
        console.error('[PaymentService] Polling error:', err);
        return throwError(() => err);
      })
    );
  }

  getMyPayments(): Observable<Payment[]> {
    console.log('[PaymentService] Fetching my payments');
    return this.http.get<Payment[]>(`${this.apiUrl}/payments/my-payments`).pipe(
      tap(payments => {
        console.log('[PaymentService] My payments count:', payments?.length);
        console.log('[PaymentService] My payments:', payments);
      }),
      catchError(err => {
        console.error('[PaymentService] getMyPayments FAILED:', err);
        return throwError(() => err);
      })
    );
  }
}