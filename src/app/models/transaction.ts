export interface TransactionRequest {
  quantity: number;
  price: number;
  buyerId: number;
  sellerId: number;
}

export interface TransactionResponse {
  id: number;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
  quantity: number;
  price: number;
  buyer: EnterpriseResponse;
  seller: EnterpriseResponse;
}

export enum TransactionStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface EnterpriseResponse {

}
