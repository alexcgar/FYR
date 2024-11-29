import win32com.client
import pythoncom
import json


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
                
                # if not message.UnRead:  # Verificar si el mensaje no ha sido leído
                #  continue

                for attachment in message.Attachments:
                    if attachment.FileName.lower().endswith('.mp3'):
                        cuerpo = message.Body
                        productos.extend(extract_body_message(cuerpo))
                        break  # Salir del bucle si se encuentra un archivo mp3 adjunto
        return productos
    finally:
        pythoncom.CoUninitialize()  # Desinicializar COM