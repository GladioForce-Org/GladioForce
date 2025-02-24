from ninja import Schema
from typing import Optional, List

class ClubCreateSchema(Schema):
    name: str
    email: str
    contact: str
    phone: str
    link: str
    bank_account: str
    address: str
    btw_number: str
    postal_code: str
    city: str

class ClubSchemaPatch(Schema):
    name: str
    email: str
    contact: str
    phone: str
    bank_account: str
    address: str
    btw_number: str
    postal_code: str
    city: str

class ClubSchemaOut(Schema):
    id: int
    name: str
    email: str
    contact: str
    phone: str
    link: str
    bank_account: str
    address: str
    btw_number: str
    postal_code: str
    city: str

class ParticipatingClubSchema(Schema):
    id: int
    club_id: int
    person_in_charge_day1: Optional[str]
    person1_in_charge_day1: Optional[str]
    person_in_charge_day2: Optional[str]
    person1_in_charge_day2: Optional[str]

class ParticipatingClubInSchema(Schema):
    club_id: int
    name: str
    email: str
    contact: str
    phone: str
    link: str
    bank_account: str
    address: str
    btw_number: str
    postal_code: str
    city: str
    person_in_charge_day1: Optional[str]
    person1_in_charge_day1: Optional[str]
    person_in_charge_day2: Optional[str]
    person1_in_charge_day2: Optional[str]

class ParticipatingClubSchemaPatch(Schema):
    club_id: int
    name: str
    email: str
    contact: str
    phone: str
    bank_account: str
    address: str
    btw_number: str
    postal_code: str
    city: str
    person_in_charge_day1: Optional[str]
    person1_in_charge_day1: Optional[str]
    person_in_charge_day2: Optional[str]
    person1_in_charge_day2: Optional[str]

class VolunteerCreateSchema(Schema):
    first_name: str
    last_name: str
    national_registry_number: Optional[str] = None
    works_day1: bool
    works_day2: bool
    needs_parking_day1: bool
    needs_parking_day2: bool
    tshirt_id: Optional[int] = None  # Optional field, defaults to None
    size_id: Optional[int] = None  

class VolunteerSchemaPatch(Schema):
    first_name: str
    last_name: str
    national_registry_number: Optional[str] = None
    works_day1: bool
    works_day2: bool
    needs_parking_day1: bool
    needs_parking_day2: bool
    tshirt_id: Optional[int] = None  # Optional field, defaults to None
    size_id: Optional[int] = None  

class VolunteerSchemaOut(Schema):
    id: int
    first_name: str
    last_name: str
    works_day1: bool
    works_day2: bool
    needs_parking_day1: bool
    needs_parking_day2: bool
    tshirt_id: Optional[int] = None
    club_id: int
    size_id: Optional[int] = None

class VolunteerAdminSchemaOut(Schema):
    id: int
    first_name: str
    last_name: str
    national_registry_number: Optional[str] = None
    works_day1: bool
    works_day2: bool
    needs_parking_day1: bool
    needs_parking_day2: bool
    tshirt_id: Optional[int] = None
    club_id: int
    size_id: Optional[int] = None

class CoreMemberCreateSchema(Schema):
    email: str
    display_name: Optional[str] = None
    phone_number: Optional[str] = None

class CoreMemberSchema(Schema):
    id: str
    email: str
    display_name: Optional[str] = None
    phone_number: Optional[str] = None

class EditionSchema(Schema):
    id: int
    year: int
    isCurrentEdition: bool

class EditionCreateSchema(Schema):
    year: int

class SizeSchema(Schema):
    id: int
    size: str

class SizeCreateSchema(Schema):
    size: str

class TshirtSchema(Schema):
    id: int
    model: str
    sizes: List[int]

class TshirtCreateSchema(Schema):
    model: Optional[str] = None
    sizes: List[int]

class AvailableTshirtSchema(Schema):
    id: int
    tshirt_id: int
    edition_id: int
    price:Optional[float] = None

class AvailableTshirtInSchema(Schema):
    tshirt_id: int
    model: Optional[str]
    sizes: Optional[List[SizeSchema]]
    price: Optional[float] = None

class AvailableTshirtsResponseSchema(Schema):
    id: int
    tshirt_id: int
    edition_id: int
    model: str
    sizes: List[str]
    price: Optional[float]

class AvailableTshirtResponseSchema(Schema):
    id: int
    model: str
    sizes: List[str]
    price: Optional[float]
