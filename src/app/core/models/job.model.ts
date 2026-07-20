export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  description: string;
  requirements: string;
  jobType: string;
  industry: string;
  experienceLevel: string;
  educationLevel: string;
  isActive: boolean;
  postedAt: Date;
  expiresAt?: Date;
}

export interface JobRequest {
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  description: string;
  requirements: string;
  jobType: string;
  industry: string;
  experienceLevel: string;
  educationLevel: string;
  expiresAt?: string;
}