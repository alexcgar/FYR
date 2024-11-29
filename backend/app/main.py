from flask import Blueprint, jsonify  # Blueprint para organizar rutas, jsonify para respuestas JSON
from .correo import procesar_correos  # Importamos la función que procesa los correos
import os

# Creamos un blueprint llamado 'obtener_productos'
obtener_productos = Blueprint('obtener_productos', __name__)

@obtener_productos.route('/api/correos', methods=['GET'])
def obtener_correos():
    """
    Ruta para obtener los productos procesados desde los correos.
    """
    productos = procesar_correos()  # Llamamos a la función que procesa los correos
    return jsonify(productos)  # Devolvemos la lista de productos como JSON
