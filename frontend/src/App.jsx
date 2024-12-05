import Navbar from "./components/Navbar/Navbar.jsx";
import Employee from "./components/Employee/Employee.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Correos from "./components/Correos/Correos.jsx";
import AudioRecorder from "./components/Audio/Audio.jsx";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="row " >
        <div className="col-12 mb-3">
          <Navbar /> {/* Incluye el Navbar en tu aplicación */}
        </div>
      </div>

      <div className="row p-3 justify-content-center  ">
        <div className="col-lg-12 mb-2">
          <Employee /> {/* Incluye el componente Employee en tu aplicación */}
        </div>
        <div className="col-12 ">
          <Correos /> {/* Incluye el componente Correos en tu aplicación */}
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <AudioRecorder /> {/* Incluye el componente AudioRecorder en tu aplicación */}
        </div>
      </div>
      <div className="row mt-auto ">
        <div className="col-12 p-0 m-0">
          <Footer /> {/* Incluye el Footer en tu aplicación */}
        </div>
      </div>
      
    </div>
  );
}

export default App;
