import React from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Employee from "./components/Employee/Employee.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Correos from "./components/Correos/Correos.jsx";
import AudioRecorder from "./components/Audio/Audio.jsx";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  return (
    <div className="App">
      <Navbar /> {/* Incluye el Navbar en tu aplicación */}
      <div className="container-fluid">
        <div className="row">
      <AudioRecorder /> {/* Incluye el componente AudioRecorder en tu aplicación */}
      <Employee /> {/* Incluye el componente Employee en tu aplicación */}
        </div>
      </div>
      <Correos /> {/* Incluye el componente Correos en tu aplicación */}
      
      <Footer /> {/* Incluye el Footer en tu aplicación */}
      
    </div>
  );
}

export default App;
