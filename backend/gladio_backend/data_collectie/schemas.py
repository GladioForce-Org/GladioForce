from ninja import Schema

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