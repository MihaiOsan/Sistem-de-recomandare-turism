import { TimeInterval } from "./time-interval";

export class NewTripInfo {
    planID?: number;
    tripName!: string;
    startDate!: Date;
    endDate!: Date;
    range!: number;
    startLocation!: google.maps.LatLngLiteral;;
    tripTimeSlots!: TimeInterval[][];
  }