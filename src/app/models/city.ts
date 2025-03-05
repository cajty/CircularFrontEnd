

export interface CityRequest {
  name: string;
  isActive: boolean;
}


export interface CityResponse {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
}
