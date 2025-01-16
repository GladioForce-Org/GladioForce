import datetime
from django.http import Http404
from ninja import Schema, Router
from data_collectie.registration_api.schemas import TimeRegistrationSchemaCreateWithTimeStrings, TimeRegistrationSchemaOut
from data_collectie.models import Edition, TimeRegistration, Volunteer, Club, AvailableTshirt, Size
from data_collectie.schemas import VolunteerSchemaOut, VolunteerCreateSchema, VolunteerSchemaPatch
from typing import List
from data_collectie.services import get_tshirt_or_none, get_size_or_none
from gladio_backend.auth.auth import AuthBearer



router = Router(tags=["Volunteers_admin"], auth=AuthBearer())

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

@router.delete("/{volunteer_id}/")
def delete_volunteer(request, volunteer_id: int):
    Volunteer.objects.get(id=volunteer_id).delete()
    return {"status": "ok"}

@router.patch("/update/{volunteer_id}/")
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
    
# get all time registrations for a volunteer for current edition
@router.get("/time_registrations/{volunteer_id}", response=List[TimeRegistrationSchemaOut])
def get_time_registrations(request, volunteer_id: int):
    try:
        current_edition = Edition.objects.get(isCurrentEdition=True)
        volunteer = Volunteer.objects.get(id=volunteer_id)
        time_registrations = TimeRegistration.objects.filter(volunteer=volunteer, edition=current_edition)
        return [TimeRegistrationSchemaOut.from_model(tr) for tr in time_registrations]
    except Volunteer.DoesNotExist:
        raise Http404("Volunteer does not exist")
    except Exception as e:
        raise Http404(str(e))
    
# delete time registration
@router.delete("/time_registration/{time_registration_id}")
def delete_time_registration(request, time_registration_id: int):
    TimeRegistration.objects.get(id=time_registration_id).delete()
    return {"status": "ok", "message": "Time registration deleted successfully"}

# make time registration for a volunteer for current edition
@router.post("/time_registration/{volunteer_id}/", response=TimeRegistrationSchemaOut)
def create_time_registration(request, volunteer_id: int, data: TimeRegistrationSchemaCreateWithTimeStrings):
    try:
        current_edition = Edition.objects.get(isCurrentEdition=True)
        volunteer = Volunteer.objects.get(id=volunteer_id)

        start_time = None
        end_time = None
        # convert the 00:00:00 string to a TimeField
        if (data.start_time):
            hourString, minuteString = data.start_time.split(":")
            start_time = datetime.time(int(hourString), int(minuteString))
        else:
            hourString, minuteString = data.end_time.split(":")
            end_time = datetime.time(int(hourString), int(minuteString))

        # create database object
        time_registration = TimeRegistration.objects.create(
            volunteer=volunteer,
            day=data.day,
            start_time=start_time,
            end_time=end_time,
            edition=current_edition
        )
        return TimeRegistrationSchemaOut.from_model(time_registration)
    except Volunteer.DoesNotExist:
        raise Http404("Volunteer does not exist")
    except Exception as e:
        raise e