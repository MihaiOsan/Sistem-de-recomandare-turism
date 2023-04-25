import { Geometry } from "./geometry";
import { Photo } from "./photo";


export interface Attraction {
  formattedAddress: string | null;
  geometry: Geometry;
  name: string;
  icon: string;
  placeId: string;
  scope: string;
  rating: number;
  types: string[];
  openingHours: null;
  photos: Photo[];
  vicinity: string;
  permanentlyClosed: boolean;
  userRatingsTotal: number;
  businessStatus: null;
  imageUrl: string;
}
