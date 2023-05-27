import { OpeningHours } from "./attractions-details";
import { Geometry } from "./geometry";
import { Photo } from "./photo";


export interface Attraction {
  formattedAddress: string;
  geometry: Geometry;
  name: string;
  icon: string;
  placeId: string;
  scope: string;
  rating: number;
  types: string[];
  openingHours: OpeningHours;
  photos: Photo[];
  vicinity: string;
  permanentlyClosed: boolean;
  userRatingsTotal: number;
  businessStatus: string;
  imageUrl: string;
}
