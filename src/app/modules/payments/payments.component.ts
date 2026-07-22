import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Payment } from 'src/app/core/models/payment.model';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: 'payments.component.html',
  styleUrls: ['payments.component.scss']
})
export class MyPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  loading = true;
  error = '';
  success = '';
  searchTerm = '';
  statusFilter = '';
  paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'];
  paymentMethods = ['MPESA', 'PESALINK', 'CARD', 'AIRTEL'];
  hasPaid = false;
  stats = {
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  };

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    console.log('[MyPayments] Component initialized');
    this.loadPayments();
    this.checkPaymentStatus();
  }

  loadPayments(): void {
    console.log('[MyPayments] loadPayments() called');
    this.loading = true;
    this.error = '';

    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        console.log('[MyPayments] Payments loaded successfully. Count:', payments?.length);
        console.log('[MyPayments] Payments data:', payments);
        this.payments = payments;
        this.filteredPayments = payments;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('[MyPayments] loadPayments FAILED:', err);
        console.error('[MyPayments] Status:', err.status);
        console.error('[MyPayments] Error body:', err.error);
        this.error = this.extractError(err);
        this.loading = false;
      }
    });
  }

  checkPaymentStatus(): void {
    console.log('[MyPayments] checkPaymentStatus() called');

    this.paymentService.getPaymentStatus().subscribe({
      next: (paid) => {
        console.log('[MyPayments] Payment status (hasPaid):', paid);
        this.hasPaid = paid;
      },
      error: (err) => {
        console.error('[MyPayments] checkPaymentStatus FAILED:', err);
        console.error('[MyPayments] Status:', err.status);
        this.hasPaid = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.payments.length;
    this.stats.paid = this.payments.filter(p => p.status === 'PAID').length;
    this.stats.pending = this.payments.filter(p => p.status === 'PENDING').length;
    this.stats.failed = this.payments.filter(p => p.status === 'FAILED' || p.status === 'CANCELLED').length;
    this.stats.totalAmount = this.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    console.log('[MyPayments] Stats calculated:', this.stats);
  }

  filterPayments(): void {
    console.log('[MyPayments] filterPayments() — searchTerm:', this.searchTerm, '| statusFilter:', this.statusFilter);

    this.filteredPayments = this.payments.filter(p => {
      const matchSearch = !this.searchTerm ||
        (p.paymentReference && p.paymentReference.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.mpesaReceiptNumber && p.mpesaReceiptNumber.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.paymentMethod && p.paymentMethod.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchStatus = !this.statusFilter || p.status === this.statusFilter;
      return matchSearch && matchStatus;
    });

    console.log('[MyPayments] Filtered results count:', this.filteredPayments.length);
  }

  refreshPayments(): void {
    console.log('[MyPayments] Manual refresh triggered');
    this.loadPayments();
    this.checkPaymentStatus();
  }

  private extractError(err: any): string {
    if (err.error?.message) return err.error.message;
    if (typeof err.error === 'string') return err.error;
    if (err.status === 0) return 'Cannot connect to server. Please check your internet connection.';
    if (err.status === 401) return 'Session expired. Please login again.';
    if (err.status === 403) return 'You do not have permission to view payments.';
    return 'Failed to load payments. Please try again.';
  }

  getStatusBadgeClass(status: string): string {
    const classes: {[key: string]: string} = {
      'PENDING': 'status-pending',
      'PAID': 'status-paid',
      'FAILED': 'status-failed',
      'CANCELLED': 'status-failed'
    };
    return classes[status] || 'status-pending';
  }

  getStatusIcon(status: string): string {
    const icons: {[key: string]: string} = {
      'PENDING': '⏳',
      'PAID': '✅',
      'FAILED': '❌',
      'CANCELLED': '🚫'
    };
    return icons[status] || '📌';
  }

  getMethodIcon(method: string): string {
    const icons: {[key: string]: string} = {
      'MPESA': '📱',
      'PESALINK': '🏦',
      'CARD': '💳'
    };
    return icons[method] || '💳';
  }

  getMethodClass(method: string): string {
    const classes: {[key: string]: string} = {
      'MPESA': 'method-mpesa',
      'PESALINK': 'method-pesalink',
      'CARD': 'method-card'
    };
    return classes[method] || 'method-default';
  }

  formatAmount(amount: number): string {
    return 'KES ' + (amount || 0).toLocaleString();
  }

  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getReceiptText(payment: Payment): string {
    if (payment.mpesaReceiptNumber) return 'Receipt: ' + payment.mpesaReceiptNumber;
    if (payment.transactionId) return 'Txn: ' + payment.transactionId.substring(0, 12);
    if (payment.paymentReference) return 'Ref: ' + payment.paymentReference;
    return '—';
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'PENDING': 'Pending',
      'PAID': 'Paid',
      'FAILED': 'Failed',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: {[key: string]: string} = {
      'MPESA': 'M-PESA',
      'PESALINK': 'Pesalink',
      'CARD': 'Card',
      'AIRTEL': 'Airtel Money'
    };
    return labels[method] || method;
  }
}