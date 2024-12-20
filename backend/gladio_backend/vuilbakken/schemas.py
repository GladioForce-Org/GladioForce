from ninja import Schema
from typing import Optional, List


class ZoneSchema(Schema):
    id: int
    name: str
    description: Optional[str] = None
    color: Optional[str] = None

    
class ContainerSchema(Schema):
    id: int
    container_number: str
    zone: Optional[ZoneSchema] = None 


class ContainerCycleCounterSchema(Schema):
    id: int
    number_of_times_emptied: int
    day: int
    container: Optional[ContainerSchema] = None   
    zone: Optional[ZoneSchema] = None

