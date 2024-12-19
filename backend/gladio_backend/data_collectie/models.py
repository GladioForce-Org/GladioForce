from django.db import models
import random

class Club(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    contact = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    link = models.URLField()
    bank_account = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    btw_number = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=100)
    city = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
    def gen_link(self):
        return ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+', k=64))


class Edition(models.Model):
    year = models.IntegerField()

    def __str__(self):
        return str(self.year)


class Size(models.Model):
    size = models.CharField(max_length=100)

    def __str__(self):
        return self.size


class Tshirt(models.Model):
    size = models.ManyToManyField(Size)
    model = models.CharField(max_length=100)

    def __str__(self):
        return self.model


class AvailableTshirt(models.Model):
    tshirt = models.ForeignKey(Tshirt, on_delete=models.CASCADE)
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=6, decimal_places=2, null=True)

    def __str__(self):
        return f"{self.tshirt} - {self.edition}"


class Volunteer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_registry_number = models.CharField(max_length=100)
    works_day1 = models.BooleanField(default=False)
    works_day2 = models.BooleanField(default=False)
    needs_parking_day1 = models.BooleanField(default=False)
    needs_parking_day2 = models.BooleanField(default=False)
    tshirt = models.ForeignKey(AvailableTshirt, on_delete=models.CASCADE, null=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    size = models.ForeignKey(Size, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ParticipatingClub(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)
    person_in_charge_day1 = models.CharField(max_length=100, null=True)
    person1_in_charge_day1 = models.CharField(max_length=100, null=True)
    person_in_charge_day2 = models.CharField(max_length=100, null=True)
    person1_in_charge_day2 = models.CharField(max_length=100, null=True)

    def __str__(self):
        return f"{self.club} - {self.edition}"


class Task(models.Model):
    description = models.TextField()
    day = models.IntegerField(choices=[(1, "Day 1"), (2, "Day 2")])
    volunteers_required = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    responsible_employee = models.CharField(max_length=100)
    participating_club = models.ForeignKey(ParticipatingClub, on_delete=models.CASCADE)
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.description} - Day {self.day} - {self.edition}"


class TimeRegistration(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    day = models.IntegerField(choices=[(1, "Day 1"), (2, "Day 2")])
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.volunteer} - Day {self.day} - {self.edition}"
    
