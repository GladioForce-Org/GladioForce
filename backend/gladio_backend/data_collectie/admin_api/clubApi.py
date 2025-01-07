from ninja import NinjaAPI, Router
from data_collectie.models import Club, ParticipatingClub, Volunteer
from data_collectie.schemas import ClubSchemaOut, ClubCreateSchema, VolunteerSchemaOut, ClubSchemaPatch
from typing import List


router = Router(tags=["Clubs_admin"])

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

@router.post("/")
def create_club(request, payload: ClubCreateSchema):
    club = Club.objects.create(**payload.dict())
    return {"id": club.id, "name": club.name}

@router.delete("/{club_id}")
def delete_club(request, club_id: int):
    Club.objects.get(id=club_id).delete()
    return {"status": "ok"}

