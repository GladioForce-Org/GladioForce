from django.shortcuts import get_object_or_404
from .models import AvailableTshirt, Size

def get_tshirt_or_none(tshirt_id: int):
    return get_object_or_404(AvailableTshirt, id=tshirt_id) if tshirt_id else None

def get_size_or_none(size_id: int):
    return get_object_or_404(Size, id=size_id) if size_id else None