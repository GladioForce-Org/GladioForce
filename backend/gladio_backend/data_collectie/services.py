from django.shortcuts import get_object_or_404
from data_collectie.schemas import AvailableTshirtInSchema, ParticipatingClubSchemaPatch
from .models import AvailableTshirt, Club, ParticipatingClub, Size, Tshirt, Edition;
from typing import List, Dict, Optional



def get_tshirt_or_none(tshirt_id: int):
    return get_object_or_404(AvailableTshirt, id=tshirt_id) if tshirt_id else None

def get_size_or_none(size_id: int):
    return get_object_or_404(Size, id=size_id) if size_id else None


def list_all_available_tshirts() -> List[Dict]:
    """
    Retrieve all available t-shirts with their details.
    """
    available_tshirts = AvailableTshirt.objects.select_related('tshirt', 'edition').prefetch_related('tshirt__size')
    result = []

    for available in available_tshirts:
        tshirt = available.tshirt
        if not tshirt:
            continue

        # Get size names
        size_names = [size.size for size in tshirt.size.all()]  # Use 'size' as defined in the model

        # Build the entry
        result.append({
            "id": available.id,
            "tshirt_id": tshirt.id,  # Add tshirt_id
            "edition_id": available.edition.id,  # Add edition_id
            "model": tshirt.model,
            "sizes": size_names,
            "price": available.price,
        })

    return result


def list_all_available_tshirts_by_edition(edition_id: int) -> List[Dict]:
    """
    Retrieve all available t-shirts for a specific edition.
    """
    try:
        edition_id = int(edition_id)
    except ValueError:
        return []  # Return an empty list if edition_id is not a valid integer.

    available_tshirts = AvailableTshirt.objects.select_related('tshirt', 'edition').prefetch_related('tshirt__size').filter(edition_id=edition_id)
    result = []

    for available in available_tshirts:
        tshirt = available.tshirt
        if not tshirt:
            continue

        # Build the entry
        result.append({
            "id": available.id,
            "tshirt_id": tshirt.id,
            "model": tshirt.model,
            "sizes": list(tshirt.size.all().values("id", "size")),  # Use 'size' as defined in the model
            "price": available.price,
        })

    return result


def get_available_tshirt_details(tshirt_id: int) -> Optional[Dict]:
    # Fetch the AvailableTshirt instance
    available_tshirt = get_tshirt_or_none(tshirt_id)
    if not available_tshirt:
        return None

    # Fetch the related Tshirt instance
    tshirt = available_tshirt.tshirt
    if not tshirt:
        return None

    # Get size names
    size_names = [size.size for size in tshirt.size.all()]  # Correctly fetch related sizes

    # Build the response
    return {
        "id": available_tshirt.id,
        "model": tshirt.model,
        "sizes": size_names,
        "price": available_tshirt.price,
    }

def patch_tshirt_then_patch_available_tshirt(available_tshirt_id: int, data: AvailableTshirtInSchema):
    # Fetch the Tshirt instance
    tshirt = Tshirt.objects.get(id=data.tshirt_id)
    if tshirt:
        tshirt.model = data.model

        # transform data.sizes in a list of integers
        tshirt.size.clear()

        sizes = []
        for size in data.sizes:
            size_id = size.id
            sizes.append(size_id)

        tshirt.size.set(sizes)

        tshirt.save()

    # Update the AvailableTshirt instance
    available_tshirt = AvailableTshirt.objects.get(id=available_tshirt_id)
    
    if available_tshirt:
        available_tshirt.price = data.price
        available_tshirt.save()

    # Return the updated Tshirt instance
    return available_tshirt

def patch_club_then_patch_participating_club(participating_club_id: int, data: ParticipatingClubSchemaPatch):
    # Fetch the Club instance
    club = Club.objects.get(id=data.club_id)
    if club:
        club.address = data.address
        club.bank_account = data.bank_account
        club.btw_number = data.btw_number
        club.city = data.city
        club.contact = data.contact
        club.email = data.email
        club.name = data.name
        club.phone = data.phone
        club.postal_code = data.postal_code
        club.save()

    # Update the Participating Club instance
    participating_club = ParticipatingClub.objects.get(id=participating_club_id)
    
    if participating_club:
        participating_club.person_in_charge_day1 = data.person_in_charge_day1
        participating_club.person1_in_charge_day1 = data.person1_in_charge_day1
        participating_club.person_in_charge_day2 = data.person_in_charge_day2
        participating_club.person1_in_charge_day2 = data.person1_in_charge_day2
        participating_club.save()

    # Return the updated Participating Club instance
    return participating_club
