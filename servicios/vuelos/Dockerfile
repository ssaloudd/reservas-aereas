# Usa una imagen base oficial de Python
FROM python:3.12-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de requerimientos y los instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el script de entrada y le da permisos de ejecución
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Copia todo el código de la aplicación
COPY . .

# Expone el puerto del servicio
EXPOSE 8000

# Comando para ejecutar el script de inicio
ENTRYPOINT ["entrypoint.sh"]