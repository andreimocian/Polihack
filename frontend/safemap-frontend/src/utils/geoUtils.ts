import type { SafePlace } from "../types";

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// 2. Helper: Haversine Distance Formula (returns km)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// 3. Main Function: Find the closest place
export const findClosestSafePlace = (
  currentLat: number, 
  currentLng: number, 
  places: SafePlace[]
): SafePlace | null => {
  if (places.length === 0) return null;

  return places.reduce((closest, current) => {
    const distanceToClosest = getDistanceFromLatLonInKm(
        currentLat, 
        currentLng, 
        closest.lat, 
        closest.lng
    );

    const distanceToCurrent = getDistanceFromLatLonInKm(
        currentLat, 
        currentLng, 
        current.lat, 
        current.lng
    );

    // If the current one is closer than the previous 'closest', return current
    return distanceToCurrent < distanceToClosest ? current : closest;
  });
};