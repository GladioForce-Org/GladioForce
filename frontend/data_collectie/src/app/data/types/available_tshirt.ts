import { Size } from "./size";

export interface AvailableTshirt {
    id: number;
    tshirt_id: number;
    model: string;
    sizes: Size[];
}