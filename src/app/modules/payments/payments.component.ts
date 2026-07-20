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
  paymentMethods = ['MPESA', 'PESALINK', 'CARD'];
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
    this.loadPayments();
    this.checkPaymentStatus();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = '';
    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.filteredPayments = payments;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payments: ' + (err.error || 'Unknown error');
        this.loading = false;
      }
    });
  }

  checkPaymentStatus(): void {
    this.paymentService.getPaymentStatus().subscribe({
      next: (paid) => {
        this.hasPaid = paid;
      },
      error: () => {
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
  }

  filterPayments(): void {
    this.filteredPayments = this.payments.filter(p => {
      const matchSearch = !this.searchTerm ||
        (p.paymentReference && p.paymentReference.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.mpesaReceiptNumber && p.mpesaReceiptNumber.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.paymentMethod && p.paymentMethod.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchStatus = !this.statusFilter || p.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
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
    if (payment.mpesaReceiptNumber) {
      return 'Receipt: ' + payment.mpesaReceiptNumber;
    }
    if (payment.transactionId) {
      return 'Txn: ' + payment.transactionId.substring(0, 12);
    }
    if (payment.paymentReference) {
      return 'Ref: ' + payment.paymentReference;
    }
    return '—';
  }

  refreshPayments(): void {
    this.loadPayments();
    this.checkPaymentStatus();
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
      'CARD': 'Card'
    };
    return labels[method] || method;
  }
}