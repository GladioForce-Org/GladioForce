from ninja import Schema, Router
from .models import Volunteer, Club, AvailableTshirt, Size
from .schemas import VolunteerSchemaOut, VolunteerCreateSchema, VolunteerSchemaPatch
from typing import List
from .services import get_tshirt_or_none, get_size_or_none
from gladio_backend.auth.auth import FirebaseAuth


router = Router(tags=["Volunteers"])

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

@router.delete("/{volunteer_id}")
def delete_volunteer(request, volunteer_id: int):
    Volunteer.objects.get(id=volunteer_id).delete()
    return {"status": "ok"}

@router.patch("/update/{volunteer_id}")
def update_volunteer(request, volunteer_id: int, payload: VolunteerSchemaPatch):
    try:
        # Retrieve the volunteer by ID
        volunteer = Volunteer.objects.get(id=volunteer_id)
        # Update the basic fields
        for field in payload.dict().keys():
            if field in ["first_name", "last_name", "works_day1", "works_day2", "needs_parking_day1", "needs_parking_day2"]:
                setattr(volunteer, field, payload.dict()[field])

        # Update ForeignKey fields if provided
        volunteer.tshirt = get_tshirt_or_none(payload.tshirt_id)
        volunteer.size = get_size_or_none(payload.size_id)
        # Save the updated volunteer to the database
        volunteer.save()

        return {"status": "ok", "message": "Volunteer updated successfully"}
    except Volunteer.DoesNotExist:
        return {"status": "error", "message": f"Volunteer with ID {volunteer_id} does not exist"}