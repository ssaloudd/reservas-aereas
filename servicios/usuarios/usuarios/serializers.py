from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 
                 'telefono', 'direccion', 'fecha_nacimiento']
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
        }
    
    def create(self, validated_data):
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data['password'],  # Esto llama a nuestro set_password
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                telefono=validated_data.get('telefono'),
                direccion=validated_data.get('direccion'),
                fecha_nacimiento=validated_data.get('fecha_nacimiento')
            )
            return user
        except Exception as e:
            raise ValidationError(str(e))
        
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agrega claims personalizados al token
        token['user_id'] = user.id
        token['username'] = user.username
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agrega datos adicionales a la respuesta
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'email': self.user.email
        })
        
        return data