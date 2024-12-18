import base64
import os
import sys
import threading
import json
import re
import time
import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
import pickle
from typing import Tuple, List
from sklearn.linear_model import SGDClassifier
from thefuzz import fuzz
from thefuzz import process

sys.path.append("backend")
from app.correo import procesar_correos, descargar_audio_desde_correo

RUTA_MODELO = "backend/model/modelo_actualizado.pkl"
RUTA_CSV = "backend/model/consulta_resultado.csv"
STOP_WORDS = ['de', 'la', 'que', 'en', 'y', 'con', 'los', 'del', 'se', 'las', 'por', 'un', 'para', 'una', 'no', 'al', 'lo', 'como', 'más', 'sus', 'su', 'ø']
RUTA_DESC_CONFIRMADAS_PKL = "backend/model/descripciones_confirmadas.pkl"
RUTA_DESC_CONFIRMADAS_JSON = "backend/model/descripciones_confirmadas.json"
CARPETA_AUDIOS = "backend/model/audios"



def procesar_texto(texto: str) -> str:
        texto = texto.lower()
        texto = re.sub(r'[^\w\s]', '', texto, flags=re.UNICODE) 
        texto = re.sub(r'\b(\w+)(es|s)\b', r'\1', texto)
        texto = texto.replace('ø', '')
        palabras = texto.split()
        texto_procesado = " ".join(
            [palabra for palabra in palabras if palabra not in STOP_WORDS]
        )
        return texto_procesado
  

def guardar_modelo(modelo, vectorizer, ruta_modelo: str):
    with open(ruta_modelo, 'wb') as f:
        pickle.dump({'model': modelo, 'vectorizer': vectorizer}, f)

def guardar_descripciones_confirmadas(ruta_pkl: str, ruta_json: str):
    with open(ruta_pkl, 'wb') as f:
        pickle.dump(descripciones_confirmadas, f)

    with open(ruta_json, 'w', encoding='utf-8') as f:
        json.dump(descripciones_confirmadas, f, ensure_ascii=False, indent=4)

def cargar_descripciones_confirmadas(ruta: str):
    if os.path.exists(ruta):
        with open(ruta, 'rb') as f:
            descripciones = pickle.load(f)
        return descripciones
    else:
        return {}

def cargar_modelo(ruta_modelo):
    if os.path.exists(ruta_modelo):
        with open(ruta_modelo, 'rb') as f:
            data = pickle.load(f)
            return data['model'], data['vectorizer']
    else:
        return None, None

def cargar_datos(ruta_csv: str) -> Tuple[List[str], List[str], pd.DataFrame, List[str]]:
        df_local = pd.read_csv(ruta_csv)
        df_local = df_local.dropna(subset=["CodArticle", "Description"])
        df_local['Description_Procesada'] = df_local['Description'].apply(procesar_texto)
        X = df_local["Description_Procesada"].tolist()
        y = df_local["CodArticle"].tolist()
        images = df_local["Image"].tolist()
        # ids = df_local["IDArticle"].tolist() # No se está utilizando actualmente
        return X, y, df_local, images
    

def entrenar_modelo(X_train: List[str], y_train: List[str]) -> Tuple[SGDClassifier, TfidfVectorizer]:
  
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

def buscar_en_csv(busqueda: str) -> List[dict]:
    busqueda_normalizada = procesar_texto(busqueda)
    resultados = df[df['Description_Procesada'].str.contains(busqueda_normalizada, case=False, na=False)]
    return resultados.to_dict(orient='records')

def inicializar_modelo():
    global model, vectorizer, todas_las_clases, df, descripciones_confirmadas, images
    model, vectorizer = cargar_modelo(RUTA_MODELO)
    X, y, df_local, images = cargar_datos(RUTA_CSV)
    todas_las_clases = sorted(list(set(y)))
    df = df_local

    descripciones_confirmadas = cargar_descripciones_confirmadas(RUTA_DESC_CONFIRMADAS_PKL)
    inicializar_predicciones()

    if model is None or vectorizer is None:
        model, vectorizer = entrenar_modelo(X, y)
        guardar_modelo(model, vectorizer, RUTA_MODELO)

def inicializar_predicciones():
    global predicciones
    productos = procesar_correos()
    predicciones = []
    for producto in productos:
        descripcion = producto[0]  # Accede a la descripción del producto
        cantidad = producto[1]  # Accede a la cantidad del producto
        correo_id = producto[2]  # Accede al id del correo

        codigo_prediccion = modelo_predecir(descripcion)
        descripcion_csv = df[df['CodArticle'] == codigo_prediccion]['Description'].values
        descripcion_csv = descripcion_csv[0] if len(descripcion_csv) > 0 else "Descripción no encontrada"
        imagen = df[df['CodArticle'] == codigo_prediccion]['Image'].values
        imagen = imagen[0] if len(imagen) > 0 and pd.notna(imagen[0]) else None
        id_article = df[df['CodArticle'] == codigo_prediccion]['IDArticle'].values
        id_article = id_article[0] if len(id_article) > 0 else None

        # Calcular la exactitud de la predicción
        descripcion_procesada = procesar_texto(descripcion)
        if descripcion_procesada in descripciones_confirmadas:
            exactitud = 100
        else:
            exactitud = fuzz.token_set_ratio(descripcion_procesada, df.loc[df['CodArticle'] == codigo_prediccion, 'Description_Procesada'].iloc[0]) if codigo_prediccion in df['CodArticle'].values else 0
        
        predicciones.append({
            'descripcion': descripcion.upper(),
            'codigo_prediccion': codigo_prediccion,
            'descripcion_csv': descripcion_csv,
            'cantidad': cantidad,
            'imagen': procesar_imagen(imagen) if imagen else None,
            'exactitud': exactitud,
            'id_article': id_article,
            'correo_id': correo_id  # Añadir el id del correo
        })

def actualizar_predicciones_periodicamente():
    while True:
        inicializar_predicciones()
        time.sleep(30)  # Esperar 5 minutos (300 segundos)

app = Flask(__name__)
CORS(app)

# Iniciar el hilo para actualizar las predicciones cada 5 minutos
threading.Thread(target=actualizar_predicciones_periodicamente, daemon=True).start()

@app.route('/api/predicciones', methods=['GET'])
def obtener_predicciones():
    return jsonify(predicciones), 200

@app.route('/api/send-seleccion', methods=['POST'])
def recibir_seleccion():
    data = request.get_json()
    seleccion = data.get('seleccion')
    descripcion = data.get('descripcion')

    if not descripcion or not seleccion:
        return jsonify({'error': 'Faltan datos en la solicitud.'}), 400

   
    actualizar_modelo(descripcion, seleccion)

def buscar_en_csv(busqueda, umbral=70):
    df = pd.read_csv(RUTA_CSV)
    busqueda_lower = busqueda.lower()
    df['Description_lower'] = df['Description'].str.lower()
    df['Combined'] = df['CodArticle'].astype(str) + ' - ' + df['Description']
    lista_combinada = df['Combined'].tolist()
    
    # Utilizar fuzz.partial_ratio para mejorar las coincidencias parciales
    resultados = process.extract(busqueda_lower, lista_combinada, scorer=fuzz.partial_ratio)
    resultados_filtrados = [item[0] for item in resultados if item[1] >= umbral]
    cod_articles = [item.split(' - ')[0] for item in resultados_filtrados]
    resultados_df = df[df['CodArticle'].isin(cod_articles)][['CodArticle', 'Combined']].drop_duplicates()
    resultados_dict = resultados_df.to_dict(orient='records')
    return resultados_dict

@app.route('/api/buscar', methods=['POST'])
def buscar_productos():
    data = request.get_json()
    busqueda = data.get('busqueda')
    if not busqueda:
        return jsonify({'error': 'Falta la consulta de búsqueda.'}), 400

    try:
        resultados = buscar_en_csv(busqueda)
        return jsonify({'rango_descripciones': resultados}), 200
    except Exception as e:
        return jsonify({'error': 'Error al buscar productos.'}), 500    
    
if not os.path.exists(CARPETA_AUDIOS):
    os.makedirs(CARPETA_AUDIOS)

@app.route('/api/getAudio', methods=['GET'])
def get_audio():
    carpeta_destino = r"C:\Users\acaparros\Desktop\F+R\backend\model\audios"  # Reemplaza con la ruta deseada
    ruta_audio = descargar_audio_desde_correo(carpeta_destino)
    
    if ruta_audio:
        try:
            return send_file(
                ruta_audio,
                mimetype='audio/mpeg',
                as_attachment=True,
                download_name='audio.mp3'  # Puedes ajustar el nombre del archivo según sea necesario
            )
        except Exception as e:
            return jsonify({'error': 'Error al enviar el archivo de audio.'}), 500
    else:
        return jsonify({'error': 'No se encontró ningún archivo de audio para descargar.'}), 404



if __name__ == "__main__":
    inicializar_modelo()
    app.run() 