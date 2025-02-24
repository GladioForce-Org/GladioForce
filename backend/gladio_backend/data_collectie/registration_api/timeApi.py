from ninja import Router
from typing import List
from django.http import Http404, JsonResponse
from data_collectie.schemas import AvailableTshirtsResponseSchema, SizeSchema
from data_collectie.services import list_all_available_tshirts_by_edition
from ..models import Club, Size, TimeRegistration, Edition, ParticipatingClub, Volunteer
from django.utils import timezone
from .schemas import ParticipatingClubSchemaOut, VolunteerSchemaOut, TimeRegistrationSchemaCreate, TimeRegistrationSchemaOut

router = Router(tags=["Time registrations"], auth=None)


# available clubs for the current edition
@router.get("/available_clubs", response=List[ParticipatingClubSchemaOut])
def get_available_clubs(request):
    try:
        # Get the current edition
        current_edition = Edition.objects.get(isCurrentEdition=True)
        # Filter participating clubs for the current edition
        participating_clubs = ParticipatingClub.objects.filter(edition=current_edition)
        # Return the participating clubs (Django-Ninja will serialize using the schema)
        return participating_clubs
    except Edition.DoesNotExist:
        raise Http404("Current edition does not exist")
    except ParticipatingClub.DoesNotExist:
        raise Http404("No participating clubs for current edition")
    except Exception as e:
        raise Http404(str(e))
    
# get volunteer by id for club id
@router.get("/{club_id}/volunteer/{volunteer_id}", response=VolunteerSchemaOut)
def get_volunteer(request, club_id: int, volunteer_id: int):
    try:
        club = Club.objects.get(id=club_id)
        volunteer = club.volunteers.get(id=volunteer_id)
        return volunteer
    except Club.DoesNotExist:
        raise Http404("Club does not exist")
    except Volunteer.DoesNotExist:
        raise Http404("Volunteer does not exist")
    except Exception as e:
        raise Http404(str(e))
    
    
# get all the volunteers of a club
@router.get("/{club_id}/volunteers", response=List[VolunteerSchemaOut])
def get_club_volunteers(request, club_id: int):
    try:
        club = Club.objects.get(id=club_id)
        volunteers = club.volunteers.filter(works_day1=True) | club.volunteers.filter(works_day2=True)
        return volunteers
    except Club.DoesNotExist:
        raise Http404("Club does not exist")
    except Exception as e:
        raise Http404(str(e))
    
# make time registration for a volunteer for current edition
@router.post("/time_registration/{volunteer_id}", response=TimeRegistrationSchemaOut)
def create_time_registration(request, volunteer_id: int, data: TimeRegistrationSchemaCreate):
    try:
        current_edition = Edition.objects.get(isCurrentEdition=True)
        volunteer = Volunteer.objects.get(id=volunteer_id)
        time_registration = TimeRegistration.objects.create(
            volunteer=volunteer,
            day=data.day,
            start_time=timezone.now() if data.start_time else None,
            end_time=timezone.now() if data.end_time else None,
            edition=current_edition
        )
        return TimeRegistrationSchemaOut.from_model(time_registration)
    except Volunteer.DoesNotExist:
        raise Http404("Volunteer does not exist")
    except Exception as e:
        raise Http404(str(e))


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
    
# get a count of all time registrations for a volunteer for current edition
@router.get("/time_registrations_count/{volunteer_id}/{day}", response=int)
def get_time_registrations_count(request, volunteer_id: int, day: int):
    try:
        current_edition = Edition.objects.get(isCurrentEdition=True)
        volunteer = Volunteer.objects.get(id=volunteer_id)
        time_registrations = TimeRegistration.objects.filter(volunteer=volunteer, edition=current_edition, day=day)
        return len(time_registrations)
    except Volunteer.DoesNotExist:
        raise Http404("Volunteer does not exist")
    except Exception as e:
        raise Http404(str(e))
    
#list all available tshirts for current edition
@router.get("/available-tshirts/current/")
def available_tshirts_current_edition_view(request):
    current_edition = Edition.objects.filter(isCurrentEdition=True).first()
    if not current_edition:
        return JsonResponse({"error": "No current edition found"}, status=404)
    available_tshirts = list_all_available_tshirts_by_edition(current_edition.id)
    return available_tshirts

#get sizes
@router.get("/sizes", response=List[SizeSchema])
def list_sizes(request):
    sizes = Size.objects.all()
    return [
        {
            "id": size.id,
            "size": size.size
        }
        for size in sizes
    ]