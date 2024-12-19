from ninja import Schema, Router
from data_collectie.schemas import CoreMemberCreateSchema, CoreMemberSchema
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
    
@router.get("/", response=List[CoreMemberSchema])
def get_core_members(request):
    # Create an empty list to store the core members
    core_members = []

    # Start from the first page of users
    page = auth.list_users()

    while page:
        # Iterate over the users in this page
        for user in page.users:
            # Create a CoreMemberSchema instance for each user
            core_members.append(CoreMemberSchema(
                id= user.uid,
                email= user.email,
                display_name= user.display_name,
                phone_number= user.phone_number
            ))
        
        # Check if there are more users to paginate
        if page.next_page_token:
            page = auth.list_users(next_page_token=page.next_page_token)
        else:
            break

    # Return the list of CoreMemberSchema objects
    return core_members

@router.get("/{id}", response=CoreMemberSchema)
def get_core_member(request, id: str):
    # Get the user with the specified ID
    user = auth.get_user(id)

    # Return a CoreMemberSchema object
    return CoreMemberSchema(
        id= user.uid,
        email= user.email,
        display_name= user.display_name,
        phone_number= user.phone_number
    )

@router.delete("/{id}")
def delete_core_member(request, id: str):
    # Delete the user with the specified ID
    auth.delete_user(id)

    # Return a success message
    return {"message": "Gebruiker succesvol verwijderd."}

@router.put("/{id}")
def update_core_member(request, id: str, payload: CoreMemberCreateSchema):
    # Update the user with the specified ID
    user = auth.update_user(
        id,
        email = payload.email,
        display_name = payload.display_name,
        phone_number = payload.phone_number
    )

    # Return a success message
    return {"message": "Gebruiker succesvol geüpdatet."}

