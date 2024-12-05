from ninja import NinjaAPI
from .models import Club

api = NinjaAPI()

@api.get("/helloWorld")
def hello_world(request):
    return {"message": "Hello World"}

@api.get("/clubs")
def get_clubs(request):
    clubs = Club.objects.all()
    return list(clubs.values())