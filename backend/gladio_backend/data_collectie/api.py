from ninja import NinjaAPI

api = NinjaAPI()

@api.get("/helloWorld")
def hello_world(request):
    return {"message": "Hello World"}
