import { Place } from "./attractions-details";
import { TimeInterval } from "./time-interval";

export class SchedulePlacesResponse {
    place!:Place;
    timeSlot!:TimeInterval;
    date!:Date;
}
