import { Timestamp } from "rxjs";
import { Volunteer } from "./volunteer";

export interface TimeRegistration {
    id?: number;
    volunteer: Volunteer;
    day: number;
    start_time: string | null;
    end_time: string | null;
}