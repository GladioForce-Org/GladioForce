from django.shortcuts import get_object_or_404
from .models import AvailableTshirt, Size;
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
    available_tshirts = AvailableTshirt.objects.select_related('tshirt', 'edition').prefetch_related('tshirt__size').filter(edition_id=edition_id)
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
