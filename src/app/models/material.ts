import {CategoryResponse} from './materialCategory';
import {ActiveLocationResponse, LocationResponse} from './location';

export interface MaterialRequest {
  name: string;
  description?: string;
  quantity: number;
  price?: number;
  status: MaterialStatus;
  hazardLevel: HazardLevel;
  unit: MaterialUnit;
  categoryId: number;
  userId: number;
  locationId: number;
}

export interface MaterialResponse {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  price?: number;
  status: MaterialStatus;
  listedAt: Date;
  availableUntil: Date;
  category: CategoryResponse;
  unit: MaterialUnit;
  hazardLevel: HazardLevel;
  location: ActiveLocationResponse;
}

export enum MaterialStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING"
}
export enum MaterialUnit {
    KG= "KG",
    LITER = "LITER",
    PIECE = "PIECE",
    METER = "METER",
    SQUARE_METER = "SQUARE_METER",
    CUBIC_METER = "CUBIC_METER",
}

export interface MaterialSearchFilters {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: MaterialStatus;
}

export enum HazardLevel {
  NONE = "NONE",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  EXTREME = "EXTREME"
}
