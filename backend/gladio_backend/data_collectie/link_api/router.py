from ninja import NinjaAPI, Router
from django.http import Http404
from ..models import Club, ParticipatingClub, Volunteer
from ..schemas import ClubSchemaOut, ClubCreateSchema, VolunteerSchemaOut, ClubSchemaPatch, VolunteerCreateSchema, VolunteerSchemaPatch
from ..services import get_tshirt_or_none, get_size_or_none
from typing import List

router = Router(tags=["Clubs"])

#get club with link
@router.get("/{club_link}", response=ClubSchemaOut)
def get_club(request, club_link: str):
    club = Club.objects.get(link = club_link)
    return club

#get all volunteers of a club with link
@router.get("/{club_link}/volunteers", response=List[VolunteerSchemaOut])
def get_volunteers(request, club_link: str):
    club = Club.objects.get(link = club_link)
    volunteers = Volunteer.objects.filter(club = club)
    return list(volunteers)

#update club with link
@router.patch("update/{club_link}")
def update_club(request, club_link: str, payload: ClubSchemaPatch):
    club = Club.objects.get(link=club_link)
    club.name = payload.name
    club.email = payload.email
    club.contact = payload.contact
    club.phone = payload.phone
    club.bank_account = payload.bank_account
    club.address = payload.address
    club.btw_number = payload.btw_number
    club.postal_code = payload.postal_code
    club.city = payload.city
    club.save()
    return {"status": "ok"}

#make volunteer for club
@router.post("/{club_link}")
def create_volunteer(request, club_link: str, payload: VolunteerCreateSchema):
    club = Club.objects.get(link = club_link)
    volunteer = Volunteer.objects.create(club = club, **payload.dict())
    return {"id": volunteer.id, "first_name": volunteer.first_name}

#patch volunteer
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
    
#delete volunteer
@router.delete("/{volunteer_id}")
def delete_volunteer(request, volunteer_id: int):
    Volunteer.objects.get(id=volunteer_id).delete()
    return {"status": "ok"}