from ninja import NinjaAPI, Router
from django.http import Http404, JsonResponse
from ..models import Club, Edition, Volunteer, AvailableTshirt, Size
from ..schemas import ClubSchemaOut, VolunteerSchemaOut, ClubSchemaPatch, VolunteerCreateSchema, VolunteerSchemaPatch
from ..services import get_tshirt_or_none, get_size_or_none, list_all_available_tshirts_by_edition
from typing import List

router = Router(tags=["Clubs Data Collection"], auth=None)

#get club with link
@router.get("/{club_link}", response=ClubSchemaOut)
def get_club(request, club_link: str):
    try:
        club = Club.objects.get(link = club_link)
        return club
    except Club.DoesNotExist:
        return {"status": "error", "message": f"Club with link {club_link} does not exist"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

#get all volunteers of a club with link
@router.get("/volunteers/{club_link}", response=List[VolunteerSchemaOut])
def get_volunteers(request, club_link: str):
    print(club_link)
    try:
        club = Club.objects.get(link = club_link)
        volunteers = Volunteer.objects.filter(club = club)
        return volunteers
    except Club.DoesNotExist:
        raise Http404(f"Club with link {club_link} does not exist")
    except Exception as e:
        raise Http404(str(e))

#update club with link
@router.patch("update/{club_link}")
def update_club(request, club_link: str, payload: ClubSchemaPatch):
    try:
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
    except Club.DoesNotExist:
        return {"status": "error", "message": f"Club with link {club_link} does not exist"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

#make volunteer for club
@router.post("/{club_link}")
def create_volunteer(request, club_link: str, payload: VolunteerCreateSchema):
    try:
        club = Club.objects.get(link = club_link)
        volunteer = Volunteer.objects.create(club = club, **payload.dict())
    except Club.DoesNotExist:
        return {"status": "error", "message": f"Club with link {club_link} does not exist"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    return {"id": volunteer.id, "first_name": volunteer.first_name}

#patch volunteer
@router.patch("/update/{club_link}/volunteer/{volunteer_id}")
def update_volunteer(request, volunteer_id: int, payload: VolunteerSchemaPatch, club_link: str):
    try:
        club = Club.objects.get(link = club_link)
        volunteer = Volunteer.objects.get(id=volunteer_id, club=club)
        for field in payload.dict().keys():
            if field in ["first_name", "last_name", "works_day1", "works_day2", "needs_parking_day1", "needs_parking_day2"]:
                setattr(volunteer, field, payload.dict()[field])
        volunteer.tshirt = get_tshirt_or_none(payload.tshirt_id)
        volunteer.size = get_size_or_none(payload.size_id)
        volunteer.save()
        return {"status": "ok", "message": "Volunteer updated successfully"}
    except Club.DoesNotExist:
        return {"status": "error", "message": f"Club with link {club_link} does not exist"}
    except Volunteer.DoesNotExist:
        return {"status": "error", "message": f"Volunteer with ID {volunteer_id} does not exist in this club"}
    except AvailableTshirt.DoesNotExist:
        return {"status": "error", "message": f"Tshirt with ID {payload.tshirt_id} does not exist"}
    except Size.DoesNotExist:
        return {"status": "error", "message": f"Size with ID {payload.size_id} does not exist"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

#delete volunteer
@router.delete("/{club_link}/volunteer/{volunteer_id}")
def delete_volunteer(request, volunteer_id: int, club_link: str):
    try:
        club = Club.objects.get(link = club_link)
        Volunteer.objects.get(id=volunteer_id, club=club).delete()
    except Club.DoesNotExist:
        return {"status": "error", "message": f"Club with link {club_link} does not exist"}
    except Volunteer.DoesNotExist:
        return {"status": "error", "message": f"Volunteer with ID {volunteer_id} does not exist in this club"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    return {"status": "ok"}

#list all available tshirts for current edition
@router.get("/available-tshirts/current/")
def available_tshirts_current_edition_view(request):
    current_edition = Edition.objects.filter(isCurrentEdition=True).first()
    if not current_edition:
        return JsonResponse({"error": "No current edition found"}, status=404)
    available_tshirts = list_all_available_tshirts_by_edition(current_edition.id)
    return available_tshirts