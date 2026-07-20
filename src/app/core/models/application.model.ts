export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  cvId?: number;
  coverLetter?: string;
  referenceNumber: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  appliedAt: Date;
}

export interface ApplicationRequest {
  jobId: number;
  cvId?: number;
  coverLetter?: string;
  generateCv: boolean;
  cvContent?: string;
  cvFilePath?: string;
}