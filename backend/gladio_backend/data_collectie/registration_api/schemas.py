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

    @staticmethod
    def from_model(instance):
        return TimeRegistrationSchemaOut(
            id=instance.id,
            volunteer=VolunteerSchemaOut(
                id=instance.volunteer.id,
                first_name=instance.volunteer.first_name,
                last_name=instance.volunteer.last_name,
                works_day1=instance.volunteer.works_day1,
                works_day2=instance.volunteer.works_day2,
            ),
            day=str(instance.day),
            start_time=instance.start_time.strftime("%H:%M:%S") if instance.start_time else None,
            end_time=instance.end_time.strftime("%H:%M:%S") if instance.end_time else None,
        )