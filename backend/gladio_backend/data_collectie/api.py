from ninja import NinjaAPI
from . import clubApi, volunteerApi
from gladio_backend.auth.auth import FirebaseAuth



api = NinjaAPI()

auth = FirebaseAuth()

@api.get("/auth", auth=auth)
def auth(request):
    return request.auth

api.add_router("/clubs", clubApi.router)
api.add_router("/volunteers", volunteerApi.router)
