from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Router
from data_collectie.services import patch_club_then_patch_participating_club
from data_collectie.models import Club, Edition, ParticipatingClub, Volunteer
from data_collectie.schemas import ClubSchemaOut, ClubCreateSchema, ParticipatingClubSchema, ParticipatingClubInSchema, ParticipatingClubSchemaPatch, VolunteerSchemaOut, ClubSchemaPatch
from typing import List
from gladio_backend.auth.auth import AuthBearer


router = Router(tags=["Clubs_admin"], auth=AuthBearer())

@router.get("/generate_link/{club_id}/")
def generate_link(request, club_id: int):
    club = Club.objects.filter(id=club_id).first()
    if not club:
        return JsonResponse({"error": "No club found for this ID."}, status=404)
    
    club.link = club.gen_link()
    club.save()
    return JsonResponse({"link": club.link})

# Get all clubs
@router.get("/", response=List[ClubSchemaOut])
def get_clubs(request):
    clubs = Club.objects.all()
    return list(clubs.values())

# Get a club by ID
@router.get("/{club_id}/", response=ClubSchemaOut)
def get_club(request, club_id: int):
    club = Club.objects.filter(id=club_id).first()
    if not club:
        return JsonResponse({"error": "No club found for this ID."}, status=404)

    return club

# Get volunteers of a club
@router.get("/volunteers/{club_id}/", response=List[VolunteerSchemaOut])
def get_volunteers(request, club_id: int):
    volunteers = Volunteer.objects.filter(club_id=club_id)
    return list(volunteers.values())

#get participating clubs
@router.get("/participating/{edition_id}", response=List[ParticipatingClubSchema])
def get_participating_clubs(request, edition_id: int):
    participating_clubs = ParticipatingClub.objects.filter(edition_id=edition_id).select_related('club')
    return list(participating_clubs.values())

#get participating clubs for current edition
@router.get("/participating/current/", response=List[ParticipatingClubSchema])
def get_participating_clubs_current(request):
    current_edition = Edition.objects.filter(isCurrentEdition=True).first()
    if not current_edition:
        return JsonResponse({"error": "No current edition found"}, status=404)

    participating_clubs = ParticipatingClub.objects.filter(edition__isCurrentEdition=True).select_related('club')
    return [ParticipatingClubSchema.from_orm(pc) for pc in participating_clubs]

@router.post("/")
def create_club(request, payload: ClubCreateSchema):
    club = Club.objects.create(**payload.dict())
    return {"id": club.id, "name": club.name, "email": club.email, "contact": club.contact, "phone": club.phone, "link": club.link, "bank_account": club.bank_account, "address": club.address, "btw_number": club.btw_number, "postal_code": club.postal_code, "city": club.city}

# Create Participating Club for current edition
@router.post("/participating", response=ParticipatingClubSchema)
def create_participating_club(request, data: ParticipatingClubInSchema):
    current_edition = Edition.objects.filter(isCurrentEdition=True).first()
    if not current_edition:
        return JsonResponse({"error": "No current edition found"}, status=404)
    
    # Check if the club exists
    new_club_id = data.club_id

    existing_club = Club.objects.filter(id=data.club_id).first()
    if not existing_club:
        new_club = Club.objects.create(
            name=data.name,
            email=data.email,
            contact=data.contact,
            phone=data.phone,
            link=data.link,
            bank_account=data.bank_account,
            address=data.address,
            btw_number=data.btw_number,
            postal_code=data.postal_code,
            city=data.city
        )

        new_club_id = new_club.id

    participating_club = ParticipatingClub.objects.create(
        club_id=new_club_id,
        edition_id=current_edition.id,
        person_in_charge_day1=data.person_in_charge_day1,
        person1_in_charge_day1=data.person1_in_charge_day1,
        person_in_charge_day2=data.person_in_charge_day2,
        person1_in_charge_day2=data.person1_in_charge_day2
    )

    return {
        "id": participating_club.id,
        "club_id": participating_club.club.id,
        "edition_id": participating_club.edition_id,
        "person_in_charge_day1": participating_club.person_in_charge_day1,
        "person1_in_charge_day1": participating_club.person1_in_charge_day1,
        "person_in_charge_day2": participating_club.person_in_charge_day2,
        "person1_in_charge_day2": participating_club.person1_in_charge_day2
    }

@router.delete("/{club_id}")
def delete_club(request, club_id: int):
    Club.objects.get(id=club_id).delete()
    return {"status": "ok"}

@router.delete("/participating/{participating_club_id}/")
def delete_participating_club(request, participating_club_id: int):
    participating_club = ParticipatingClub.objects.filter(id=participating_club_id).first()
    if not participating_club:
        return JsonResponse({"error": "No participating club found for this ID."}, status=404)
    participating_club.delete()
    return {"status": "ok"}

@router.patch("/participating/{participating_club_id}/", response=ParticipatingClubSchema)
def update_participating_club(request, participating_club_id: int, data: ParticipatingClubSchemaPatch):
    patched_club = patch_club_then_patch_participating_club(participating_club_id, data)

    return patched_club

#patch club through participating club
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
        return JsonResponse({"error": f"Club with ID {participating_club_id} does not exist"}, status=404)

