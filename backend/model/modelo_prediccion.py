import base64
import os
import sys
import threading
import logging
import json
import re
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
from typing import Tuple, List
from sklearn.linear_model import SGDClassifier
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

sys.path.append("backend")
from app.correo import procesar_correos

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RUTA_MODELO = "backend/model/modelo_actualizado.pkl"
RUTA_CSV = "backend/model/consulta_resultado.csv"
STOP_WORDS = ['de', 'la', 'que', 'en', 'y', 'con', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'una', 'no', 'al', 'lo', 'como', 'más', 'sus', 'su']
RUTA_DESC_CONFIRMADAS_PKL = "backend/model/descripciones_confirmadas.pkl"
RUTA_DESC_CONFIRMADAS_JSON = "backend/model/descripciones_confirmadas.json"

lock = threading.Lock()
update_counter = 0
SAVE_THRESHOLD = 1

def procesar_texto(texto: str) -> str:
    try:
        texto = texto.lower()
        # Keep Unicode word characters including accents
        texto = re.sub(r'[^\w\s]', '', texto, flags=re.UNICODE)
        palabras = texto.split()
        texto_procesado = " ".join(
            [palabra for palabra in palabras if palabra not in STOP_WORDS]
        )
        return texto_procesado
    except Exception as e:
        logger.error(f"Error procesando texto: {e}")
        return ""

def guardar_modelo(modelo, vectorizer, ruta_modelo: str):
    with open(ruta_modelo, 'wb') as f:
        pickle.dump({'model': modelo, 'vectorizer': vectorizer}, f)
    logger.info("Modelo guardado exitosamente.")

def guardar_descripciones_confirmadas(ruta_pkl: str, ruta_json: str):
    with open(ruta_pkl, 'wb') as f:
        pickle.dump(descripciones_confirmadas, f)
    logger.info("Descripciones confirmadas guardadas exitosamente.")

    with open(ruta_json, 'w', encoding='utf-8') as f:
        json.dump(descripciones_confirmadas, f, ensure_ascii=False, indent=4)
    logger.info("Descripciones confirmadas guardadas exitosamente en JSON.")

def cargar_descripciones_confirmadas(ruta: str):
    if os.path.exists(ruta):
        with open(ruta, 'rb') as f:
            descripciones = pickle.load(f)
        logger.info("Descripciones confirmadas cargadas exitosamente.")
        return descripciones
    else:
        logger.info("No se encontraron descripciones confirmadas previas.")
        return {}

def cargar_modelo(ruta_modelo):
    if os.path.exists(ruta_modelo):
        with open(ruta_modelo, 'rb') as f:
            data = pickle.load(f)
            logger.info("Modelo cargado exitosamente.")
            return data['model'], data['vectorizer']
    else:
        logger.info("No se encontró un modelo previo.")
        return None, None

def cargar_datos(ruta_csv: str) -> Tuple[List[str], List[str], pd.DataFrame, List[str]]:
    try:
        df_local = pd.read_csv(ruta_csv)
        df_local = df_local.dropna(subset=["CodArticle", "Description"])
        df_local['Description_Procesada'] = df_local['Description'].apply(procesar_texto)
        X = df_local["Description_Procesada"].tolist()
        y = df_local["CodArticle"].tolist()
        images = df_local["Image"].tolist()
        return X, y, df_local, images
    except FileNotFoundError:
        logger.error(f"No se encontró el archivo: {ruta_csv}")
        raise
    except Exception as e:
        logger.error(f"Error cargando datos: {e}")
        raise

def entrenar_modelo(X_train: List[str], y_train: List[str]) -> Tuple[SGDClassifier, TfidfVectorizer]:
    try:
        vectorizador = TfidfVectorizer()
        X_train_tfidf = vectorizador.fit_transform(X_train)
        modelo_sgd = SGDClassifier(random_state=42)
        clases = sorted(list(set(y_train)))
        modelo_sgd.partial_fit(X_train_tfidf, y_train, classes=clases)
        return modelo_sgd, vectorizador
    except Exception as e:
        logger.error(f"Error entrenando modelo: {e}")
        raise

def modelo_predecir(descripcion: str) -> str:
    descripcion_normalizada = procesar_texto(descripcion)
    if descripcion_normalizada in descripciones_confirmadas:
        return descripciones_confirmadas[descripcion_normalizada]

    descripcion_vectorizada = vectorizer.transform([descripcion_normalizada])
    prediccion = model.predict(descripcion_vectorizada)
    return prediccion[0]



def procesar_imagen(image_data):
    if image_data.startswith("b'") and image_data.endswith("'"):
        image_data = image_data[2:-1]
    image_bytes = image_data.encode('utf-8').decode('unicode_escape').encode('latin1')
    base64_encoded = base64.b64encode(image_bytes).decode('utf-8')
    return base64_encoded


def actualizar_modelo(descripcion: str, seleccion: str):
    global model, vectorizer, todas_las_clases, df, update_counter, descripciones_confirmadas

    if seleccion not in todas_las_clases:
        todas_las_clases.append(seleccion)

    descripcion_normalizada = procesar_texto(descripcion)
    descripciones_confirmadas[descripcion_normalizada] = seleccion
    guardar_descripciones_confirmadas(RUTA_DESC_CONFIRMADAS_PKL, RUTA_DESC_CONFIRMADAS_JSON)

    nuevo_registro = pd.DataFrame([{'Description': descripcion, 'CodArticle': seleccion}])
    df = pd.concat([df, nuevo_registro], ignore_index=True)

    X = df['Description'].apply(procesar_texto).tolist()
    y = df['CodArticle'].astype(str).tolist()
    X_vectorized = vectorizer.transform(X)
    model.partial_fit(X_vectorized, y, classes=todas_las_clases)

    guardar_modelo(model, vectorizer, RUTA_MODELO)
    logger.info(f"Modelo actualizado con la nueva clase: {seleccion}")

    update_counter += 1
    if update_counter >= SAVE_THRESHOLD:
        guardar_modelo(model, vectorizer, RUTA_MODELO)
        update_counter = 0

def obtener_rango_descripciones(codigo_prediccion: str) -> List[dict]:
    indices = df.index[df['CodArticle'] == codigo_prediccion].tolist()
    rango_descripciones = []
    if indices:
        index_codigo = indices[0]
        start_index = max(index_codigo - 5, 0)
        end_index = min(index_codigo + 6, len(df))
        for i in range(start_index, end_index):
            descripcion = df.iloc[i]['Description']
            descripcion_normalizada = descripcion.lower().strip()
            if descripcion_normalizada not in descripciones_confirmadas:
                rango_descripciones.append({
                    'CodArticle': df.iloc[i]['CodArticle'],
                    'Description': descripcion
                })
    return rango_descripciones

def inicializar_modelo():
    global model, vectorizer, todas_las_clases, df, descripciones_confirmadas, images
    model, vectorizer = cargar_modelo(RUTA_MODELO)
    X, y, df_local, images = cargar_datos(RUTA_CSV)
    todas_las_clases = sorted(list(set(y)))
    df = df_local

    descripciones_confirmadas = cargar_descripciones_confirmadas(RUTA_DESC_CONFIRMADAS_PKL)
    

    if model is None or vectorizer is None:
        logger.info("Entrenando un nuevo modelo...")
        model, vectorizer = entrenar_modelo(X, y)
        guardar_modelo(model, vectorizer, RUTA_MODELO)
    
app = Flask(__name__)
CORS(app)

@app.route('/api/predicciones', methods=['GET'])
def obtener_predicciones():
    productos = procesar_correos()
    predicciones = []
    for producto in productos:
        cantidad = producto.split()[-1]
        producto = " ".join(producto.split()[:-1])
        codigo_prediccion = modelo_predecir(producto)
        descripcion_csv = df[df['CodArticle'] == codigo_prediccion]['Description'].values
        descripcion_csv = descripcion_csv[0] if len(descripcion_csv) > 0 else "Descripción no encontrada"
        rango_descripciones = obtener_rango_descripciones(codigo_prediccion)
        imagen = df[df['CodArticle'] == codigo_prediccion]['Image'].values
        imagen = imagen[0] if len(imagen) > 0 and pd.notna(imagen[0]) else None

        predicciones.append({
            'descripcion': producto.upper(),
            'codigo_prediccion': codigo_prediccion,
            'descripcion_csv': descripcion_csv,
            'rango_descripciones': rango_descripciones,
            'cantidad': cantidad,
            'imagen': procesar_imagen(imagen) if imagen else None
        })
    return jsonify(predicciones), 200

@app.route('/api/send-seleccion', methods=['POST'])
def recibir_seleccion():
    print(descripciones_confirmadas)
    data = request.get_json()
    seleccion = data.get('seleccion')
    descripcion = data.get('descripcion')

    if not descripcion or not seleccion:
        return jsonify({'error': 'Faltan datos en la solicitud.'}), 400

    try:
        with lock:
            actualizar_modelo(descripcion, seleccion)
        return jsonify({'message': 'Selección recibida y modelo entrenado correctamente.'}), 200
    except Exception as e:
        logger.error(f"Error al procesar la selección: {e}")
        return jsonify({'error': 'Error al procesar la selección.'}), 500

if __name__ == "__main__":
    inicializar_modelo()
    app.run(debug=True)
