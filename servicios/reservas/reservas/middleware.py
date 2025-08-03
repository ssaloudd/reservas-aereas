from django.utils.deprecation import MiddlewareMixin

class PrintTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"Authorization header: {auth_header}")
        return None
    
class DebugMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Imprime información de la solicitud
        print("\n=== SOLICITUD RECIBIDA ===")
        print(f"Método: {request.method}")
        print(f"Ruta: {request.path}")
        print(f"Headers: {request.headers}")
        print(f"Cuerpo: {request.body.decode()}")
        print("=========================\n")

        response = self.get_response(request)

        # Imprime información de la respuesta
        print("\n=== RESPUESTA ENVIADA ===")
        print(f"Status: {response.status_code}")
        print(f"Contenido: {response.content}")
        print("=========================\n")
        
        return response