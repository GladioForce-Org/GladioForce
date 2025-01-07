from ninja import Schema, Router
from data_collectie.models import Volunteer, Club, AvailableTshirt, Size
from data_collectie.schemas import VolunteerSchemaOut, VolunteerCreateSchema, VolunteerSchemaPatch
from typing import List
from data_collectie.services import get_tshirt_or_none, get_size_or_none



router = Router(tags=["Volunteers_admin"])

@router.get("/", response=List[VolunteerSchemaOut])
def get_volunteers(request):
    volunteers = Volunteer.objects.all()
    return volunteers

# #make volunteer for club
@router.post("/{club_id}")
def create_volunteer(request, club_id: int, payload: VolunteerCreateSchema):
    try:
        club = Club.objects.get(id = club_id)
        volunteer = Volunteer.objects.create(club = club, **payload.dict())
        return {"status": "ok", "message": "Volunteer created successfully"}
    except Club.DoesNotExist:
        return {"status": "error", "message": f"Club with ID {club_id} does not exist"}

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