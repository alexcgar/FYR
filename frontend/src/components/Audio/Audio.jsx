import { useState, useEffect } from "react";
import { Button, Collapse, Table } from "react-bootstrap";
import axios from "axios";
import PropTypes from "prop-types";
import "../components_css/Audio.css";
import CustomAudioPlayer from "../ReproductorAudio/ReproductorAudio";

function AudioPlayer({setAudioBase64}) {
  const [audioUrl, setAudioUrl] = useState("");
  const [open, setOpen] = useState(false);

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  useEffect(() => {
    const handleObtenerAudio = () => {
      axios
        .get("http://localhost:5000/api/getAudio", { responseType: "arraybuffer" })
        .then((response) => {
          // Convertir arraybuffer a base64
          const base64String = arrayBufferToBase64(response.data);
          setAudioBase64(base64String);

          // Crear Blob URL para reproducir el audio
          const audioBlob = new Blob([response.data], { type: "audio/mp3" });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
        })
        .catch((error) => {
          console.error("Error fetching audio:", error);
        });
    };

    handleObtenerAudio();
  }, [setAudioBase64]);

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = "audio.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="text-white text-center">
      <Button
        variant="dark"
        className="mb-3 nova2"
        onClick={() => setOpen(!open)}
        style={{ backgroundColor: "#283746", width: "80%" }}
      >
        {open ? "Cerrar Detalles" : "Ver Detalles del Audio"}
      </Button>

      <Collapse in={open}>
        <div className="p-3">
          <Table bordered variant="dark" className="mb-0 p-2 ">
            <thead>
              <tr>
                <th>REPRODUCTOR DE AUDIO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ width: "900%" }}>
                  <CustomAudioPlayer audioUrl={audioUrl} />
                </td>
                <td >
                  <div className="d-flex gap-3">
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
AudioPlayer.propTypes = {
  setAudioBase64: PropTypes.func.isRequired, // setAudioBase64 debe ser una función y es requerida
};
export default AudioPlayer;