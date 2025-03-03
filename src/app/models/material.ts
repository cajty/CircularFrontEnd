import {CategoryResponse} from './materialCategory';
import {LocationResponse} from './location';

export interface MaterialRequest {
  name: string;
  description?: string;
  quantity: number;
  price?: number;
  status: MaterialStatus;
  hazardLevel: HazardLevel;
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
  hazardLevel: HazardLevel;
  location: LocationResponse;
}

export enum MaterialStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING"
}

export enum HazardLevel {
  NONE = "NONE",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  EXTREME = "EXTREME"
}
