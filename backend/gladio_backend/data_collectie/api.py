from ninja import NinjaAPI
from .models import Club, ParticipatingClub
from .schemas import ClubCreateSchema

api = NinjaAPI()

@api.get("/helloWorld")
def hello_world(request):
    return {"message": "Hello World"}

@api.get("/clubs")
def get_clubs(request):
    clubs = Club.objects.all()
    return list(clubs.values())

#create club
@api.post("/clubs")
def create_club(request, payload: ClubCreateSchema):
    club = Club.objects.create(**payload.dict())
    return {"id": club.id, "name": club.name}


@api.get("/participating_clubs")
def get_participating_clubs(request):
    participating_clubs = (
        ParticipatingClub.objects.select_related("club")
        .values(
            "id",
            "club_id",
            "club__name",  # Fetch the club name directly
            "edition_id",
            "person_in_charge_day1",
            "person_in_charge_day2",
        )
    )
    return list(participating_clubs)