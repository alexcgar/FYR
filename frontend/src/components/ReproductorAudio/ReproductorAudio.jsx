import { useState, useRef } from "react";
import { ProgressBar, Button } from "react-bootstrap";
import "../components_css/ReproductorAudio.css";

// eslint-disable-next-line react/prop-types
const CustomAudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    const percentage = (audio.currentTime / audio.duration) * 100;
    setProgress(percentage);
  };

return (
    <div className="custom-audio-player text-center bg-dark text-white table- rounded table-striped table-hover table-dark" style={{ marginTop: "10px" }}>
        <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            
        />
        <div className="d-flex justify-content-center align-items-center gap-3">
            <Button
                variant="dark"
                onClick={handlePlayPause}
                className="border border-white"
                disabled={!audioUrl}
            >
                {isPlaying ? "Pausar" : "Reproducir"}
            </Button>
            <ProgressBar
                now={progress}
                className="w-100 "
                variant="#283746"
                style={{ height: "20px", borderRadius: "1px", marginTop: "15px" }}
            />
         
        </div>
    </div>
);
};

export default CustomAudioPlayer;