from app import create_app  # Importamos la función create_app
from waitress import serve  # Importamos el servidor Waitress

# Creamos la aplicación Flask
app = create_app()

if __name__ == '__main__':
    # Ejecutamos la aplicación con Waitress en modo producción
    serve(app, host='0.0.0.0', port=5000)
