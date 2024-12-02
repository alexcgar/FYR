from flask import Flask
"""
    He usado CORS porque es fácil de configurar y
    permite controlar qué dominios pueden acceder a la API.
    Puedes instalarlo con pip:
    pip install Flask-Cors
"""
    
def create_app():
    """
    Create and configure the Flask application instance.
    """
    app = Flask(__name__)

    return app

