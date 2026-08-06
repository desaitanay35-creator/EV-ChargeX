from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        
        try:
            # Try to authenticate using email first
            if '@' in username:
                user = UserModel.objects.filter(email__iexact=username).first()
            else:
                user = None
                
            if not user:
                user = UserModel.objects.get(username__iexact=username)
        except UserModel.DoesNotExist:
            # Run the default password hasher once to mitigate timing attacks
            UserModel().set_password(password)
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
