from rest_framework import serializers
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
        'username',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'state',
        'pincode',
]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(role='USER',**validated_data)
        user.set_password(password)
        user.save()
        return user
    
class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'phone',
            'role',
            'profile_image',
            'address',
            'city',
            'state',
            'pincode',
            'is_verified',
        ]