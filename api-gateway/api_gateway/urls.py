from django.urls import path
from django.http import JsonResponse
import requests
import json
import logging

# Configurar el logger
logger = logging.getLogger(__name__)

def proxy_view(request, service, path):
    SERVICE_URLS = {
        'usuarios': 'http://localhost:8001',
        'vuelos': 'http://localhost:8000',
        'reservas': 'http://localhost:8002'
    }

    # Eliminar encabezados que pueden causar problemas
    headers_to_send = {key: value for key, value in request.headers.items()}
    headers_to_send.pop('Host', None)
    headers_to_send.pop('Connection', None)

    request_body_data = None
    if request.method in ['POST', 'PUT', 'PATCH']:
        if 'application/json' in request.headers.get('Content-Type', '').lower():
            try:
                request_body_data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
        else:
            request_body_data = request.body

    # ================================================================
    # CORRECCIÓN: La URL del microservicio no debe incluir un prefijo de API
    # si ya está en la ruta. Esto evita la duplicación del prefijo.
    # Se ha cambiado la lógica para que la URL de destino sea más directa.
    # La ruta para el microservicio de usuarios es /api/auth/login/
    # y la ruta que llega a esta función es 'api/auth/login/'
    # La URL de destino debe ser f"{SERVICE_URLS[service]}/{path}"
    # ================================================================
    # Ejemplo:
    # URL de entrada: http://localhost:8003/api/usuarios/api/auth/login/
    # service = 'usuarios'
    # path = 'api/auth/login/'
    # URL de destino: http://localhost:8001/api/auth/login/
    
    target_url = f"{SERVICE_URLS[service]}/{path}"
    logger.info(f"Proxying request to: {target_url} with method: {request.method}")

    try:
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=headers_to_send,
            data=request_body_data if not isinstance(request_body_data, dict) else None,
            json=request_body_data if isinstance(request_body_data, dict) else None,
            params=request.GET,
            timeout=10
        )

        try:
            return JsonResponse(response.json(), status=response.status_code)
        except requests.exceptions.JSONDecodeError:
            # Si no es un JSON válido, devolvemos el texto de la respuesta
            return JsonResponse({'message': response.text}, status=response.status_code)
    except requests.exceptions.RequestException as e:
        logger.error(f"Error during proxy request: {e}")
        return JsonResponse({'error': f'Request failed: {e}'}, status=502)
    except Exception as e:
        logger.error(f"Internal server error: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)

urlpatterns = [
    path('api/<str:service>/<path:path>', proxy_view),
    path('health/', lambda r: JsonResponse({'status': 'ok'})),
]
