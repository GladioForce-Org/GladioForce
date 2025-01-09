from ninja import NinjaAPI
from .admin_api import clubApi
from .admin_api import volunteerApi
from .admin_api import coreMemberApi
from gladio_backend.auth.auth import AuthBearer
from .link_api.router import router as link_router
from .admin_api import tshirtAPI
from .admin_api import editionApi
from vuilbakken.api import container_api
from .registration_api import timeApi

auth=AuthBearer()
api = NinjaAPI(title="Gladio API - Datacollectie", version="1.0.0", csrf=False)



@api.get("/auth", auth=auth)
def auth(request):
    print(f"Headers: {request.headers}")
    return request.auth

api.add_router("/clubs", clubApi.router)
api.add_router("/volunteers", volunteerApi.router)
api.add_router("/collection", link_router)
api.add_router("/coremembers", coreMemberApi.router)
api.add_router("/tshirts", tshirtAPI.router)
api.add_router("/editions", editionApi.router)
api.add_router("/vuilbakken", container_api)
api.add_router("/register", timeApi.router)
