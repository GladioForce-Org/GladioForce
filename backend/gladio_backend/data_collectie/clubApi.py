from ninja import NinjaAPI, Router
from .models import Club, ParticipatingClub, Volunteer
from .schemas import ClubSchemaOut, ClubCreateSchema, VolunteerSchemaOut, ClubSchemaPatch
from typing import List
from django.http import Http404
from gladio_backend.auth.auth import FirebaseAuth


router = Router(tags=["Clubs_admin"], auth=FirebaseAuth())

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

@router.post("/")
def create_club(request, payload: ClubCreateSchema):
    club = Club.objects.create(**payload.dict())
    return {"id": club.id, "name": club.name}

@router.delete("/{club_id}")
def delete_club(request, club_id: int):
    Club.objects.get(id=club_id).delete()
    return {"status": "ok"}



#moved: not authenticate with JWT
# @router.get("/{club_link}", response=ClubSchemaOut)
# def get_club(request, club_link: str):
#     club = Club.objects.get(link = club_link)
#     return club

#get all volunteers of a club
# @router.get("/{club_link}/volunteers", response=List[VolunteerSchemaOut])
# def get_volunteers(request, club_link: str):
#     club = Club.objects.get(link = club_link)
#     volunteers = Volunteer.objects.filter(club = club)
#     return list(volunteers)



#moved: not authenticate with JWT
# @router.patch("update/{club_link}")
# def update_club(request, club_link: str, payload: ClubSchemaPatch):
#     club = Club.objects.get(link=club_link)
#     club.name = payload.name
#     club.email = payload.email
#     club.contact = payload.contact
#     club.phone = payload.phone
#     club.bank_account = payload.bank_account
#     club.address = payload.address
#     club.btw_number = payload.btw_number
#     club.postal_code = payload.postal_code
#     club.city = payload.city
#     club.save()
#     return {"status": "ok"}


api = NinjaAPI()