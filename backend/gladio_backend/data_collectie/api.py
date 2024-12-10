from ninja import NinjaAPI
from . import clubApi, volunteerApi


api = NinjaAPI()

api.add_router("/clubs", clubApi.router)
api.add_router("/volunteers", volunteerApi.router)
