from ninja import Schema, Router
from .models import Volunteer, Club
from .schemas import VolunteerSchemaOut, VolunteerCreateSchema
from typing import List


router = Router()

@router.get("/", response=List[VolunteerSchemaOut])
def get_volunteers(request):
    volunteers = Volunteer.objects.all()
    return volunteers

#make volunteer for club
@router.post("/{club_link}")
def create_volunteer(request, club_link: str, payload: VolunteerCreateSchema):
    club = Club.objects.get(link = club_link)
    volunteer = Volunteer.objects.create(club = club, **payload.dict())
    return {"id": volunteer.id, "first_name": volunteer.first_name}