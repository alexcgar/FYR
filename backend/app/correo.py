import win32com.client
import pythoncom
import json
import os

def extract_body_message(cuerpo):
    try:
        cuerpo = cuerpo.replace("'", '"')  # Cambiar comillas simples por dobles para poder decodificar el JSON
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
    except Exception as e:
        return []

def procesar_correos():
    pythoncom.CoInitialize()  # Inicializar COM para poder usar Outlook en Windows
    try:
        outlook = win32com.client.Dispatch("Outlook.Application")  # Conectarse a Outlook
        namespace = outlook.GetNamespace("MAPI")  # Obtener el espacio de nombres MAPI de Outlook que contiene las carpetas de correo
        inbox = namespace.GetDefaultFolder(6)  # 6 es el número de la bandeja de entrada
        messages = inbox.Items  # Obtener los mensajes de la bandeja de entrada
        messages.Sort("[ReceivedTime]", True)  # Ordenar los correos por fecha de recepción, del más reciente al más antiguo
        productos = []

        for message in messages:
            if message.UnRead:  # Verificar si el mensaje no ha sido leído
                cuerpo = message.Body
                productos.extend(extract_body_message(cuerpo))
                message.UnRead = False  # Marcar el mensaje como leído

        return productos
    finally:
        pythoncom.CoUninitialize()  # Desinicializar COM

def descargar_audio_desde_correo(carpeta_destino):
    pythoncom.CoInitialize()  # Inicializar COM para poder usar Outlook en Windows
    try:
        outlook = win32com.client.Dispatch("Outlook.Application")  # Conectarse a Outlook
        namespace = outlook.GetNamespace("MAPI")  # Obtener el espacio de nombres MAPI de Outlook que contiene las carpetas de correo
        inbox = namespace.GetDefaultFolder(6)  # 6 es el número de la bandeja de entrada
        messages = inbox.Items  # Obtener los mensajes de la bandeja de entrada
        messages.Sort("[ReceivedTime]", True)  # Ordenar los correos por fecha de recepción, del más reciente al más antiguo
        audio_path = None

        for message in messages:
            if message.UnRead:  # Verificar si el mensaje no ha sido leído
                if message.Attachments.Count > 0:
                    for attachment in message.Attachments:
                        if attachment.FileName.lower().endswith('.mp3'):
                            # Asegurarse de que la carpeta de destino exista
                            if not os.path.exists(carpeta_destino):
                                os.makedirs(carpeta_destino)
                            audio_path = os.path.join(carpeta_destino, attachment.FileName)
                            attachment.SaveAsFile(audio_path)
                            return audio_path  # Devolver la ruta del archivo de audio
        return None
    except Exception as e:
        return None
    finally:
        pythoncom.CoUninitialize()  # Desinicializar COM
