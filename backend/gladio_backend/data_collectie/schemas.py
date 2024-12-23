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

class VolunteerCreateSchema(Schema):
    first_name: str
    last_name: str
    national_registry_number: str
    works_day1: bool
    works_day2: bool
    needs_parking_day1: bool
    needs_parking_day2: bool
    tshirt_id: Optional[int] = None  # Optional field, defaults to None
    size_id: Optional[int] = None  

class VolunteerSchemaPatch(Schema):
    first_name: str
    last_name: str
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

class CoreMemberCreateSchema(Schema):
    email: str
    display_name: Optional[str] = None
    phone_number: Optional[str] = None

class CoreMemberSchema(Schema):
    id: str
    email: str
    display_name: Optional[str] = None
    phone_number: Optional[str] = None

class editionSchema(Schema):
    id: int
    year: int

class SizeSchema(Schema):
    id: int
    size: str

class TshirtSchema(Schema):
    id: int
    model: str
    sizes: List[int] 

class AvailableTshirtSchema(Schema):
    id: int
    tshirt_id: int
    edition_id: int
    price:Optional[float] = None

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
