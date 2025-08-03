from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
import requests
from django.conf import settings

class Command(BaseCommand):
    help = 'Sincroniza tokens desde el servicio de usuarios'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Obtener tokens del servicio de usuarios
        response = requests.get(f"{settings.USUARIOS_SERVICE_URL}/api/all-tokens/")
        if response.status_code == 200:
            for token_data in response.json():
                user, created = User.objects.get_or_create(
                    id=token_data['user_id'],
                    defaults={'username': token_data['username']}
                )
                Token.objects.update_or_create(
                    user=user,
                    defaults={'key': token_data['key']}
                )
            self.stdout.write("Tokens sincronizados exitosamente")