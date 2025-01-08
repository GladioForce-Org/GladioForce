export interface Club {
    id: number;
    name: string;
    email: string;
    contact: string;
    phone: string;
    link: string;
    bank_account: string;
    address: string;
    btw_number: string;
    postal_code: string;
    city: string;
}

export interface ClubCreate {
    club_id: number;
    name: string;
    email: string;
    contact: string;
    phone: string;
    link: string | null;
    bank_account: string;
    address: string;
    btw_number: string;
    postal_code: string;
    city: string;
    person_in_charge_day1?: string | null;
    person1_in_charge_day1?: string | null;
    person_in_charge_day2?: string | null;
    person1_in_charge_day2?: string | null;
}

