import {
    MDBBtn,
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBInput,
    MDBCheckbox
}
from 'mdb-react-ui-kit';
import '../components_css/Login.css';
import logo from "../../assets/novaLogo.png"; // Importa la imagen de React

function App() {
return (
    <MDBContainer fluid className='vh-100'>
        <MDBRow className='d-flex justify-content-center align-items-center h-100 bg-dark'>
            <MDBCol col='12'>
                <MDBCard className='bg-white my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
                    <MDBCardBody className='p-5 w-100 d-flex flex-column'>
                        <img src={logo} alt="Logo" className="mb-4 mx-auto d-block" style={{ width: '150px' }} />
                        <p className="text-white-50 mb-3">¡Por favor ingrese su usuario y contraseña!</p>
                        <MDBInput wrapperClass='mb-4 w-100' label='Correo electrónico' id='formControlLg' type='email' size="lg"/>
                        <MDBInput wrapperClass='mb-4 w-100' label='Contraseña' id='formControlLg' type='password' size="lg"/>
                        <MDBCheckbox name='flexCheck' id='flexCheckDefault' className='mb-4' label='Recordar contraseña' />
                        <MDBBtn size='lg'>
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

export default App;