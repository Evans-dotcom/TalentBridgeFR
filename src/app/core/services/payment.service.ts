import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentRequest, MpesaPaymentResponse, PesalinkInitiateResponse, PaymentStatusResponse } from '../models/payment.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  initiateMpesaPayment(request: PaymentRequest): Observable<MpesaPaymentResponse> {
    return this.http.post<MpesaPaymentResponse>(`${this.apiUrl}/payments/mpesa/initiate`, request);
  }

  initiatePesalinkPayment(): Observable<PesalinkInitiateResponse> {
    return this.http.post<PesalinkInitiateResponse>(`${this.apiUrl}/payments/pesalink/initiate`, {});
  }

  getPaymentStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/payments/status`);
  }

  getPaymentAttemptStatus(paymentId: number): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(`${this.apiUrl}/payments/${paymentId}/status`);
  }

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/payments/my-payments`);
  }
}