from ninja import Router
from typing import List
from data_collectie.models import Tshirt, Size, AvailableTshirt, Edition
from gladio_backend.auth.auth import FirebaseAuth
from data_collectie.schemas import TshirtSchema, SizeSchema, AvailableTshirtsResponseSchema, AvailableTshirtSchema, AvailableTshirtResponseSchema
from data_collectie.services import list_all_available_tshirts, get_available_tshirt_details

router = Router(tags=["Tshirt_admin"], auth=None)

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
def create_tshirt(request, data: TshirtSchema):
    tshirt = Tshirt.objects.create(model=data.model)
    tshirt.size.set(data.sizes)  # Assign the ManyToMany relationship
    return {
        "id": tshirt.id,
        "model": tshirt.model,
        "sizes": data.sizes
    }

# update T-shirt(model)
@router.patch("/tshirts/{tshirt_id}", response=TshirtSchema)
def update_tshirt(request, tshirt_id: int, data: TshirtSchema):
    tshirt = Tshirt.objects.get(id=tshirt_id)
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
def create_size(request, data: SizeSchema):
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


#list available tshirts
@router.get("/available-tshirts", response=List[AvailableTshirtsResponseSchema])
def available_tshirts_list_view(request):
    return list_all_available_tshirts()


# Get Available T-shirt
@router.get("/available_tshirts/{available_tshirt_id}", response=AvailableTshirtResponseSchema)
def get_available_tshirt(request, available_tshirt_id: int):
    return get_available_tshirt_details(available_tshirt_id)


# Create Available T-shirt
@router.post("/available_tshirts", response=AvailableTshirtSchema)
def create_available_tshirt(request, data: AvailableTshirtSchema):
    available_tshirt = AvailableTshirt.objects.create(
        tshirt_id=data.tshirt_id,
        edition_id=data.edition_id,
        price=data.price
    )
    return {
        "id": available_tshirt.id,
        "tshirt_id": available_tshirt.tshirt.id,
        "edition_id": available_tshirt.edition.id,
        "price": available_tshirt.price
    }

# update Available T-shirt(set price)
@router.patch("/available_tshirts/{available_tshirt_id}", response=AvailableTshirtSchema)
def update_available_tshirt(request, available_tshirt_id: int, data: AvailableTshirtSchema):
    available_tshirt = AvailableTshirt.objects.get(id=available_tshirt_id)
    available_tshirt.price = data.price
    available_tshirt.save()
    return {
        "id": available_tshirt.id,
        "tshirt_id": available_tshirt.tshirt.id,
        "edition_id": available_tshirt.edition.id,
        "price": available_tshirt.price
    }

# Delete Available T-shirt
@router.delete("/available_tshirts/{available_tshirt_id}")
def delete_available_tshirt(request, available_tshirt_id: int):
    available_tshirt = AvailableTshirt.objects.get(id=available_tshirt_id)
    available_tshirt.delete()
    return {"status": "ok"}

