import { useRef, useState } from "react";
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBSpinner,
} from "mdb-react-ui-kit";
import "../components_css/Audio.css";

function AudioPlayer() {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          audioRef.current.src = url;
        };

        mediaRecorder.start();
        setIsRecording(true);

        // setTimeout(() => {
        //   mediaRecorder.stop();
        //   setIsRecording(false);
        // }, 10000000);   Cambia este valor para ajustar la duración de la grabación
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const handleSend = () => {
    // Aquí puedes agregar la lógica para enviar el audio grabado
    console.log("Enviando audio:", audioUrl);
  };

  return (
    <MDBCard className=" text-white">
      <MDBCardBody className="nova rounded-4">
        <h3 className=" mb-5">Realizar Pedido</h3>
        <div className="mb-4">
          <audio
            ref={audioRef}
            controls
            src={audioUrl}
            className="w-100"
            style={{
              height: "86px",
              borderRadius: "10px",
            }}
          />
        </div>
        <div className="d-flex  gap-3">
          <MDBBtn
            color=" text-white border border-white"
            onClick={isRecording ? stopRecording : startRecording}
            
          >
            <MDBIcon
              fas
              icon={isRecording ? "stop" : "microphone"}
              className="me-2"
            />
            {isRecording ? (
              <>
                Grabando
                <MDBSpinner size="sm" className="ms-2" />
              </>
            ) : (
              "Iniciar Grabación"
            )}
          </MDBBtn>
          <MDBBtn
            color="text-white border border-white"
            onClick={handleSend}
            disabled={!audioUrl || isRecording}
          >
            <MDBIcon fas icon="paper-plane" className="me-2" />
            Enviar
          </MDBBtn>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
}

export default AudioPlayer;
