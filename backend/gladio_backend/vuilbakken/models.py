from django.db import models



class Edition(models.Model):
    year = models.DateTimeField()

    def __str__(self):
        return f"Edition {self.year}"


class Zone(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class GridBlock(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE)  # FK to Zone
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)  # FK to Edition

    def __str__(self):
        return f"GridBlock ({self.x}, {self.y})"


class Container(models.Model):
    container_number = models.CharField(max_length=100, unique=True)  # Alternate Key (AK)

    def __str__(self):
        return f"Container {self.container_number}"


class ContainerCycleCounter(models.Model):
    number_of_times_emptied = models.IntegerField()
    day = models.IntegerField()
    container = models.ForeignKey(Container, on_delete=models.CASCADE)  # FK to Container
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE)  # FK to Zone

    def __str__(self):
        return (
            f"CycleCounter for {self.container} in Zone {self.zone} "
            f"(Day {self.day}, Emptied {self.number_of_times_emptied} times)"
        )