export interface EnterpriseRequest {
  name: string;
  registrationNumber: string;
  enterpriseType: EnterpriseType;
}


export interface EnterpriseResponse {
  id: number;
  name: string;
  registrationNumber: string;
  type: EnterpriseType;
  status: VerificationStatus;
  verifiedAt?: Date;
}


export enum EnterpriseType {
  RECYCLER = "RECYCLER",
  COLLECTOR = "COLLECTOR",
  PROCESSOR = "PROCESSOR"
}


export enum VerificationStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED"
}
