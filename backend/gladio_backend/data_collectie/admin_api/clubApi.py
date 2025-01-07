from ninja import NinjaAPI, Router
from data_collectie.models import Club, ParticipatingClub, Volunteer
from data_collectie.schemas import ClubSchemaOut, ClubCreateSchema, VolunteerSchemaOut, ClubSchemaPatch
from typing import List
from gladio_backend.auth.auth import AuthBearer


router = Router(tags=["Clubs_admin"], auth=AuthBearer())

@router.get("/generate_link/{club_id}")
def generate_link(request, club_id: int):
    club = Club.objects.get(id=club_id)
    club.link = club.gen_link()
    club.save()
    return club.link

@router.get("/")
def get_clubs(request):
    clubs = Club.objects.all()
    return list(clubs.values())

#get participating clubs
@router.get("/participating/{edition_id}")
def get_participating_clubs(request, edition_id: int):
    participating_clubs = ParticipatingClub.objects.filter(edition_id=edition_id).select_related('club')
    return list(participating_clubs.values())

#get participating clubs for current edition
@router.get("/participating/current")
def get_participating_clubs_current(request):
    participating_clubs = ParticipatingClub.objects.filter(edition__isCurrentEdition=True).select_related('club')
    return list(participating_clubs.values())

@router.post("/")
def create_club(request, payload: ClubCreateSchema):
    club = Club.objects.create(**payload.dict())
    return {"id": club.id, "name": club.name}

@router.delete("/{club_id}")
def delete_club(request, club_id: int):
    Club.objects.get(id=club_id).delete()
    return {"status": "ok"}

#patch club trough participating club
@router.patch("/update/{participating_club_id}")
def update_club(request, participating_club_id: int, payload: ClubSchemaPatch):
    try:
        # Retrieve the participating club by ID
        participating_club = ParticipatingClub.objects.get(id=participating_club_id)
        # Update the basic fields
        for field in payload.dict().keys():
            if field in ["name", "email", "contact", "phone", "bank_account", "address", "btw_number", "postal_code", "city"]:
                setattr(participating_club.club, field, payload.dict()[field])

        # Save the updated club to the database
        participating_club.club.save()

        return {"status": "ok", "message": "Club updated successfully"}
    except ParticipatingClub.DoesNotExist:
        return {"status": "error", "message": f"Club with ID {participating_club_id} does not exist"}

