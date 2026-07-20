import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CV } from 'src/app/core/models/cv.model';
import { Job } from 'src/app/core/models/job.model';
import { ApplicationService } from 'src/app/core/services/application.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CVService } from 'src/app/core/services/cv.service';
import { JobService } from 'src/app/core/services/job.service';
import { PaymentService } from 'src/app/core/services/payment.service';

type PaymentMethod = 'mpesa' | 'pesalink' | 'card' | 'mpesa_till' | 'airtel';
//type PaymentStage = 'form' | 'waiting' | 'pesalink-instructions' | 'confirmed' | 'timeout';
type PaymentStage = 'form' | 'waiting' | 'pesalink-instructions' | 'confirmed' | 'cancelled' | 'failed' | 'timeout';

@Component({
  selector: 'app-apply-job',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.scss']
})
export class ApplyJobComponent implements OnInit, OnDestroy {
  job: Job | null = null;
  cvs: CV[] = [];
  loading = true;
  submitting = false;
  hasPaid = false;
  showPaymentModal = false;
  selectedCVType = '';
  error = '';
  success = '';
  uploadProgress = 0;
  isUploading = false;
  pendingAction: 'upload' | 'manual' | 'ai' | null = null;

  pesalinkAccountName: string | null = null;
  pesalinkAccountNumber: string | null = null;
  pesalinkBankName: string | null = null;
  pesalinkTransactionReference: string | null = null;
  pesalinkAccountExpiresAt: string | null = null;
  activePaymentId: number | null = null;

  selectedPaymentMethod: PaymentMethod = 'mpesa';
  mpesaPhone = '';
  paymentSubmitting = false;
  paymentError = '';

  paymentStage: PaymentStage = 'form';
  pollTimer: any = null;
  pollAttempts = 0;
  readonly maxPollAttempts = 20;
  readonly pollIntervalMs = 3000;
  confirmedReceiptCode: string | null = null;
  confirmedPaymentMethod: string | null = null;

  readonly enabledMethods: PaymentMethod[] = ['mpesa', 'pesalink'];
  readonly methodOrder: PaymentMethod[] = ['mpesa', 'pesalink', 'card', 'mpesa_till', 'airtel'];

  applyForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private cvService: CVService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {
    this.applyForm = this.fb.group({
      cvOption: ['new', Validators.required],
      cvId: [''],
      cvType: ['upload', Validators.required],
      cvContent: [''],
      coverLetter: [''],
      manualFirstName: [''],
      manualLastName: [''],
      manualEmail: [''],
      manualPhone: [''],
      manualSummary: [''],
      manualSkills: [''],
      manualExperience: [''],
      manualEducation: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.jobService.getJobById(id).subscribe({
      next: (job) => {
        this.job = job;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    this.paymentService.getPaymentStatus().subscribe({
      next: (paid) => {
        this.hasPaid = paid;
        if (paid) {
          this.loadCvs();
          this.authService.updateUserHasPaid();
        }
      },
      error: () => {
        this.hasPaid = false;
      }
    });

    this.applyForm.get('cvOption')?.valueChanges.subscribe(value => {
      if (value === 'existing' && this.hasPaid) {
        this.applyForm.get('cvId')?.setValidators(Validators.required);
        this.applyForm.get('cvType')?.clearValidators();
        this.applyForm.get('cvContent')?.clearValidators();
      } else if (value === 'new') {
        this.applyForm.get('cvId')?.clearValidators();
        this.applyForm.get('cvType')?.setValidators(Validators.required);
      }
      this.applyForm.updateValueAndValidity();
    });

    this.applyForm.get('cvType')?.valueChanges.subscribe(value => {
      this.selectedCVType = value;
      if (value === 'manual') {
        this.applyForm.get('manualFirstName')?.setValidators(Validators.required);
        this.applyForm.get('manualLastName')?.setValidators(Validators.required);
        this.applyForm.get('manualEmail')?.setValidators([Validators.required, Validators.email]);
        this.applyForm.get('manualPhone')?.setValidators(Validators.required);
        this.applyForm.get('manualSummary')?.setValidators(Validators.required);
        this.applyForm.get('manualSkills')?.setValidators(Validators.required);
        this.applyForm.get('manualExperience')?.setValidators(Validators.required);
        this.applyForm.get('manualEducation')?.setValidators(Validators.required);
      } else {
        this.applyForm.get('manualFirstName')?.clearValidators();
        this.applyForm.get('manualLastName')?.clearValidators();
        this.applyForm.get('manualEmail')?.clearValidators();
        this.applyForm.get('manualPhone')?.clearValidators();
        this.applyForm.get('manualSummary')?.clearValidators();
        this.applyForm.get('manualSkills')?.clearValidators();
        this.applyForm.get('manualExperience')?.clearValidators();
        this.applyForm.get('manualEducation')?.clearValidators();
      }
      this.applyForm.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadCvs(): void {
    this.cvService.getMyCVs().subscribe({
      next: (cvs) => {
        this.cvs = cvs;
      }
    });
  }

  onCvTypeSelected(type: 'upload' | 'manual' | 'ai'): void {
    if (!this.hasPaid) {
      this.pendingAction = type;
      this.openPaymentModal();
      return;
    }

    this.applyForm.patchValue({ cvType: type });

    if (type === 'upload') {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    } else if (type === 'ai') {
      this.generateAICV();
    } else if (type === 'manual') {
      this.applyForm.patchValue({ cvType: 'manual' });
    }
  }

  onFileSelected(event: any): void {
    if (!this.hasPaid) {
      this.openPaymentModal();
      return;
    }

    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.uploadProgress = 0;

      const interval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(interval);
        }
      }, 200);

      this.cvService.uploadCV(file).subscribe({
        next: (cv) => {
          this.isUploading = false;
          this.uploadProgress = 100;
          this.cvs.push(cv);
          this.applyForm.patchValue({
            cvId: cv.id,
            cvOption: 'existing',
            cvContent: cv.content || ''
          });
          this.success = 'CV uploaded successfully!';
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.isUploading = false;
          this.error = 'Failed to upload CV: ' + err.error;
          setTimeout(() => this.error = '', 3000);
        }
      });
    }
  }

  generateAICV(): void {
    if (!this.hasPaid) {
      this.openPaymentModal();
      return;
    }

    if (!this.job) return;
    this.isUploading = true;

    this.cvService.generateAICV(this.job.description).subscribe({
      next: (cv) => {
        this.isUploading = false;
        this.cvs.push(cv);
        this.applyForm.patchValue({
          cvId: cv.id,
          cvOption: 'existing',
          cvContent: cv.content || ''
        });
        this.success = 'AI CV generated successfully!';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.isUploading = false;
        this.error = 'Failed to generate AI CV: ' + err.error;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  createManualCV(): void {
    if (!this.hasPaid) {
      this.openPaymentModal();
      return;
    }

    const formValue = this.applyForm.value;
    const cvContent = `
=== PROFESSIONAL CV ===

Name: ${formValue.manualFirstName} ${formValue.manualLastName}
Email: ${formValue.manualEmail}
Phone: ${formValue.manualPhone}

=== PROFESSIONAL SUMMARY ===
${formValue.manualSummary}

=== KEY SKILLS ===
${formValue.manualSkills}

=== WORK EXPERIENCE ===
${formValue.manualExperience}

=== EDUCATION ===
${formValue.manualEducation}
    `;

    this.isUploading = true;
    this.cvService.createManualCV(cvContent).subscribe({
      next: (cv) => {
        this.isUploading = false;
        this.cvs.push(cv);
        this.applyForm.patchValue({
          cvId: cv.id,
          cvOption: 'existing',
          cvContent: cv.content || ''
        });
        this.success = 'Manual CV created successfully!';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.isUploading = false;
        this.error = 'Failed to create CV: ' + err.error;
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  submitApplication(): void {
    if (!this.hasPaid) {
      this.openPaymentModal();
      return;
    }

    if (this.applyForm.invalid) {
      this.markFormFieldsTouched();
      return;
    }

    const formValue = this.applyForm.value;

    if (formValue.cvOption === 'new' && formValue.cvType === 'manual') {
      this.createManualCV();
      return;
    }

    if (formValue.cvOption === 'new' && formValue.cvType === 'upload') {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        this.onFileSelected({ target: fileInput });
        return;
      } else {
        this.error = 'Please select a file to upload.';
        return;
      }
    }

    if (formValue.cvOption === 'new' && formValue.cvType === 'ai') {
      this.generateAICV();
      return;
    }

    this.submit();
  }

  submit(): void {
    this.submitting = true;
    this.error = '';
    this.success = '';

    const formValue = this.applyForm.value;
    const application: any = {
      jobId: this.job!.id,
      coverLetter: formValue.coverLetter,
      generateCv: false
    };

    if (formValue.cvOption === 'existing' && formValue.cvId) {
      application.cvId = formValue.cvId;
    } else if (formValue.cvOption === 'new') {
      application.generateCv = true;
      application.cvContent = formValue.cvContent;
    }

    this.applicationService.applyForJob(application).subscribe({
      next: (response) => {
        this.submitting = false;
        this.success = 'Application submitted successfully!';
        setTimeout(() => {
          this.router.navigate(['/dashboard/applications']);
        }, 2000);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error || 'Failed to submit application. Please try again.';
        setTimeout(() => this.error = '', 3000);
      }
    });
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

    // If method is not enabled, show a friendly message
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

    this.loadCvs();
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
    this.success = 'Payment confirmed! You can now proceed.';
    setTimeout(() => this.success = '', 3000);

    if (this.pendingAction) {
      this.onCvTypeSelected(this.pendingAction);
      this.pendingAction = null;
    }
  }

  cancel(): void {
    if (this.job) {
      this.router.navigate(['/jobs', this.job.id]);
    } else {
      this.router.navigate(['/jobs']);
    }
  }

  private markFormFieldsTouched(): void {
    Object.keys(this.applyForm.controls).forEach(key => {
      this.applyForm.get(key)?.markAsTouched();
    });
  }

  getCvTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'upload': 'Upload CV',
      'manual': 'Create Manually',
      'ai': 'Generate with AI'
    };
    return labels[type] || type;
  }
}