import { Size } from "./size";

export interface AvailableTshirt {
    id: number;
    tshirt_id: number;
    edition_year?: number;
    model: string;
    sizes: Size[];
    price: number;
}

export interface AvailableTshirtPatcher {
    id: number;
    tshirt_id: number;
    model: string;
    sizes: Size[];
    price: number;
}
