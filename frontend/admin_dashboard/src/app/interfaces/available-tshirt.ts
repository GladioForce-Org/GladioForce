import { Size } from "./size";

export interface AvailableTshirt {
    id: number;
    tshirt_id: number;
    edition_year?: number;
    model: string;
    sizes: Size[];
    price: string;
}
