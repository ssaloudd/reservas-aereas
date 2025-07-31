from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
import hashlib
import secrets

class Usuario(AbstractUser):
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    salt = models.CharField(max_length=64, editable=False)
    
    def set_password(self, raw_password):
    # Generar salt si no existe
        if not self.salt:
            self.salt = secrets.token_hex(32)
        # Crear hash SHA256
        salted_password = f"{raw_password}{self.salt}"
        hashed_password = hashlib.sha256(salted_password.encode()).hexdigest()
        # Asignar directamente al campo password
        self.password = f"sha256${self.salt}${hashed_password}"
        
    def check_password(self, raw_password):
        if not self.password or 'sha256$' not in self.password:
            return False
        
        # Extraer salt y hash almacenado
        _, salt, stored_hash = self.password.split('$')
        
        # Calcular hash con la contraseña proporcionada
        salted_password = f"{raw_password}{salt}"
        hashed_password = hashlib.sha256(salted_password.encode()).hexdigest()
        
        return hashed_password == stored_hash

    class Meta:
        db_table = 'usuarios'