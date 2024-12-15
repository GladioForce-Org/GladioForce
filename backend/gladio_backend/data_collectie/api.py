from ninja import NinjaAPI

from .admin_api import clubApi
from .admin_api import volunteerApi
from gladio_backend.auth.auth import FirebaseAuth
from .link_api.router import router



api = NinjaAPI()

auth = FirebaseAuth()

@api.get("/auth", auth=auth)
def auth(request):
    return request.auth

api.add_router("/clubs", clubApi.router)
api.add_router("/volunteers", volunteerApi.router)
api.add_router("/collection", router)