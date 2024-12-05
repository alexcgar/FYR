// src/components/Navbar.js
import { Navbar, Nav, Container } from 'react-bootstrap';
import "../components_css/Navbar.css"; // Asegúrate de importar el archivo CSS con los estilos personalizados
import logo from "../../assets/logo-blanco-novagric-200x146.png"; // Importa la imagen de React

const NavBar = () => {


  return (
    <Navbar expand="lg" className="navbar-custom ">
      <Container fluid>
        <Navbar.Brand ><img src={logo} alt="Logo" className='logo' href="https://novagric.com/" /></Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="ms-auto me-3">
            <Nav.Link href="./">BUSCAR PEDIDO</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>




  );
};

export default NavBar;
