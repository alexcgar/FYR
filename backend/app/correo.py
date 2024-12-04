import win32com.client
import pythoncom
import json
import os
import logging

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
        logger.error("Error al decodificar el JSON del cuerpo del mensaje.")
        return []
    except Exception as e:
        logger.error(f"Error al procesar el mensaje: {e}")
        return []

def procesar_correos():
    pythoncom.CoInitialize()  # Inicializar COM para poder usar Outlook en Windows
    try:
        logger.info("Conectándose a Outlook...")
        outlook = win32com.client.Dispatch("Outlook.Application")  # Conectarse a Outlook
        namespace = outlook.GetNamespace("MAPI")  # Obtener el espacio de nombres MAPI de Outlook que contiene las carpetas de correo
        inbox = namespace.GetDefaultFolder(6)  # 6 es el número de la bandeja de entrada
        messages = inbox.Items  # Obtener los mensajes de la bandeja de entrada
        messages.Sort("[ReceivedTime]", True)  # Ordenar los correos por fecha de recepción, del más reciente al más antiguo
        productos = []

        logger.info("Procesando mensajes de correo...")
        for message in messages:
            if message.UnRead:  # Verificar si el mensaje no ha sido leído
                logger.info(f"Procesando correo de: {message.SenderName}, Asunto: {message.Subject}")
                cuerpo = message.Body
                productos.extend(extract_body_message(cuerpo))

        return productos
    finally:
        pythoncom.CoUninitialize()  # Desinicializar COM

# Configurar el registro
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
def descargar_audio_desde_correo(carpeta_destino):
    pythoncom.CoInitialize()  # Inicializar COM para poder usar Outlook en Windows
    try:
        logger.info("Conectándose a Outlook...")
        outlook = win32com.client.Dispatch("Outlook.Application")  # Conectarse a Outlook
        namespace = outlook.GetNamespace("MAPI")  # Obtener el espacio de nombres MAPI de Outlook que contiene las carpetas de correo
        inbox = namespace.GetDefaultFolder(6)  # 6 es el número de la bandeja de entrada
        messages = inbox.Items  # Obtener los mensajes de la bandeja de entrada
        messages.Sort("[ReceivedTime]", True)  # Ordenar los correos por fecha de recepción, del más reciente al más antiguo
        audio_path = None

        logger.info("Procesando mensajes de correo para descargar archivos de audio...")
        for message in messages:
            if message.UnRead:  # Verificar si el mensaje no ha sido leído
                logger.info(f"Procesando correo de: {message.SenderName}, Asunto: {message.Subject}")
                if message.Attachments.Count > 0:
                    for attachment in message.Attachments:
                        logger.info(f"Encontrado adjunto: {attachment.FileName}")
                        if attachment.FileName.lower().endswith('.mp3'):
                            # Asegurarse de que la carpeta de destino exista
                            if not os.path.exists(carpeta_destino):
                                os.makedirs(carpeta_destino)
                                logger.info(f"Creada carpeta de destino: {carpeta_destino}")
                            audio_path = os.path.join(carpeta_destino, attachment.FileName)
                            logger.info(f"Intentando guardar el archivo en: {audio_path}")
                            attachment.SaveAsFile(audio_path)
                            logger.info(f"Archivo de audio descargado en: {audio_path}")
                            message.UnRead = False  # Marcar el mensaje como leído
                            return audio_path  # Devolver la ruta del archivo de audio
        logger.warning("No se encontró ningún archivo de audio en los correos no leídos.")
        return None
    except Exception as e:
        logger.error(f"Error al descargar el audio desde el correo: {e}")
        return None
    finally:
        pythoncom.CoUninitialize()  # Desinicializar COM

