import { TimeInterval } from "./time-interval";

export class NewTripInfo {
    tripName!: string;
    startDate!: Date;
    endDate!: Date;
    range!: number;
    tripTimeSlots!: TimeInterval[][];
  }