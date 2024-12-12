from app import create_app  # Importamos la función create_app

# Creamos la aplicación Flask
app = create_app()

if __name__ == '__main__':
    # Ejecutamos la aplicación en modo debug (puerto 5000 por defecto)
    app.run(host='0.0.0.0', port=5000)
