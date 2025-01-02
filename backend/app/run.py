import sys


sys.path.append("backend")
from model.modelo_prediccion import app, inicializar_modelo, actualizar_predicciones_periodicamente
import threading

# Initialize the model and start the prediction thread
inicializar_modelo()
hilo_actualizador = threading.Thread(target=actualizar_predicciones_periodicamente, daemon=True)
hilo_actualizador.start()

# Run the app with Waitress
if __name__ == "__main__":
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
