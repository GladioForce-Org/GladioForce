from ninja import Router
from typing import List
from django.http import Http404
from ..models import Club, TimeRegistration, Edition, ParticipatingClub, Volunteer
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
def create_time_registration(data: TimeRegistrationSchemaCreate):
    try:
        current_edition = Edition.objects.get(isCurrentEdition=True)
        volunteer = Volunteer.objects.get(id=data.volunteer_id)
        time_registration = TimeRegistration.objects.create(
            volunteer=volunteer,
            day=data.day,
            start_time=data.start_time,
            end_time=data.end_time,
            edition=current_edition
        )
        return time_registration
    except Volunteer.DoesNotExist:
        raise Http404("Volunteer does not exist")
    except Exception as e:
        raise Http404(str(e))

