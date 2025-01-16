export interface Volunteer {
    id?: number;         // Optional field
    first_name: string;
    last_name: string;
    works_day1: boolean;
    works_day2: boolean;
    needs_parking_day1?: boolean;
    needs_parking_day2?: boolean;
    national_registry_number?: string;
    tshirt_id?: number;  // Optional field
    size_id?: number;    // Optional field
}
