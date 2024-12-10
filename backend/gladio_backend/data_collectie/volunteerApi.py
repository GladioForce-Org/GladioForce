from ninja import Schema, Router
from .models import Volunteer, Club, AvailableTshirt, Size
from .schemas import VolunteerSchemaOut, VolunteerCreateSchema, VolunteerSchemaPatch
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
        volunteer.first_name = payload.first_name
        volunteer.last_name = payload.last_name
        volunteer.works_day1 = payload.works_day1
        volunteer.works_day2 = payload.works_day2
        volunteer.needs_parking_day1 = payload.needs_parking_day1
        volunteer.needs_parking_day2 = payload.needs_parking_day2

        # Update ForeignKey fields if provided
        if payload.tshirt_id is not None:
            try:
                volunteer.tshirt = AvailableTshirt.objects.get(id=payload.tshirt_id)
            except AvailableTshirt.DoesNotExist:
                return {"status": "error", "message": f"Tshirt with ID {payload.tshirt_id} does not exist"}

        if payload.size_id is not None:
            try:
                volunteer.size = Size.objects.get(id=payload.size_id)
            except Size.DoesNotExist:
                return {"status": "error", "message": f"Size with ID {payload.size_id} does not exist"}

        # Save the updated volunteer to the database
        volunteer.save()

        return {"status": "ok", "message": "Volunteer updated successfully"}
    except Volunteer.DoesNotExist:
        return {"status": "error", "message": f"Volunteer with ID {volunteer_id} does not exist"}