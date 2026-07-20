export interface Payment {
  createdAt: Date;
  id: number;
  amount: number;
  paymentMethod: 'MPESA' | 'PESALINK' | 'CARD';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  mpesaReceiptNumber?: string;
  paymentReference?: string;
  paymentDate?: Date;
}

export interface PaymentRequest {
  phoneNumber: string;
  paymentMethod: string;
  paymentChannel: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  message: string;
  paymentId?: number;
  amount?: number;
  paymentChannel?: string;
}

export interface PesalinkInitiateResponse {
  success: boolean;
  paymentId?: number;
  paymentReference?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  transactionReference?: string;
  accountExpiresAt?: string;
  message: string;
}

export interface PaymentStatusResponse {
  paymentId: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  message: string;
  mpesaReceiptNumber?: string;
  paymentReference?: string;
}