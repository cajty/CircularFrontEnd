

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  errorCode: string;
  message: string;
  path: string;
  validationErrors: { [key: string]: string };
  additionalDetails: { [key: string]: any };
}
