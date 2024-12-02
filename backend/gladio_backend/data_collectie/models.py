from django.db import models
import hashlib


class Club(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    contact = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    link = models.URLField()
    bank_account = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    BTW_number = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=100)
    city = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
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
    
class availableTshirt(models.Model):
    tshirt = models.ForeignKey(Tshirt, on_delete=models.CASCADE)
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return str(self.tshirt) + ' ' + str(self.edition)
    
class Volunteer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_registry_number = models.CharField(max_length=100)
    works_day1 = models.BooleanField()
    works_day2 = models.BooleanField()
    needs_parking_day1 = models.BooleanField()
    needs_parking_day2 = models.BooleanField()
    tshirt = models.ForeignKey(availableTshirt, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    size = models.ForeignKey(Size, on_delete=models.CASCADE)


    def __str__(self):
        return self.first_name + ' ' + self.last_name
    
class participating_club(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)
    person_in_charge_day1 = models.CharField(max_length=100)
    person_in_charge_day2 = models.CharField(max_length=100)

    def __str__(self):
        return str(self.club) + ' ' + str(self.edition)
    
class Task(models.Model):
    description = models.TextField()
    day = models.IntegerField()
    volunteers_required = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    responsible_employee = models.CharField(max_length=100)
    participating_club = models.ForeignKey(participating_club, on_delete=models.CASCADE)
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)

    def __str__(self):
        return self.description + ' ' + str(self.day) + ' ' + str(self.edition)
    
class TimeRegistration(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()
    day = models.IntegerField()
    edition = models.ForeignKey(Edition, on_delete=models.CASCADE)
    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.volunteer) + ' ' + str(self.day) + ' ' + str(self.edition)