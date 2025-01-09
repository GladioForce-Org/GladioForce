from ninja import Router
from typing import List
from data_collectie.models import Edition, Volunteer
from data_collectie.schemas import EditionSchema, EditionCreateSchema
from gladio_backend.auth.auth import AuthBearer

router = Router(tags=["Edition_admin"], auth=AuthBearer())

# List Editions
@router.get("/")
def get_editions(request):
    editions = Edition.objects.all()
    return list(editions.values())

# get current edition
@router.get("/current")
def get_current_edition(request):
    edition = Edition.objects.filter(isCurrentEdition=True).first()
    return { "id": edition.id, "year": edition.year, "isCurrentEdition": True }

# Create Edition
@router.post("/")
def create_edition(request, payload: EditionCreateSchema):
    # Find the current edition if it exists
    oldEdition = Edition.objects.filter(isCurrentEdition=True).first()

    # If an old edition exists, set its isCurrentEdition to False
    if oldEdition:
        oldEdition.isCurrentEdition = False
        oldEdition.save()

    # Create the new Edition
    edition = Edition.objects.create(**payload.dict())
    edition.isCurrentEdition = True
    edition.save()

    # Set works_day1 and works_day2 to False for all volunteers
    Volunteer.objects.update(works_day1=False, works_day2=False)

    return { "id": edition.id, "year": edition.year, "isCurrentEdition": True }

# Edit Edition
@router.patch("/{edition_id}", response=EditionSchema)
def update_edition(request, edition_id: int, data: EditionSchema):
    edition = Edition.objects.get(id=edition_id)

    if data.isCurrentEdition:
        # Find the current edition if it exists
        oldEdition = Edition.objects.filter(isCurrentEdition=True).first()

        # If an old edition exists, set its isCurrentEdition to False
        if oldEdition:
            oldEdition.isCurrentEdition = False
            oldEdition.save()

        edition.isCurrentEdition = data.isCurrentEdition

    edition.year = data.year
    edition.save()

    return { "id": edition.id, "year": edition.year, "isCurrentEdition": True }

# Delete Edition
@router.delete("/{edition_id}")
def delete_edition(request, edition_id: int):
    Edition.objects.get(id=edition_id).delete()
    return {"status": "ok"}