from django.db import models


class Edition(models.Model):
    edition_id = models.AutoField(primary_key=True)
    edition_year = models.IntegerField()

    def __str__(self):
        return self.edition_name

class TimeRegistration(models.Model):
    time_registration_id = models.AutoField(primary_key=True)
    time_registration_start = models.DateTimeField()
    time_registration_end = models.DateTimeField()
    time_registration_day = models.IntegerField()
    time_registration_edition = models.ForeignKey(Edition, on_delete=models.CASCADE)

    def __str__(self):
        return self.time_registration_description