import React, { useRef, useState } from "react";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBSpinner,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import audioFile from "../../assets/Audio/Audio.mp3";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const startPlaying = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (event) => {
    if (audioRef.current) {
      audioRef.current.currentTime = event.target.value;
      setCurrentTime(event.target.value);
    }
  };

  return (
   
      <MDBCol md="12" lg="12" xl="6">
        <MDBContainer fluid className="my-2">
          <MDBCard className="shadow-">
            <MDBCardBody className="text-center bg-dark text-white">
              <h3 className="mb-4">
                <MDBIcon fas icon="headphones" className="me-2" />
                Reproducir Audio
              </h3>

              <div className="mb-4">
                <audio
                  ref={audioRef}
                  src={audioFile}
                  className="w-100"
                  style={{
                    height: "50px",
                    borderRadius: "10px",
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleAudioLoaded}
                />
              </div>

              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="w-100"
                />
              </div>

              <div className="d-flex justify-content-center gap-3">
                <MDBBtn
                  color="primary"
                  onClick={startPlaying}
                  disabled={isPlaying}
                >
                  <MDBIcon fas icon="play" className="me-2" />
                  {isPlaying ? (
                    <>
                      Reproduciendo
                      <MDBSpinner size="sm" className="ms-2" />
                    </>
                  ) : (
                    "Iniciar Reproducción"
                  )}
                </MDBBtn>

                <MDBBtn
                  color="danger"
                  onClick={stopPlaying}
                  disabled={!isPlaying}
                >
                  <MDBIcon fas icon="stop" className="me-2" />
                  Detener
                </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </MDBCol>
   
  );
};

export default AudioPlayer;
