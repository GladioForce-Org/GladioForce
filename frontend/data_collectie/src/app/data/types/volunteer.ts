export interface Volunteer {
    id: number;
    first_name: string;
    last_name: string;
    works_day1: boolean;
    works_day2: boolean;
    needs_parking_day1: boolean;
    needs_parking_day2: boolean;
    tshirt_id: number | null;
    size_id: number | null;
    national_registry_number?: string;

    club_id?: number;
    works_day?: string | null;
    needs_parking?: string | null;
    tshirt?: string | null;
    size?: string | null;
}