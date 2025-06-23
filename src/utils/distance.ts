/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Get distance color based on range
 */
export function getDistanceColor(distance: number): string {
  if (distance < 1) return 'text-green-600';
  if (distance < 5) return 'text-blue-600';
  if (distance < 10) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get distance badge color
 */
export function getDistanceBadgeColor(distance: number): string {
  if (distance < 1) return 'bg-green-100 text-green-800';
  if (distance < 5) return 'bg-blue-100 text-blue-800';
  if (distance < 10) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}