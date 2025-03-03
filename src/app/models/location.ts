export interface LocationRequest {
  address: string;
  cityId: number;
  type: LocationType;
  enterpriseId: number;
}

export interface LocationResponse {
  id: number;
  address: string;
  cityId: number;
  type: LocationType;
  enterpriseId: number;
}
export enum LocationType {
    WAREHOUSE= "WAREHOUSE",
    RECYCLING_CENTER = "RECYCLING_CENTER",
    COLLECTION_POINT = "COLLECTION_POINT"
}
