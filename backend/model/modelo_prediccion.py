import base64
import os
import shutil
import sys
import threading
import json
import re
import time
import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import  List
from sklearn.linear_model import SGDClassifier
from thefuzz import fuzz
from thefuzz import process
import requests
from sklearn.metrics.pairwise import cosine_similarity

sys.path.append("backend")
from app.correo import procesar_correos, descargar_audio_desde_correo

RUTA_MODELO = "backend/model/modelo_actualizado.joblib"
RUTA_CSV = "backend/model/consulta_resultado.csv"
RUTA_DESC_CONFIRMADAS_PKL = "backend/model/descripciones_confirmadas.joblib"
RUTA_DESC_CONFIRMADAS_JSON = "backend/model/descripciones_confirmadas.json"
CARPETA_AUDIOS = "backend/model/audios"
RUTA_BACKUP = "backend/backups"

def obtener_stop_words() -> set:
    url = "https://raw.githubusercontent.com/stopwords-iso/stopwords-es/master/stopwords-es.json"
    response = requests.get(url)
    if response.status_code == 200:
        return set(response.json())
    else:
        return set()


STOP_WORDS = obtener_stop_words()


def procesar_texto(texto: str) -> str:
    texto = texto.lower()
    texto = re.sub(r"[^\w\s]", "", texto, flags=re.UNICODE)
    texto = re.sub(r"\b(\w+)(es|s)\b", r"\1", texto)
    texto = texto.replace("ø", "")
    palabras = texto.split()
    texto_procesado = " ".join(
        [palabra for palabra in palabras if palabra not in STOP_WORDS]
    )
    return texto_procesado


def guardar_modelo(modelo, vectorizer, ruta_modelo: str):
    joblib.dump({"model": modelo, "vectorizer": vectorizer}, ruta_modelo)


def guardar_descripciones_confirmadas(ruta_pkl: str, ruta_json: str):
    joblib.dump(descripciones_confirmadas, ruta_pkl)

    with open(ruta_json, "w", encoding="utf-8") as f:
        json.dump(descripciones_confirmadas, f, ensure_ascii=False, indent=4)




def cargar_descripciones_confirmadas(ruta: str):
    if os.path.exists(ruta):
        return joblib.load(ruta)
    else:
        return {}


def cargar_modelo(ruta_modelo):
    # Cargar con joblib
    if os.path.exists(ruta_modelo):
        data = joblib.load(ruta_modelo)
        return data["model"], data["vectorizer"]
    else:
        return None, None


def cargar_datos(ruta_csv: str):

    df_local = pd.read_csv(ruta_csv)

    df_local = df_local.dropna(subset=["CodArticle", "Description"])

    df_local["Description_Procesada"] = df_local["Description"].apply(procesar_texto)

    X = df_local["Description_Procesada"].tolist()

    y = df_local["CodArticle"].tolist()

    images = df_local["Image"].tolist()

    return X, y, df_local, images


def entrenar_modelo(X_train: List[str], y_train: List[str]):

    vectorizador = TfidfVectorizer()

    X_train_tfidf = vectorizador.fit_transform(X_train)

    modelo_sgd = SGDClassifier(random_state=42)

    clases = sorted(list(set(y_train)))

    modelo_sgd.partial_fit(X_train_tfidf, y_train, classes=clases)

    return modelo_sgd, vectorizador


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

    image_bytes = image_data.encode("utf-8").decode("unicode_escape").encode("latin1")

    base64_encoded = base64.b64encode(image_bytes).decode("utf-8")

    return base64_encoded


def actualizar_modelo(descripcion: str, seleccion: str):

    global model, vectorizer, todas_las_clases, df, update_counter, descripciones_confirmadas

    if seleccion not in todas_las_clases:
        todas_las_clases.append(seleccion)

    descripcion_normalizada = procesar_texto(descripcion)

    descripciones_confirmadas[descripcion_normalizada] = seleccion

    guardar_descripciones_confirmadas(
        RUTA_DESC_CONFIRMADAS_PKL, RUTA_DESC_CONFIRMADAS_JSON
    )

    nuevo_registro = pd.DataFrame(
        [{"Description": descripcion, "CodArticle": seleccion}]
    )

    df = pd.concat([df, nuevo_registro], ignore_index=True)

    X = df["Description"].apply(procesar_texto).tolist()

    y = df["CodArticle"].astype(str).tolist()

    X_vectorized = vectorizer.transform(X)

    model.partial_fit(X_vectorized, y, classes=todas_las_clases)

    guardar_modelo(model, vectorizer, RUTA_MODELO)
    backup_model(RUTA_MODELO, RUTA_BACKUP)

    
def backup_model(ruta_original: str, ruta_backup_dir: str):
    if not os.path.exists(ruta_backup_dir):
        os.makedirs(ruta_backup_dir)

    timestamp = time.strftime("%Y%m%d-%H%M%S")
    nombre_backup = f"{ruta_backup_dir}/modelo_backup_{timestamp}.joblib"
    shutil.copy2(ruta_original, nombre_backup)
    print(f"Backup creado en {nombre_backup}")


def obtener_rango_descripciones(codigo_prediccion: str) -> List[dict]:

    indices = df.index[df["CodArticle"] == codigo_prediccion].tolist()

    rango_descripciones = []
    if indices:
        index_codigo = indices[0]
        start_index = max(index_codigo - 5, 0)
        end_index = min(index_codigo + 6, len(df))
        for i in range(start_index, end_index):
            descripcion = df.iloc[i]["Description"]
            descripcion_normalizada = descripcion.lower().strip()
            if descripcion_normalizada not in descripciones_confirmadas:
                rango_descripciones.append(
                    {"CodArticle": df.iloc[i]["CodArticle"], "Description": descripcion}
                )

    return rango_descripciones


def inicializar_modelo():
    global model, vectorizer, todas_las_clases, df, descripciones_confirmadas, images

    # Cargar el modelo y vectorizador desde archivo si existe
    model, vectorizer = cargar_modelo(RUTA_MODELO)

    # Cargar los datos desde el CSV
    X, y, df_local, images = cargar_datos(RUTA_CSV)

    # Inicializamos las clases
    todas_las_clases = sorted(list(set(y)))

    # Guardar el dataframe en una variable global
    df = df_local

    # Cargar descripciones confirmadas
    descripciones_confirmadas = cargar_descripciones_confirmadas(RUTA_DESC_CONFIRMADAS_PKL)

    # Si no existe un modelo, entrenamos uno nuevo
    if model is None or vectorizer is None:
        model, vectorizer = entrenar_modelo(X, y)
        guardar_modelo(model, vectorizer, RUTA_MODELO)
    
    # Hacer un backup del modelo después de cargarlo o entrenarlo
    backup_model(RUTA_MODELO, RUTA_BACKUP)

def buscar_en_csv(busqueda, umbral=70):
    
    df = pd.read_csv(RUTA_CSV)
    
    busqueda_lower = busqueda.lower()
    
    df["Description_lower"] = df["Description"].str.lower()
    
    df["Combined"] = df["CodArticle"].astype(str) + " - " + df["Description"]
    
    lista_combinada = df["Combined"].tolist()

    # Utilizar fuzz.partial_ratio para mejorar las coincidencias parciales
    resultados = process.extract(busqueda_lower, lista_combinada, scorer=fuzz.partial_ratio)
    
    resultados_filtrados = [item[0] for item in resultados if item[1] >= umbral]
    
    cod_articles = [item.split(" - ")[0] for item in resultados_filtrados]
    
    resultados_df = df[df["CodArticle"].isin(cod_articles)][["CodArticle", "Combined"]].drop_duplicates()
    
    resultados_dict = resultados_df.to_dict(orient="records")
    
    return resultados_dict



# Flask application
app = Flask(__name__)
CORS(app)


@app.route("/api/send-seleccion", methods=["POST"])
def recibir_seleccion():
    data = request.get_json()
    seleccion = data.get("seleccion")
    descripcion = data.get("descripcion")
    if not descripcion or not seleccion:
        return jsonify({"error": "Faltan datos en la solicitud."}), 400
    actualizar_modelo(descripcion, seleccion)


@app.route("/api/buscar", methods=["POST"])
def buscar_productos():
    data = request.get_json()
    busqueda = data.get("busqueda")
    if not busqueda:
        return jsonify({"error": "Falta la consulta de búsqueda."}), 400
    try:
        resultados = buscar_en_csv(busqueda)
        return jsonify({"rango_descripciones": resultados}), 200
    except Exception as e:
        return jsonify({"error": "Error al buscar productos."}), 500


if not os.path.exists(CARPETA_AUDIOS):
    os.makedirs(CARPETA_AUDIOS)


@app.route("/api/getAudio", methods=["GET"])
def get_audio():
    # Reemplaza con la ruta deseada
    carpeta_destino = r"C:\Users\acaparros\Desktop\F+R\backend\model\audios"
    ruta_audio = descargar_audio_desde_correo(carpeta_destino)

    if ruta_audio:
        try:
            return send_file(
                ruta_audio,
                mimetype="audio/mpeg",
                as_attachment=True,
                download_name="audio.mp3",  # Puedes ajustar el nombre del archivo según sea necesario
            )
        except Exception as e:
            return jsonify({"error": "Error al enviar el archivo de audio."}), 500
    else:
        return (jsonify({"error": "No se encontró ningún archivo de audio para descargar."}),404,)


predicciones_globales = []


def actualizar_predicciones_periodicamente():
    global predicciones_globales, model, vectorizer
    while True:
        try:
            productos = procesar_correos()
            if not productos:
                continue  # Saltar si no hay productos

            nuevas_predicciones = []
            for producto in productos:
                descripcion = producto[0]
                cantidad = producto[1]
                correo_id = producto[2]

                # Normalizar y predecir
                descripcion_procesada = procesar_texto(descripcion)
                if descripcion_procesada in descripciones_confirmadas:
                    codigo_prediccion = descripciones_confirmadas[descripcion_procesada]
                    exactitud = 100
                else:
                    codigo_prediccion = modelo_predecir(descripcion)
                    if codigo_prediccion in df["CodArticle"].values:
                        descripcion_predicha_procesada = df.loc[
                            df["CodArticle"] == codigo_prediccion, "Description_Procesada"
                        ].iloc[0]

                        # Similaridad de coseno
                        vectorizador_similitud = TfidfVectorizer()
                        tfidf_matrix = vectorizador_similitud.fit_transform(
                            [descripcion_procesada, descripcion_predicha_procesada]
                        )
                        cosine_sim = cosine_similarity(
                            tfidf_matrix[0:1], tfidf_matrix[1:2]
                        )[0][0]
                        exactitud = int(cosine_sim * 100)
                    else:
                        exactitud = 0

                # Obtener datos adicionales
                descripcion_csv = df[df["CodArticle"] == codigo_prediccion][
                    "Description"
                ].values
                descripcion_csv = (
                    descripcion_csv[0]
                    if len(descripcion_csv) > 0
                    else "Descripción no encontrada"
                )
                imagen = df[df["CodArticle"] == codigo_prediccion]["Image"].values
                imagen = (
                    imagen[0] if len(imagen) > 0 and pd.notna(imagen[0]) else None
                )
                id_article = df[df["CodArticle"] == codigo_prediccion][
                    "IDArticle"
                ].values
                id_article = id_article[0] if len(id_article) > 0 else None

                nuevas_predicciones.append(
                    {
                        "descripcion": descripcion.upper(),
                        "codigo_prediccion": codigo_prediccion,
                        "descripcion_csv": descripcion_csv,
                        "cantidad": cantidad,
                        "imagen": procesar_imagen(imagen) if imagen else None,
                        "exactitud": exactitud,
                        "id_article": id_article,
                        "correo_id": correo_id,
                    }
                )

            predicciones_globales = nuevas_predicciones
        except Exception as e:
            print(f"Error actualizando predicciones: {e}")
        time.sleep(10)



@app.route("/api/predicciones", methods=["GET"])
def obtener_predicciones():
    global predicciones_globales
    return jsonify(predicciones_globales), 200


if __name__ == "__main__":
    inicializar_modelo()
    # Inicia el hilo para actualizar predicciones periódicamente
    hilo_actualizador = threading.Thread(
        target=actualizar_predicciones_periodicamente, daemon=True)
    hilo_actualizador.start()
    app.run()
