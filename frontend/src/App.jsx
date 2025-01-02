import Navbar from "./components/Navbar/Navbar.jsx";
import Employee from "./components/Employee/Employee.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Correos from "./components/Correos/Correos.jsx";
import AudioRecorder from "./components/Audio/Audio.jsx";
import Login from "./components/Login/Login.jsx";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";
import { useState } from "react";

function App() {
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [audioBase64, setAudioBase64] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row">
        <div className="col-12 mb-5 mt-4">
          <Navbar setisLoggedin={setIsLoggedIn} />{" "}
          {/* Incluye el Navbar en tu aplicación */}
        </div>
      </div>

      <div className="row  justify-content-center flex-grow-1 p-3">
        <div className="col-lg-12 mb-5 mt-4">
          <Employee
            productos={productosSeleccionados}
            audioBase64={audioBase64}
            setIsLoggedIn={setIsLoggedIn}
          />
        </div>
        <div className="col-12">
          <Correos setProductosSeleccionados={setProductosSeleccionados} />
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-12">
          <AudioRecorder setAudioBase64={setAudioBase64} />{" "}
          {/* Incluye el componente AudioRecorder en tu aplicación */}
        </div>
      </div>
      <div className="row mt-auto">
        <div className="col-12 p-0 m-0">
          <Footer /> {/* Incluye el Footer en tu aplicación */}
        </div>
      </div>
    </div>
  );
}

export default App;
