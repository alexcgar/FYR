import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBInput,
} from 'mdb-react-ui-kit';
import axios from 'axios';
import '../components_css/Login.css';
import logo from "../../assets/novaLogo.png"; // Importa la imagen de React

const Login = ({ setIsLoggedIn, setUserEmail }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
       await axios.post('https://dinasa.wskserver.com:56544//api/login/authenticate', {
        Username: email,
        Password: password
      });

      setIsLoggedIn(true);
      setUserEmail(email); // Pasa el correo electrónico al componente padre

    } catch (error) {
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('Error en la respuesta del servidor:', error.response.data);
        setError(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
        setError('No se recibió respuesta del servidor. Por favor, inténtelo de nuevo.');
      } else {
        // Algo sucedió al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
        setError('Error durante la autenticación. Por favor, inténtelo de nuevo.');
      }
    }
  };

  return (
    <MDBContainer fluid className='vh-100' style={{ backgroundColor: '#e4e8ed' }}>
      <MDBRow className='d-flex justify-content-center align-items-center h-100'>
        <MDBCol col='12'>
          <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
            <MDBCardBody className='p-5 w-100 d-flex flex-column'>
              <img src={logo} alt="Logo" className="mb-4 mx-auto d-block" style={{ width: '150px' }} />
              <p className="text-white-50 mb-3">¡Por favor ingrese su usuario y contraseña!</p>
              {error && <p className="text-danger">{error}</p>}
              <MDBInput
                wrapperClass='mb-4 w-100'
                label='Usuario'
                id='formControlLgUsuario'
                type='email'
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MDBInput
                wrapperClass='mb-4 w-100'
                label='Contraseña'
                id='formControlLgContraseña'
                type='password'
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <MDBBtn size='lg' onClick={handleLogin}>
                Iniciar sesión
              </MDBBtn>
              <hr className="my-4" />
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}
Login.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
  setUserEmail: PropTypes.func.isRequired,
};

export default Login;
