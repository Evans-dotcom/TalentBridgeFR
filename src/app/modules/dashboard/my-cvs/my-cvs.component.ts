import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CVService } from '../../../core/services/cv.service';
import { CV } from '../../../core/models/cv.model';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentService } from '../../../core/services/payment.service';

type PaymentMethod = 'mpesa' | 'pesalink' | 'card' | 'mpesa_till' | 'airtel';
type PaymentStage = 'form' | 'waiting' | 'pesalink-instructions' | 'confirmed' | 'cancelled' | 'failed' | 'timeout';

@Component({
  selector: 'app-my-cvs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-cvs.component.html',
  styleUrls: ['./my-cvs.component.scss']
})
export class MyCVsComponent implements OnInit, OnDestroy {
  cvs: CV[] = [];
  loading = true;
  deleting = false;
  error = '';
  success = '';
  selectedFile: File | null = null;
  manualContent = '';
  isUploading = false;
  uploadProgress = 0;
  showCreateModal = false;
  createMethod: 'upload' | 'manual' | 'ai' = 'upload';
  aiJobDescription = '';
  showDeleteConfirm = false;
  deleteTargetId: number | null = null;
  showViewModal = false;
  viewingCV: CV | null = null;
  hasPaid = false;
  showPaymentModal = false;
  paymentSubmitting = false;
  paymentError = '';
  pendingAction: 'upload' | 'manual' | 'ai' | null = null;
  mpesaPhone = '';
  selectedPaymentMethod: PaymentMethod = 'mpesa';
  readonly enabledMethods: PaymentMethod[] = ['mpesa', 'pesalink'];

  pesalinkAccountName: string | null = null;
  pesalinkAccountNumber: string | null = null;
  pesalinkBankName: string | null = null;
  pesalinkTransactionReference: string | null = null;
  pesalinkAccountExpiresAt: string | null = null;
  activePaymentId: number | null = null;

  paymentStage: PaymentStage = 'form';
  pollTimer: any = null;
  pollAttempts = 0;
  readonly maxPollAttempts = 20;
  readonly pollIntervalMs = 3000;
  confirmedReceiptCode: string | null = null;
  confirmedPaymentMethod: string | null = null;

  constructor(
    private cvService: CVService,
    private authService: AuthService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.checkPaymentStatus();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  checkPaymentStatus(): void {
    this.paymentService.getPaymentStatus().subscribe({
      next: (paid) => {
        this.hasPaid = paid;
        if (paid) {
          this.authService.updateUserHasPaid();
          this.loadCVs();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.hasPaid = false;
        this.loading = false;
      }
    });
  }

  loadCVs(): void {
    this.loading = true;
    this.error = '';
    this.cvService.getMyCVs().subscribe({
      next: (cvs) => {
        this.cvs = cvs;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load CVs: ' + err.error;
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    if (!this.hasPaid) {
      this.pendingAction = 'upload';
      this.openPaymentModal();
      return;
    }
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadCV(): void {
    if (!this.hasPaid) {
      this.pendingAction = 'upload';
      this.openPaymentModal();
      return;
    }

    if (!this.selectedFile) {
      this.error = 'Please select a file to upload.';
      return;
    }

    this.isUploading = true;
    this.error = '';
    this.success = '';
    this.uploadProgress = 0;

    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(interval);
      }
    }, 200);

    this.cvService.uploadCV(this.selectedFile).subscribe({
      next: (cv) => {
        clearInterval(interval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.cvs.push(cv);
        this.success = 'CV uploaded successfully!';
        this.closeCreateModal();
        setTimeout(() => this.success = '', 3000);
        this.selectedFile = null;
      },
      error: (err) => {
        clearInterval(interval);
        this.isUploading = false;
        this.error = err.error || 'Failed to upload CV.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  createManualCV(): void {
    if (!this.hasPaid) {
      this.pendingAction = 'manual';
      this.openPaymentModal();
      return;
    }

    if (!this.manualContent.trim()) {
      this.error = 'Please enter CV content.';
      return;
    }

    this.isUploading = true;
    this.error = '';
    this.success = '';

    this.cvService.createManualCV(this.manualContent).subscribe({
      next: (cv) => {
        this.isUploading = false;
        this.cvs.push(cv);
        this.success = 'Manual CV created successfully!';
        this.closeCreateModal();
        setTimeout(() => this.success = '', 3000);
        this.manualContent = '';
      },
      error: (err) => {
        this.isUploading = false;
        this.error = err.error || 'Failed to create manual CV.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  generateAICV(): void {
    if (!this.hasPaid) {
      this.pendingAction = 'ai';
      this.openPaymentModal();
      return;
    }

    if (!this.aiJobDescription.trim()) {
      this.error = 'Please enter a job description.';
      return;
    }

    this.isUploading = true;
    this.error = '';
    this.success = '';

    this.cvService.generateAICV(this.aiJobDescription).subscribe({
      next: (cv) => {
        this.isUploading = false;
        this.cvs.push(cv);
        this.success = 'AI CV generated successfully!';
        this.closeCreateModal();
        setTimeout(() => this.success = '', 3000);
        this.aiJobDescription = '';
      },
      error: (err) => {
        this.isUploading = false;
        this.error = err.error || 'Failed to generate AI CV.';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  viewContent(cv: CV): void {
    this.viewingCV = cv;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewingCV = null;
  }

  confirmDelete(cvId: number): void {
    this.deleteTargetId = cvId;
    this.showDeleteConfirm = true;
  }

  deleteCV(): void {
    if (!this.deleteTargetId) return;

    this.deleting = true;
    this.error = '';
    this.success = '';

    this.cvService.deleteCV(this.deleteTargetId).subscribe({
      next: () => {
        this.deleting = false;
        this.cvs = this.cvs.filter(cv => cv.id !== this.deleteTargetId);
        this.success = 'CV deleted successfully!';
        this.showDeleteConfirm = false;
        this.deleteTargetId = null;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.deleting = false;
        this.error = typeof err.error === 'string'
          ? err.error
          : (err.error?.message || err.message || 'Failed to delete CV.');
        this.showDeleteConfirm = false;
        this.deleteTargetId = null;
        this.loadCVs();
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
  }

  openCreateModal(): void {
    if (!this.hasPaid) {
      this.openPaymentModal();
      return;
    }
    this.createMethod = 'upload';
    this.selectedFile = null;
    this.manualContent = '';
    this.aiJobDescription = '';
    this.error = '';
    this.success = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.selectedFile = null;
    this.manualContent = '';
    this.aiJobDescription = '';
    this.isUploading = false;
    this.uploadProgress = 0;
    this.error = '';
  }

  getUserEmail(): string {
    return this.authService.getUser()?.email || '';
  }

  getComingSoonMessage(method: PaymentMethod): string {
    const messages: Record<PaymentMethod, string> = {
      'mpesa': '',
      'pesalink': '',
      'card': 'Card payments are coming soon!',
      'mpesa_till': 'M-PESA Till payments are coming soon!',
      'airtel': 'Airtel Money payments are coming soon!'
    };
    return messages[method] || 'This payment method is coming soon!';
  }

  openPaymentModal(): void {
    this.selectedPaymentMethod = 'mpesa';
    this.mpesaPhone = '';
    this.paymentError = '';
    this.paymentStage = 'form';
    this.confirmedReceiptCode = null;
    this.activePaymentId = null;
    this.pesalinkAccountName = null;
    this.pesalinkAccountNumber = null;
    this.pesalinkBankName = null;
    this.pesalinkTransactionReference = null;
    this.pesalinkAccountExpiresAt = null;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    if (this.paymentStage === 'waiting') return;

    this.stopPolling();
    this.showPaymentModal = false;
    this.pendingAction = null;
    this.paymentError = '';
    this.paymentStage = 'form';
  }

  isMethodEnabled(method: PaymentMethod): boolean {
    return this.enabledMethods.includes(method);
  }

  selectPaymentMethod(method: PaymentMethod): void {
    if (this.paymentStage === 'waiting') return;
    this.selectedPaymentMethod = method;
    this.paymentError = '';
    if (!this.isMethodEnabled(method)) {
      this.paymentError = this.getComingSoonMessage(method) + ' Please use M-PESA or Pesalink.';
    }
  }

  payWithMpesa(): void {
    const phone = this.mpesaPhone.trim();
    if (!phone || phone.length < 9) {
      this.paymentError = 'Please enter a valid mobile money number.';
      return;
    }

    this.paymentSubmitting = true;
    this.paymentError = '';

    this.paymentService.initiateMpesaPayment({
      phoneNumber: phone,
      paymentMethod: 'MPESA',
      paymentChannel: 'PAYBILL'
    }).subscribe({
      next: (response) => {
        this.paymentSubmitting = false;
        if (response.success && response.paymentId) {
          this.activePaymentId = response.paymentId;
          this.startWaitingForConfirmation();
        } else {
          this.paymentError = response.message || 'Payment failed. Please try again.';
        }
      },
      error: (err) => {
        this.paymentSubmitting = false;
        this.paymentError = 'Payment initiation failed: ' + (err.error?.message || err.error || 'Unknown error');
      }
    });
  }


  payWithPesalink(): void {
    this.paymentSubmitting = true;
    this.paymentError = '';

    this.paymentService.initiatePesalinkPayment().subscribe({
      next: (response) => {
        this.paymentSubmitting = false;
        if (response.success) {
          this.pesalinkAccountName = response.accountName || null;
          this.pesalinkAccountNumber = response.accountNumber || null;
          this.pesalinkBankName = response.bankName || null;
          this.pesalinkTransactionReference = response.transactionReference || null;
          this.pesalinkAccountExpiresAt = response.accountExpiresAt || null;
          this.paymentStage = 'pesalink-instructions';
          this.pollAttempts = 0;
          this.paymentError = '';
          this.poll();
        } else {
          this.paymentError = response.message || 'Payment failed. Please try again.';
        }
      },
      error: (err) => {
        this.paymentSubmitting = false;
        this.paymentError = 'Payment initiation failed: ' + (err.error?.message || err.error || 'Unknown error');
      }
    });
  }

  private startWaitingForConfirmation(): void {
    this.paymentStage = 'waiting';
    this.pollAttempts = 0;
    this.paymentError = '';
    this.poll();
  }

  private poll(): void {
    this.pollTimer = setTimeout(() => {
      this.pollAttempts++;

      if (!this.activePaymentId) {
        this.pollGenericStatus();
        return;
      }

      this.paymentService.getPaymentAttemptStatus(this.activePaymentId).subscribe({
        next: (result) => {
          if (result.status === 'PAID') {
            this.onPaymentConfirmed();
          } else if (result.status === 'CANCELLED') {
            this.stopPolling();
            this.paymentStage = 'cancelled';
          } else if (result.status === 'FAILED') {
            this.stopPolling();
            this.paymentStage = 'failed';
          } else if (this.pollAttempts >= this.maxPollAttempts) {
            this.paymentStage = 'timeout';
          } else {
            this.poll();
          }
        },
        error: () => {
          if (this.pollAttempts >= this.maxPollAttempts) {
            this.paymentStage = 'timeout';
          } else {
            this.poll();
          }
        }
      });
    }, this.pollIntervalMs);
  }

  private pollGenericStatus(): void {
    this.paymentService.getPaymentStatus().subscribe({
      next: (paid) => {
        if (paid) {
          this.onPaymentConfirmed();
        } else if (this.pollAttempts >= this.maxPollAttempts) {
          this.paymentStage = 'timeout';
        } else {
          this.poll();
        }
      },
      error: () => {
        if (this.pollAttempts >= this.maxPollAttempts) {
          this.paymentStage = 'timeout';
        } else {
          this.poll();
        }
      }
    });
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private onPaymentConfirmed(): void {
    this.stopPolling();
    this.hasPaid = true;
    this.authService.updateUserHasPaid();
    this.paymentStage = 'confirmed';

    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        const latest = payments && payments.length > 0 ? payments[0] : null;
        this.confirmedReceiptCode = latest?.mpesaReceiptNumber || latest?.paymentReference || null;
        this.confirmedPaymentMethod = latest?.paymentMethod || null;
      },
      error: () => {
        this.confirmedReceiptCode = null;
      }
    });

    this.loadCVs();
  }

  retryStatusCheck(): void {
    this.paymentStage = 'waiting';
    this.pollAttempts = 0;
    this.poll();
  }
  retryPayment(): void {
    this.activePaymentId = null;
    this.paymentStage = 'form';
    this.paymentError = '';
    this.mpesaPhone = '';
  }

  finishAfterConfirmation(): void {
    this.showPaymentModal = false;
    this.paymentStage = 'form';
    this.success = 'Payment confirmed! You can now create CVs.';
    setTimeout(() => this.success = '', 3000);

    if (this.pendingAction) {
      this.openCreateModal();
      this.createMethod = this.pendingAction;
      this.pendingAction = null;
    }
  }

  getCvTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'UPLOADED': '📄',
      'MANUAL': '✍️',
      'AI_GENERATED': '🤖'
    };
    return icons[type] || '📄';
  }

  getCvTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'UPLOADED': 'Uploaded',
      'MANUAL': 'Manual',
      'AI_GENERATED': 'AI Generated'
    };
    return labels[type] || type;
  }

  getFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getFileName(cv: CV): string {
    if (cv.originalFileName) {
      return cv.originalFileName.length > 30
        ? cv.originalFileName.substring(0, 27) + '...'
        : cv.originalFileName;
    }
    if (!cv.filePath) return 'Unknown';
    const parts = cv.filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName;
  }
}