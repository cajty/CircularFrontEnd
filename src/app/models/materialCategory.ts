export interface CategoryRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}
