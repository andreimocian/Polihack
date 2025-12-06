export type LatLng = [number, number];

export interface SafePlace {
  lat: number;
  lng: number;
  name?: string;
  id?: string;
}

export interface Report {
  id: string;
  type: string; // "blocked_road" | "flood" | "landslide" | ...
  description?: string;
  lat: number;
  lng: number;
  status: "pending" | "provisional_closed" | "closed" | "rejected";
  createdAt: string;
  reporterId?: string;
}
