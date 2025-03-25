import { VerificationStatus } from './enterprise';


export interface VerificationDocumentRequest {
  enterpriseId: number;
  documentType: string;
  file: File;
}


export interface VerificationDocumentResponse {
  id: number;
  documentType: string;
  fileName: string;
  contentType: string;
  uploadedAt: Date;
  filePath: string;
  uploadedBy: string;
  isVerified: boolean;
}


export interface VerificationStatusUpdateRequest {
  enterpriseId: number;
  newStatus: VerificationStatus;
  reason?: string;
}
