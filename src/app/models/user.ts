export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
   roles: string[];
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

