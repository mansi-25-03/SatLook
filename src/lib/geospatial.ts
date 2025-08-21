// Constants
const EARTH_RADIUS_KM = 6378
const GEO_SATELLITE_RADIUS_KM = 42164

// Helper to convert degrees to radians
function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Helper to convert radians to degrees
function radToDeg(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Calculates the elevation of a geostationary satellite from an observer's perspective.
 * @param observer - An object with observer's latitude and longitude in degrees.
 * @param satelliteLon - The satellite's longitude (orbital slot) in degrees.
 * @returns The elevation angle in degrees. Returns NaN if the satellite is below the horizon.
 */
export function calculateSatelliteElevation(
  observer: { lat: number; lon: number },
  satelliteLon: number
): number {
  const { lat, lon } = observer

  // Convert degrees to radians for calculation
  const phi = degToRad(lat)
  const lambda_obs = degToRad(lon)
  const lambda_sat = degToRad(satelliteLon)

  // Calculate the central angle (psi) between observer and sub-satellite point
  const cos_psi = Math.cos(phi) * Math.cos(lambda_sat - lambda_obs)

  // If cos_psi is too large, the satellite is on the other side of the Earth
  if (cos_psi < EARTH_RADIUS_KM / GEO_SATELLITE_RADIUS_KM) {
    return -90 // Below horizon
  }

  // Using Law of Cosines to find distance to satellite
  const d = Math.sqrt(
    EARTH_RADIUS_KM ** 2 + GEO_SATELLITE_RADIUS_KM ** 2 -
    2 * EARTH_RADIUS_KM * GEO_SATELLITE_RADIUS_KM * cos_psi
  );

  // Using Law of Sines to find elevation angle (E)
  const sin_E = ((GEO_SATELLITE_RADIUS_KM / d) * Math.sin(degToRad(90 + radToDeg(Math.acos(cos_psi))))) - 1;

  // The simplified formula from the proposal can be used as well
  const elevation = Math.atan(
    (cos_psi - EARTH_RADIUS_KM / GEO_SATELLITE_RADIUS_KM) / Math.sqrt(1 - cos_psi ** 2)
  )

  return radToDeg(elevation)
}
