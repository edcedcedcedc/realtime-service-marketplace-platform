import { LatLng, Region } from "../store/useStore";

export const toRegion = (latLng: LatLng, delta = 0.01): Region => ({
  latitude: latLng.latitude,
  longitude: latLng.longitude,
  latitudeDelta: delta,
  longitudeDelta: delta,
});
