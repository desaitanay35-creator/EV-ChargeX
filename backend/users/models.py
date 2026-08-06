from django.db import models
from django.contrib.auth.models import AbstractUser



class User(AbstractUser):

   

    

    ROLE_CHOICES = (
    ('ADMIN', 'Admin'),
    ('USER', 'User'),
    ('OPERATOR', 'Station Operator'),)

    role = models.CharField(max_length=20,choices=ROLE_CHOICES,default='USER')
    phone = models.CharField(max_length=15,unique=True,null=True,blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    state = models.CharField(max_length=50, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username    