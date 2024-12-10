from ninja import NinjaAPI
from .clubApi import router as club_router
from .volunteerApi import router as volunteer_router

api = NinjaAPI()

# Add the routers with different prefixes
api.add_router("/clubs", club_router)
api.add_router("/volunteers", volunteer_router)