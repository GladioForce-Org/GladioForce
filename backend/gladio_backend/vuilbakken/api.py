from ninja import Router
from vuilbakken.models import Container
from vuilbakken.schemas import ZoneSchema, ContainerSchema, ContainerCycleCounterSchema
from typing import List
from django.db.models import Prefetch
from vuilbakken.models import ContainerCycleCounter

container_api =  Router(tags=["vuilbakken_admin"])

@container_api.get("/hello")
def hello(request):
    return {"message": "Hello World"}


#list containers
@container_api.get("/containers", response=List[ContainerSchema])
def get_containers(request):
    containers = Container.objects.all()
    return containers

#list containers by zone
@container_api.get("/containers/{zone_id}", response=List[ContainerCycleCounterSchema])
def get_containers_by_zone(request, zone_id: int):
    containers = ContainerCycleCounter.objects.filter(zone=zone_id)
    return containers
#list zones
@container_api.get("/zones", response=List[ZoneSchema])
def get_zones(request):
    zones = Container.objects.prefetch_related('zone').values('zone').distinct()
    return zones

#list all counters
@container_api.get("/counters", response=List[ContainerCycleCounterSchema])
def get_counters(request):
    counters = ContainerCycleCounter.objects.all()
    return counters