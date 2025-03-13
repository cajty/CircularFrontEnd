export interface LocationRequest {
  address: string;
  cityId: number;
  type: LocationType;
  isActive: boolean;
  enterpriseId: number;
}

export interface LocationResponse {
  id: number;
  address: string;
  cityName: string;
  type: LocationType;
  isActive: boolean;
}

export interface ActiveLocationResponse {
  id: number;
  address: string;
  cityName: string;
}
export enum LocationType {
    WAREHOUSE= "WAREHOUSE",
    RECYCLING_CENTER = "RECYCLING_CENTER",
    COLLECTION_POINT = "COLLECTION_POINT"
}
