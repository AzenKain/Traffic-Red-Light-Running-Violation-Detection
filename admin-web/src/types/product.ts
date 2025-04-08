export interface Violation {
  id?: string;
  time?: number;
  isDisplay?: boolean;
  plate_text?: string;
  vehicle_type?: string;
  vehicle_image?: string;
  plate_image?: string;
}

export interface Camera {
  _id?: string; 
  isDisplay?: boolean;
  address?: string;
  key?: string;
  imgDisplay?: string;
  violations?: Violation[];
  updatedAt?: string; 
  createdAt?: string;
}
