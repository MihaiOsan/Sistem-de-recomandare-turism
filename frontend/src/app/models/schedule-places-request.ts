import { NewTripInfo } from "./new-trip-info";

export class SchedulePlacesRequest {
    tripInfo!: NewTripInfo;
    places!: string[];
}
