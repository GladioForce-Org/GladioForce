from ninja import Schema, Router
from data_collectie.schemas import CoreMemberCreateSchema
from typing import List
from data_collectie.services import get_tshirt_or_none, get_size_or_none
from gladio_backend.auth.auth import FirebaseAuth
from firebase_admin import auth
from django.http import HttpResponseForbidden, HttpResponseBadRequest, JsonResponse
from firebase_admin import auth
import random

router = Router(tags=["Coremember_admin"], auth=FirebaseAuth())

@router.post("/")
def create_core_member(request, payload: CoreMemberCreateSchema):
    # A random password is used to create the user, as they will be asked to set their own password via mail
    randomPassword: str = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', k=30))

    print(request)

    try:
        # Create a user with email and password
        user = auth.create_user(
            email = payload.email,
            display_name = payload.display_name,
            phone_number = payload.phone_number,
            password= randomPassword,
        )
        # Return user details
        return {"uid": user.uid, "email": user.email}
    except auth.InsufficientPermissionError:
        raise HttpResponseForbidden("U hebt niet de rechten om een gebruiker aan te maken.")
    except auth.EmailAlreadyExistsError:
        raise HttpResponseBadRequest("Er bestaat al een gebruiker met dit E-mailadres.")
    except Exception as e:
        # Catch any other exceptions
        return JsonResponse({"error": f"Er liep iets fout bij het aanmaken van de gebruiker: {str(e)}"}, status=400)
    
