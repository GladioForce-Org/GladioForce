from ninja import Router
from typing import List
from data_collectie.models import Tshirt, Size, AvailableTshirt, Edition
from django.http import JsonResponse
from data_collectie.schemas import TshirtSchema, SizeSchema, AvailableTshirtsResponseSchema, AvailableTshirtSchema, AvailableTshirtResponseSchema, AvailableTshirtInSchema, SizeCreateSchema, TshirtCreateSchema
from data_collectie.services import get_available_tshirt_details, list_all_available_tshirts_by_edition, patch_tshirt_then_patch_available_tshirt
from django.shortcuts import get_object_or_404
from gladio_backend.auth.auth import AuthBearer

router = Router(tags=["Tshirt_admin"], auth=AuthBearer())

# List T-shirts
@router.get("/tshirts", response=List[TshirtSchema])
def list_tshirts(request):
    tshirts = Tshirt.objects.prefetch_related('size').all()
    return [
        {
            "id": tshirt.id,
            "model": tshirt.model,
            "sizes": [size.id for size in tshirt.size.all()]
        }
        for tshirt in tshirts
    ]

# Create T-shirt(model)
@router.post("/tshirts", response=TshirtSchema)
def create_tshirt(request, data: TshirtCreateSchema):
    tshirt = Tshirt.objects.create(model=data.model)
    tshirt.size.set(data.sizes)  # Assign the ManyToMany relationship
    return {
        "id": tshirt.id,
        "model": tshirt.model,
        "sizes": data.sizes
    }

# update T-shirt(model)
@router.patch("/tshirts/{tshirt_id}", response=TshirtSchema)
def update_tshirt(request, tshirt_id: int, data: TshirtCreateSchema):
    tshirt = Tshirt.objects.get(id=tshirt_id)
    if data.model:
        tshirt.model = data.model
    tshirt.size.set(data.sizes)
    tshirt.save()
    return {
        "id": tshirt.id,
        "model": tshirt.model,
        "sizes": data.sizes
    }

# Delete T-shirt(model)
@router.delete("/tshirts/{tshirt_id}")
def delete_tshirt(request, tshirt_id: int):
    tshirt = Tshirt.objects.get(id=tshirt_id)
    tshirt.delete()
    return {"status": "ok"}




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

# Create Size
@router.post("/sizes", response=SizeSchema)
def create_size(request, data: SizeCreateSchema):
    size = Size.objects.create(size=data.size)
    return {
        "id": size.id,
        "size": size.size
    }

# update Size
@router.patch("/sizes/{size_id}", response=SizeSchema)
def update_size(request, size_id: int, data: SizeSchema):
    size = Size.objects.get(id=size_id)
    size.size = data.size
    size.save()
    return {
        "id": size.id,
        "size": size.size
    }

# Delete Size
@router.delete("/sizes/{size_id}")
def delete_size(request, size_id: int):
    size = Size.objects.get(id=size_id)
    size.delete()
    return {"status": "ok"}


#list available tshirts by edition
@router.get("/available-tshirts/{edition_id}", response=List[AvailableTshirtsResponseSchema])
def available_tshirts_list_view(request, edition_id: int):
    available_tshirts = list_all_available_tshirts_by_edition(edition_id)
    return available_tshirts

#list all available tshirts for current edition
@router.get("/available-tshirts/current/")
def available_tshirts_current_edition_view(request):
    current_edition = Edition.objects.filter(isCurrentEdition=True).first()
    if not current_edition:
        return JsonResponse({"error": "No current edition found"}, status=404)
    available_tshirts = list_all_available_tshirts_by_edition(current_edition.id)
    return available_tshirts


# Get Available T-shirt details
@router.get("/available_tshirts/{available_tshirt_id}", response=AvailableTshirtResponseSchema)
def get_available_tshirt(request, available_tshirt_id: int):
    return get_available_tshirt_details(available_tshirt_id)

@router.get("/tshirt_sizes/{tshirt_id}/")
def get_tshirt_sizes(request, tshirt_id: int):
    tshirt = get_object_or_404(Tshirt, id=tshirt_id)
    sizes = tshirt.size.all()
    return [{"id": size.id, "size": size.size} for size in sizes]

# Create Available T-shirt for current edition
@router.post("/available_tshirts", response=AvailableTshirtSchema)
def create_available_tshirt(request, data: AvailableTshirtInSchema):
    current_edition = Edition.objects.filter(isCurrentEdition=True).first()
    if not current_edition:
        return JsonResponse({"error": "No current edition found"}, status=404)
    
    # Check if the tshirt exists
    new_tshirt_id = data.tshirt_id

    existing_tshirt = Tshirt.objects.filter(id=data.tshirt_id).first()
    if not existing_tshirt:
        new_tshirt = Tshirt.objects.create(model=data.model)

        # transform data.sizes in a list of id
        sizes = []
        for size in data.sizes:
            size_id = size.id
            sizes.append(size_id)

        new_tshirt.size.set(sizes)
        new_tshirt_id = new_tshirt.id

    available_tshirt = AvailableTshirt.objects.create(tshirt_id=new_tshirt_id, edition_id=current_edition.id, price=data.price)

    return {
        "id": available_tshirt.id,
        "tshirt_id": available_tshirt.tshirt.id,
        "edition_id": available_tshirt.edition.id,
        "price": available_tshirt.price
    }


# update Available T-shirt(set price)
@router.patch("/available_tshirts/{available_tshirt_id}", response=AvailableTshirtSchema)
def update_available_tshirt(request, available_tshirt_id: int, data: AvailableTshirtInSchema):
    patched_tshirt = patch_tshirt_then_patch_available_tshirt(available_tshirt_id, data)

    return patched_tshirt

# Delete Available T-shirt
@router.delete("/available_tshirts/{available_tshirt_id}")
def delete_available_tshirt(request, available_tshirt_id: int):
    available_tshirt = AvailableTshirt.objects.get(id=available_tshirt_id)
    available_tshirt.delete()
    return {"status": "ok"}

