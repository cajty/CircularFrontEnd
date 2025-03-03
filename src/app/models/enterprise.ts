import {LocationRequest} from './location';

export interface EnterpriseRequest {
  name: string;
  registrationNumber: string;
  type: EnterpriseType;
  locationRequest: LocationRequest;
}

export interface EnterpriseResponse {
  id: number;
  name: string;
  registrationNumber: string;
  type: EnterpriseType;
  status: VerificationStatus;
  verifiedAt?: Date;
  // locations?: LocationDto[];
  // users?: UserDto[];
}

export enum EnterpriseType {
  RECYCLER = "RECYCLER",
  COLLECTOR = "COLLECTOR",
  PROCESSOR = "PROCESSOR"
}

export enum VerificationStatus {
  PENDING= "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED"
}


