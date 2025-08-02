from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.core.validators import MinLengthValidator
import hashlib
import secrets

class Usuario(AbstractUser):
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    salt = models.CharField(max_length=64, editable=False, default=secrets.token_hex(32))
    
    def set_password(self, raw_password):
        """
        Hashea la contraseña con SHA256 + salt y almacena en formato compatible
        """
        if not self.salt:
            self.salt = secrets.token_hex(32)
        
        # Generamos el hash con nuestro método
        salted_password = f"{raw_password}{self.salt}"
        custom_hash = hashlib.sha256(salted_password.encode()).hexdigest()
        
        # Almacenamos en formato: custom_sha256$salt$hash
        self.password = f"custom_sha256${self.salt}${custom_hash}"
        
        # IMPORTANTE: También llamamos al set_password del padre con nuestro hash
        # para mantener compatibilidad con el sistema de autenticación
        super().set_password(custom_hash)
    
    def check_password(self, raw_password):
        """
        Verifica la contraseña contra ambos formatos (nuevo y antiguo)
        """
        # Primero intentamos con nuestro formato personalizado
        if self.password.startswith('custom_sha256$'):
            try:
                _, salt, stored_hash = self.password.split('$', 2)
                salted_password = f"{raw_password}{salt}"
                hashed_password = hashlib.sha256(salted_password.encode()).hexdigest()
                return hashed_password == stored_hash
            except:
                return False
        
        # Si no está en nuestro formato, usamos el método estándar
        return super().check_password(raw_password)
    
    def save(self, *args, **kwargs):
        """
        Aseguramos que el salt se genere si no existe
        """
        if not self.salt:
            self.salt = secrets.token_hex(32)
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'usuarios'