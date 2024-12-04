import win32com.client
import pythoncom
import json
import requests
from msal import ConfidentialClientApplication


def extract_body_message(cuerpo):
    try:
        cuerpo = cuerpo.replace(
            "'", '"'
        )  # Cambiar comillas simples por dobles para poder decodificar el JSON
        mensaje_json = json.loads(cuerpo)

        if "items" in mensaje_json:
            descriptions = []
            for item in mensaje_json["items"]:
                producto = item.get("product", "")
                size = item.get("size", "")
                quantity = item.get("quantity", "")
                if size == "N/A":
                    size = ""
                descriptions.append(f"{producto} {size} {quantity}".strip())
            return descriptions

    except json.JSONDecodeError:
        return []
    except Exception:
        print("Error al procesar el mensaje")
        return []


def procesar_correos():
    pythoncom.CoInitialize()  # Inicializar COM para poder usar Outlook en Windows
    try:
        outlook = win32com.client.Dispatch("Outlook.Application")  # Conectarse a Outlook
        namespace = outlook.GetNamespace("MAPI") # Obtener el espacio de nombres MAPI de Outlook que contiene las carpetas de correo
        inbox = namespace.GetDefaultFolder(6)  # 6 es el número de la bandeja de entrada
        messages = inbox.Items  # Obtener los mensajes de la bandeja de entrada
        messages.Sort("[ReceivedTime]", True)  # Ordenar los correos por fecha de recepción, del más reciente al más antiguo
        productos = []
        for message in messages:
            if message.Attachments.Count > 0:

                if not message.UnRead:  # Verificar si el mensaje no ha sido leído
                     continue

                for attachment in message.Attachments:
                    if attachment.FileName.lower().endswith('.mp3'):
                        cuerpo = message.Body
                        productos.extend(extract_body_message(cuerpo))
                        break  # Salir del bucle si se encuentra un archivo mp3 adjunto
        return productos
    finally:
        pythoncom.CoUninitialize()  # Desinicializar COM


# def procesar_correos_graph_api():

#     # Configuración de la aplicación
#     client_id = "YOUR_CLIENT_ID"
#     client_secret = "YOUR_CLIENT_SECRET"
#     tenant_id = "YOUR_TENANT_ID"
#     authority = f"https://login.microsoftonline.com/{tenant_id}"
#     scope = ["https://graph.microsoft.com/.default"]

#     # Autenticación
#     app = ConfidentialClientApplication(
#         client_id, authority=authority, client_credential=client_secret
#     )
#     result = app.acquire_token_for_client(scopes=scope)

#     if "access_token" in result:
#         access_token = result["access_token"]
#     else:
#         print("Error al obtener el token de acceso")
#         return []

#     # Obtener correos
#     headers = {
#         "Authorization": f"Bearer {access_token}",
#         "Content-Type": "application/json",
#     }
#     endpoint = (
#         "https://graph.microsoft.com/v1.0/users/USER_ID/mailFolders/inbox/messages"
#     )
#     response = requests.get(endpoint, headers=headers)

#     if response.status_code == 200:
#         messages = response.json().get("value", [])
#         productos = []
#         for message in messages:
#             if "isRead" in message and message["isRead"]:
#                 continue

#             if "hasAttachments" in message and message["hasAttachments"]:
#                 message_id = message["id"]
#                 attachment_endpoint = f"https://graph.microsoft.com/v1.0/users/USER_ID/messages/{message_id}/attachments"
#                 attachment_response = requests.get(attachment_endpoint, headers=headers)

#                 if attachment_response.status_code == 200:
#                     attachments = attachment_response.json().get("value", [])
#                     for attachment in attachments:
#                         if attachment["name"].lower().endswith(".mp3"):
#                             cuerpo = message["body"]["content"]
#                             productos.extend(extract_body_message(cuerpo))
#                             break  # Salir del bucle si se encuentra un archivo mp3 adjunto
#         return productos
#     else:
#         print("Error al obtener los correos")
#         return []
