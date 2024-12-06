from ninja import NinjaAPI, Router
from .models import Club, ParticipatingClub, Volunteer
from .schemas import ClubSchemaOut, ClubCreateSchema, VolunteerSchemaOut
from typing import List


router = Router() 

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

@router.get("/{club_link}", response=ClubSchemaOut)
def get_club(request, club_link: str):
    club = Club.objects.get(link = club_link)
    return club

#get all volunteers of a club
@router.get("/{club_link}/volunteers", response=List[VolunteerSchemaOut])
def get_volunteers(request, club_link: str):
    club = Club.objects.get(link = club_link)
    volunteers = Volunteer.objects.filter(club = club)
    return list(volunteers)

@router.post("/")
def create_club(request, payload: ClubCreateSchema):
    club = Club.objects.create(**payload.dict())
    return {"id": club.id, "name": club.name}

api = NinjaAPI()