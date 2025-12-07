export type LatLng = [number, number];

export interface SafePlace {
  lat: number;
  lng: number;
  name?: string;
  id?: string;
  address?: string;
  capacity?: number;
  contact?: string;
}

export interface Report {
  id: string;
  type: string; 
  description?: string;
  lat: number;
  lng: number;
  status: "pending" | "provisional_closed" | "closed" | "rejected";
  createdAt: string;
  reporterId?: string;
}
