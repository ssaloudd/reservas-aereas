from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class SimpleUser:
    def __init__(self, id, username):
        self.id = id
        self.username = username
        self.is_authenticated = True
        
    def __str__(self):
        return f"User(id={self.id}, username={self.username})"

class JWTStatelessUserAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Token no contiene user_id')
            
            # Creamos una instancia de nuestra clase SimpleUser
            return SimpleUser(
                id=user_id, 
                username=validated_token.get('username', '')
            )
            
        except Exception as e:
            raise AuthenticationFailed(f'Error al validar usuario: {str(e)}')