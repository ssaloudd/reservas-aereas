from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password
from django.core.validators import MinLengthValidator
import hashlib
import secrets

from django.contrib.auth.models import BaseUserManager

class UsuarioManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError('El nombre de usuario es obligatorio')
        
        email = self.normalize_email(email) if email else None
        user = self.model(username=username, email=email, **extra_fields)
        
        if password:
            user.set_password(password)  # Esto usará tu método personalizado
        
        user.save(using=self._db)
        return user

class Usuario(AbstractUser):
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    salt = models.CharField(max_length=64, editable=False, default=secrets.token_hex(32))
    
    objects = UsuarioManager()
    
    def set_password(self, raw_password):
        """
        Hashea la contraseña solo con SHA256 + salt (elimina el doble hasheo)
        """
        if not self.salt:
            self.salt = secrets.token_hex(32)
        
        salted_password = f"{raw_password}{self.salt}"
        custom_hash = hashlib.sha256(salted_password.encode()).hexdigest()
        
        # Almacena SOLO en formato personalizado
        self.password = f"custom_sha256${self.salt}${custom_hash}"
    
    def check_password(self, raw_password):
        """
        Verifica solo contra nuestro formato personalizado
        """
        if not self.password.startswith('custom_sha256$'):
            return False
            
        try:
            _, salt, stored_hash = self.password.split('$', 2)
            salted_password = f"{raw_password}{salt}"
            hashed_password = hashlib.sha256(salted_password.encode()).hexdigest()
            return hashed_password == stored_hash
        except:
            return False
    
    def save(self, *args, **kwargs):
        if not self.salt:
            self.salt = secrets.token_hex(32)
        super().save(*args, **kwargs)