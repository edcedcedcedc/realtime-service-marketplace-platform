import { LatLng, Region } from "../store/useStore";

export function toRegion(latLng: LatLng, delta = 0.01): Region {
  return {
    latitude: latLng.latitude,
    longitude: latLng.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}