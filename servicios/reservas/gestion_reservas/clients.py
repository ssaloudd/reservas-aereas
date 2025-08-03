import requests
from django.conf import settings
from requests.exceptions import RequestException

class UsuariosClient:
    @staticmethod
    def verificar_usuario(usuario_id, token):
        try:
            response = requests.get(
                f"{settings.USUARIOS_SERVICE_URL}/api/auth/verify-token/",
                headers={"Authorization": f"Token {token}"},
                timeout=3
            )
            if response.status_code == 200:
                response_data = response.json()
                return str(response_data.get('user_id')) == str(usuario_id)
            return False
        except RequestException as e:
            print(f"Error al conectar con servicio de usuarios: {e}")
            return False
    
    @staticmethod
    def get_or_verify_token(username, password=None, token=None):
        try:
            if token:
                # Verificar token existente
                response = requests.post(
                    f"{settings.USUARIOS_SERVICE_URL}/api/tokens/",
                    headers={"Authorization": f"Token {token}"}
                )
            else:
                # Crear nuevo token
                response = requests.post(
                    f"{settings.USUARIOS_SERVICE_URL}/api/tokens/",
                    data={"username": username, "password": password}
                )
            
            return response.json() if response.status_code == 200 else None
        except RequestException:
            return None

class VuelosClient:
    @staticmethod
    def obtener_vuelo(vuelo_id):
        try:
            response = requests.get(
                f"{settings.VUELOS_SERVICE_URL}/api/vuelos/{vuelo_id}/",
                timeout=3
            )
            return response.json() if response.status_code == 200 else None
        except RequestException as e:
            print(f"Error al conectar con servicio de vuelos: {e}")
            return None