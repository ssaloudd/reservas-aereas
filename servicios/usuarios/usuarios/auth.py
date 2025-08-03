from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
import requests
from django.conf import settings

class RemoteTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        try:
            response = requests.post(
                f"{settings.USUARIOS_SERVICE_URL}/api/tokens/",
                headers={"Authorization": f"Token {key}"}
            )
            if response.status_code == 200:
                data = response.json()
                return (self.get_user(data['user_id']), key)
            raise AuthenticationFailed('Token inválido')
        except Exception as e:
            raise AuthenticationFailed(f'Error de conexión: {str(e)}')

    def get_user(self, user_id):
        # Implementa según tu modelo de usuario
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None