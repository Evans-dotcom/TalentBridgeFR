import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  stats = {
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    totalCompanies: 0,
    totalPayments: 0,
    revenue: 0
  };

  features = [
    {
      icon: '💼',
      title: 'Easy Application Process',
      description: 'Apply to multiple jobs with a single CV. No more repetitive form filling.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered CV Generation',
      description: 'Let our AI generate a professional CV tailored to each job description.'
    },
    {
      icon: '💰',
      title: 'One-Time Payment',
      description: 'Pay only Ksh 500 once and apply to unlimited jobs for life.'
    },
    {
      icon: '📱',
      title: 'M-Pesa & Pesalink Integration',
      description: 'Convenient payment options including M-Pesa and Pesalink for Kenyan users.'
    },
    {
      icon: '📊',
      title: 'Application Tracking',
      description: 'Track the status of all your job applications in real-time.'
    },
    {
      icon: '🔒',
      title: 'Secure & Trusted',
      description: 'Your data is safe with us. We use industry-standard security practices.'
    }
  ];

  teamMembers = [
    {
      name: 'Evans Langat',
      role: 'Founder & CEO',
      bio: 'Passionate about connecting talent with opportunity. 10+ years in tech and recruitment.',
      avatar: 'EL'
    },
    {
      name: 'Sarah Wanjiku',
      role: 'Head of Operations',
      bio: 'Expert in streamlining processes and delivering exceptional user experiences.',
      avatar: 'SW'
    },
    {
      name: 'Michael Ochieng',
      role: 'Lead Developer',
      bio: 'Full-stack developer with a passion for building scalable, user-centric platforms.',
      avatar: 'MO'
    },
    {
      name: 'Grace Akinyi',
      role: 'Product Manager',
      bio: 'Driving product innovation and ensuring TalentBridge meets user needs.',
      avatar: 'GA'
    }
  ];

  testimonials = [
    {
      name: 'John Kamau',
      role: 'Software Engineer',
      company: 'TechNova Solutions',
      text: 'TalentBridge helped me find my dream job in just 2 weeks. The AI CV generator is a game-changer!',
      rating: 5
    },
    {
      name: 'Mary Atieno',
      role: 'Data Analyst',
      company: 'FinTech Kenya',
      text: 'The application process was seamless. I love how I can track all my applications in one place.',
      rating: 5
    },
    {
      name: 'Peter Omondi',
      role: 'Project Manager',
      company: 'BuildIT Ltd',
      text: 'One-time payment and unlimited applications - that\'s what made me choose TalentBridge. Best decision ever!',
      rating: 5
    }
  ];

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.jobService.getActiveJobs().subscribe({
      next: (jobs) => {
        this.stats.totalJobs = jobs.length;
        this.stats.totalCompanies = new Set(jobs.map(j => j.company)).size;
      }
    });

    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        this.stats.totalApplications = apps.length;
      }
    });

    this.paymentService.getMyPayments().subscribe({
      next: (payments) => {
        this.stats.totalPayments = payments.length;
        this.stats.revenue = payments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
      }
    });

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;
      },
      error: () => {
        this.stats.totalUsers = 0;
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }
}