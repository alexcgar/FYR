// src/components/Navbar.js
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
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
            <Nav.Link href="./">Login</Nav.Link>
            <Nav.Link href="#">Link</Nav.Link>
            <NavDropdown title="Sobre Novagric" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#">Action</NavDropdown.Item>
              <NavDropdown.Item href="#">Another action</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#">Something else here</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    
    
    
  );
};

export default NavBar;
