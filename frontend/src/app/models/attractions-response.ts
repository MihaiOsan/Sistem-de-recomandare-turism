import { Attraction } from "./attraction";

export interface AttractionsResponse {
    places: Attraction[];
    pageToken: string;
}
