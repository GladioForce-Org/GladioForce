export interface ParticipatingClub {
    id: number;
    club_id: number;
    person_in_charge_day1?: string;
    person1_in_charge_day1?: string;
    person_in_charge_day2?: string;
    person1_in_charge_day2?: string;
}

export interface ParticipatingClubPatcher {
    club_id: number;
    name: string;
    email: string;
    contact: string;
    phone: string;
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
