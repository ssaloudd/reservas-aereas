import requests
from django.conf import settings
from requests.exceptions import RequestException

class VuelosClient:
    @staticmethod
    def obtener_vuelo(vuelo_id):
        try:
            response = requests.get(
                f"{settings.VUELOS_SERVICE_URL}/api/vuelos/{vuelo_id}/",
                timeout=3
            )
            if response.status_code == 200:
                return response.json()
            return None
        except RequestException:
            return None

class UsuariosClient:
    @staticmethod
    def verificar_usuario(usuario_id, token):
        try:
            response = requests.get(
                f"{settings.USUARIOS_SERVICE_URL}/api/auth/perfil/",
                headers={"Authorization": f"Token {token}"},
                timeout=3
            )
            return response.status_code == 200
        except RequestException:
            return False