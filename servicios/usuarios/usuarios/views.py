from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from .models import Usuario
from .serializers import UsuarioSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    pass

class RegistroUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"error": "Credenciales inválidas", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtenemos el usuario validado
        user = serializer.user
        
        # Generamos la respuesta con los tokens
        response_data = {
            'access': serializer.validated_data.get('access'),
            'refresh': serializer.validated_data.get('refresh'),
            'user_id': user.id,
            'username': user.username,
            'email': user.email
        }

        return Response(response_data, status=status.HTTP_200_OK)

class UsuarioDetailView(generics.RetrieveUpdateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
@api_view(['GET'])
@permission_classes([AllowAny])
def verify_token(request):
    if request.user.is_authenticated:
        return Response({
            'user_id': request.user.id,
            'username': request.user.username,
            'is_valid': True
        })
    return Response({'is_valid': False}, status=400)

@api_view(['POST'])
def generate_or_verify_token(request):
    user = request.user
    if not user.is_authenticated:
        return Response({"error": "No autenticado"}, status=401)
    
    token, created = Token.objects.get_or_create(user=user)
    return Response({
        "token": token.key,
        "user_id": user.id,
        "username": user.username
    })