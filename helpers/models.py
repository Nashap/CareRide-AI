from django.db import models

class Helper(models.Model):
    name = models.CharField(max_length=100)
    skills = models.TextField()
    rating = models.FloatField(default=0)
    availability = models.BooleanField(default=True)

    def __str__(self):
        return self.name