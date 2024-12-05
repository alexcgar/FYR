import { useState } from "react";
import { MDBBtn, MDBCard, MDBCardBody, MDBIcon } from "mdb-react-ui-kit";
import "../components_css/Audio.css";
import axios from 'axios';

function AudioPlayer() {
  const [audioUrl, setAudioUrl] = useState("");

  const handleDownload = () => {
    axios.get('http://localhost:5000/api/getAudio', { responseType: 'blob' })
      .then(response => {
        const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Crear un enlace temporal para descargar el archivo
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'audio.mp3');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error fetching audio:', error);
      });
  };
  const handleFetchAudio = () => {
    axios.get('http://localhost:5000/api/getAudio', { responseType: 'blob' })
      .then(response => {
        const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      })
      .catch(error => {
        console.error('Error fetching audio:', error);
      });
  };
  

  return (
    <MDBCard className="text-white">
      <MDBCardBody className="nova2 rounded-4">
        <h1 className="mb-5">Reproducir Audio</h1>
        <div className="mb-4">
          <audio
            controls
            src={audioUrl}
            className="w-100"
            style={{
              height: "103px",
              borderRadius: "10px",
            }}
          />
        </div>
        <div className="d-flex gap-3">
          <div className="d-flex gap-3">
            <MDBBtn
              color="text-white border border-white"
              onClick={handleDownload}
              disabled={!audioUrl}
              style={{ color: 'white' }}
            >
              <MDBIcon fas icon="download" className="me-2" />
              Descargar
            </MDBBtn>
          </div>
          <div className="d-flex gap-3">
            <MDBBtn
              color="text-white border border-white"
              onClick={handleFetchAudio}
              style={{ color: 'white' }}
            >
              <MDBIcon fas icon="cloud-download-alt" className="me-2" />
              Obtener Audio
            </MDBBtn>
          </div>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
}

export default AudioPlayer;

