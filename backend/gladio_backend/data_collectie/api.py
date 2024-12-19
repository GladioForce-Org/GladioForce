from ninja import NinjaAPI

from .admin_api import clubApi
from .admin_api import volunteerApi
from .admin_api import coreMemberApi
from gladio_backend.auth.auth import FirebaseAuth
from .link_api.router import router
from .admin_api import tshirtAPI
from vuilbakken.api import container_api


api = NinjaAPI(title="Gladio API - Datacollectie", version="1.0.0")

auth = FirebaseAuth()

@api.get("/auth", auth=auth)
def auth(request):
    return request.auth

api.add_router("/clubs", clubApi.router)
api.add_router("/volunteers", volunteerApi.router)
api.add_router("/collection", router)
api.add_router("/coremembers", coreMemberApi.router)
api.add_router("/tshirts", tshirtAPI.router)
api.add_router("/vuilbakken", container_api)
