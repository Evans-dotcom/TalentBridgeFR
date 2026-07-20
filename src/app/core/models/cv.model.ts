export interface CV {
  id: number;
  filePath?: string;
  originalFileName?: string;
  content?: string;
  cvType: 'UPLOADED' | 'MANUAL' | 'AI_GENERATED';
  createdAt: Date;
}

export interface CVRequest {
  content: string;
  cvType: string;
}