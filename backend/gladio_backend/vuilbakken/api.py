from ninja import Router


container_api =  Router(tags=["vuilbakken_admin"])

@container_api.get("/hello")
def hello(request):
    return {"message": "Hello World"}