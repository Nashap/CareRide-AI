from django.db import models

class Passenger(models.Model):
    auth_user_id = models.UUIDField(
    unique=True,
    null=True,
    blank=True
    )

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    disability_type = models.CharField(max_length=100)
    emergency_contact = models.CharField(max_length=15)

    def __str__(self):
        return self.name