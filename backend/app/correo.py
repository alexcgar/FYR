import os
import json
import requests
from msal import ConfidentialClientApplication
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
TENANT_ID = os.getenv("TENANT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
USER_EMAIL = os.getenv("USER_EMAIL")  # Correo electrónico del usuario

# Configuración de los permisos
SCOPES = ["https://graph.microsoft.com/.default"]


def obtener_token():
    """Obtiene un token de acceso utilizando Client Credentials Flow."""
    app = ConfidentialClientApplication(
        CLIENT_ID,
        authority=f"https://login.microsoftonline.com/{TENANT_ID}",
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=SCOPES)
    if "access_token" in result:
        return result["access_token"]
    else:
        error_msg = result.get(
            "error_description", "No se pudo obtener el token de acceso."
        )
        raise Exception(f"No se pudo obtener el token de acceso: {error_msg}")


def extract_body_message(cuerpo, correo_id):
    """Procesa el cuerpo del mensaje y extrae la información necesaria."""
    try:
        # Cambiar comillas simples por dobles
        cuerpo = cuerpo.replace("'", '"')
        mensaje_json = json.loads(cuerpo)
        
        if "items" in mensaje_json:
            descriptions = []
            for item in mensaje_json["items"]:
                producto = item.get("product", "")
                size = item.get("size", "")
                if size == "N/A":
                    size = ""
                # Combinar producto y size
                combined = f"{producto} {size}".strip()
                quantity = item.get("quantity", "")
                # Añadir el id del correo
                descriptions.append([combined, quantity, correo_id])
                print(f"Producto: {combined}, Cantidad: {quantity}")
            return descriptions
        return []
    except json.JSONDecodeError:
        return []
    except Exception:
        return []


def procesar_correos():
    """
    Procesa los correos no leídos y extrae los productos del cuerpo del mensaje.
    Returns:
        list: Lista de productos extraídos de los correos no leídos.
    """
    token = obtener_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    
    # Filtro para correos no leídos
    filtro_no_leidos = "isRead eq false"
    endpoint = f"https://graph.microsoft.com/v1.0/users/{USER_EMAIL}/mailFolders/Inbox/messages"
    params = {"$filter": filtro_no_leidos, "$top": "10"}  # Limitar a los 10 correos no leídos más recientes

    response = requests.get(endpoint, headers=headers, params=params)
    
    if response.status_code == 200:
        messages = response.json().get("value", [])
        productos = []
        for message in messages:
            cuerpo = message.get("body", {}).get("content", "")
            correo_id = message.get("id", "")
            
            # Procesar cuerpo del mensaje (HTML o texto plano)
            if message.get("body", {}).get("contentType", "") == "html":
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(cuerpo, "html.parser")
                cuerpo = soup.get_text()

            # Extraer productos
            extracted_items = extract_body_message(cuerpo, correo_id)
            productos.extend(extracted_items)


        return productos
    else:
        raise Exception(
            f"Error al obtener los correos: {response.status_code} - {response.text}"
        )



def descargar_audio_desde_correo(carpeta_destino):
    """Descarga archivos mp3 adjuntos de los correos no leídos y los guarda en la carpeta destino."""
    token = obtener_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    # Filtrar correos que tienen adjuntos no leídos
    endpoint = f"https://graph.microsoft.com/v1.0/users/{USER_EMAIL}/mailFolders/Inbox/messages"
    params = {
        "$filter": "isRead eq false and hasAttachments eq true",
        "$expand": "attachments",
        "$top": "10",
    }
    response = requests.get(endpoint, headers=headers, params=params)
    if response.status_code == 200:
        messages = response.json().get("value", [])
        for message in messages:
            attachments = message.get("attachments", [])
            for attachment in attachments:
                nombre_archivo = attachment.get("name", "")
                if nombre_archivo.lower().endswith(".mp3"):
                    attachment_id = attachment.get("id")
                    # Descargar el adjunto
                    adjunto_endpoint = f'https://graph.microsoft.com/v1.0/users/{
                        USER_EMAIL}/messages/{message["id"]}/attachments/{attachment_id}/$value'
                    adjunto_response = requests.get(adjunto_endpoint, headers=headers)
                    if adjunto_response.status_code == 200:
                        # Asegurarse de que la carpeta de destino exista
                        if not os.path.exists(carpeta_destino):
                            os.makedirs(carpeta_destino)
                        ruta_archivo = os.path.join(carpeta_destino, nombre_archivo)
                        with open(ruta_archivo, "wb") as archivo:
                            archivo.write(adjunto_response.content)
                        return ruta_archivo  # Devolver la ruta del archivo de audio
                    else:
                        print(
                            f"Error al descargar el adjunto: {
                              adjunto_response.status_code}"
                        )
        return None
    else:
        raise Exception(
            f"Error al obtener correos: {
                        response.status_code} - {response.text}"
        )

def marcar_email_como_leido(email_id):
    """Marca un correo como leído usando su ID."""
    token = obtener_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    endpoint = f"https://graph.microsoft.com/v1.0/users/{USER_EMAIL}/messages/{email_id}"
    data = {"isRead": True}
    response = requests.patch(endpoint, headers=headers, json=data)
    if response.status_code != 200:
        print(f"Error al marcar correo como leído: {response.status_code} - {response.text}")
