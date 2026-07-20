import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { Job } from 'src/app/core/models/job.model';
import { JobService } from 'src/app/core/services/job.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.scss']
})
export class JobDetailComponent implements OnInit {
  job: Job | null = null;
  loading = true;

  showShareModal = false;
  linkCopied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService
  ) { }

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
  }

  applyNow(): void {
    if (this.job) {
      this.router.navigate(['/apply-job', this.job.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  getShareUrl(): string {
    return window.location.href;
  }

  openShareModal(): void {
    this.linkCopied = false;
    this.showShareModal = true;
  }

  closeShareModal(): void {
    this.showShareModal = false;
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.getShareUrl()).then(() => {
      this.linkCopied = true;
      setTimeout(() => this.linkCopied = false, 2000);
    });
  }

  shareViaEmail(): void {
    if (!this.job) return;
    const subject = encodeURIComponent(`Job Opportunity: ${this.job.title}`);
    const body = encodeURIComponent(`Check out this job opportunity: ${this.job.title} at ${this.job.company}\n\n${this.getShareUrl()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  shareViaLinkedIn(): void {
    const url = encodeURIComponent(this.getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }

  shareViaTwitter(): void {
    if (!this.job) return;
    const url = encodeURIComponent(this.getShareUrl());
    const text = encodeURIComponent(`Job Opportunity: ${this.job.title} at ${this.job.company}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  }

  downloadPDF(): void {
    if (!this.job) return;

    const doc = new jsPDF();
    const marginLeft = 15;
    let y = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginLeft * 2;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(this.job.title, maxWidth);
    doc.text(titleLines, marginLeft, y);
    y += titleLines.length * lineHeight + 4;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.job.company}  |  ${this.job.location}  |  ${this.job.jobType}`, marginLeft, y);
    y += lineHeight + 2;

    if (this.job.salaryRange) {
      doc.text(`Salary: ${this.job.salaryRange}`, marginLeft, y);
      y += lineHeight + 4;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Description', marginLeft, y);
    y += lineHeight;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(this.job.description || '', maxWidth);
    doc.text(descLines, marginLeft, y);
    y += descLines.length * lineHeight + 6;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Requirements', marginLeft, y);
    y += lineHeight;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const reqLines = doc.splitTextToSize(this.job.requirements || '', maxWidth);
    doc.text(reqLines, marginLeft, y);
    y += reqLines.length * lineHeight + 6;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Details', marginLeft, y);
    y += lineHeight + 2;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Industry: ${this.job.industry || 'N/A'}`, marginLeft, y);
    y += lineHeight;
    doc.text(`Experience Level: ${this.job.experienceLevel || 'N/A'}`, marginLeft, y);
    y += lineHeight;
    doc.text(`Education Level: ${this.job.educationLevel || 'N/A'}`, marginLeft, y);
    y += lineHeight;

    const fileName = `${this.job.title.replace(/[^a-z0-9]/gi, '_')}_Job_Posting.pdf`;
    doc.save(fileName);
  }
}