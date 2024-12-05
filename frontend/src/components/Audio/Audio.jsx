import { useState } from "react";
import { Button, Collapse, Table } from "react-bootstrap";
import axios from "axios";
import "../components_css/Audio.css";
import CustomAudioPlayer from "../ReproductorAudio/ReproductorAudio";

function AudioPlayer() {
  const [audioUrl, setAudioUrl] = useState("");
  const [open, setOpen] = useState(false); // Estado para manejar el despliegue del div completo

  const handleDownload = () => {
    axios
      .get("http://localhost:5000/api/getAudio", { responseType: "blob" })
      .then((response) => {
        const audioBlob = new Blob([response.data], { type: "audio/mp3" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Crear un enlace temporal para descargar el archivo
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "audio.mp3");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error fetching audio:", error);
      });
  };

  const handleFetchAudio = () => {
    axios
      .get("http://localhost:5000/api/getAudio", { responseType: "blob" })
      .then((response) => {
        const audioBlob = new Blob([response.data], { type: "audio/mp3" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      })
      .catch((error) => {
        console.error("Error fetching audio:", error);
      });
  };

  return (
    <div className="text-white w-100">
      <Button
        variant="dark"
        className="mb-3 nova2 w-100"
        onClick={() => setOpen(!open)} // Toggle para abrir y cerrar el contenido completo
        style={{ backgroundColor: "#283746" }} // Estilo en línea con el color especificado
      >
        {open ? "Cerrar Detalles" : "Ver Detalles del Audio"}
      </Button>

      <Collapse in={open}>
        <div>
          {/* Tabla con contenido del reproductor y acciones */}
          <Table bordered  variant="dark" className="mb-0">
            <thead>
              <tr>
                <th>REPRODUCTOR DE AUDIO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: "70%" }}> {/* Aumenta el ancho de la celda del reproductor */}
                  <CustomAudioPlayer audioUrl={audioUrl} />
                </td>
                <td style={{ width: "30%" }}> {/* Ancho más pequeño para las acciones */}
                  {/* Botones de acciones */}
                  <div className="d-flex gap-3">
                  <Button
                      variant="dark"
                      className="border border-white"
                      onClick={handleFetchAudio}
                    >
                      Obtener Audio
                    </Button>
                    <Button
                      variant="dark"
                      className="border border-white"
                      onClick={handleDownload}
                      disabled={!audioUrl}
                    >
                      Descargar
                    </Button>
                    
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Collapse>
    </div>
  );
}

export default AudioPlayer;
