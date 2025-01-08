from ninja import Schema
from typing import Optional, List
from ninja import Field


class ClubSchemaOut(Schema):
    id: int
    name: str
    email: str

class ParticipatingClubSchemaOut(Schema):
    id: int
    club: ClubSchemaOut

class VolunteerSchemaOut(Schema):
    id: int
    first_name: str
    last_name: str
    works_day1: Optional[bool]
    works_day2: Optional[bool]

class TimeRegistrationSchemaCreate(Schema):
    volunteer_id: int
    day: List[int] = Field(..., choices=[(1, "Day 1"), (2, "Day 2")])
    start_time: Optional[str]
    end_time: Optional[str]

class TimeRegistrationSchemaOut(Schema):
    id: int
    volunteer: VolunteerSchemaOut
    day: str
    start_time: Optional[str]
    end_time: Optional[str]