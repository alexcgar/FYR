import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

const Employee = () => {
    return(
    <Card className=' bg-dark text-white' >
      <Card.Body>
        <Card.Title>Detalles Empleado</Card.Title>
        <Card.Text>
        <p>CodCompany: 1</p>
        <p>IDWorkOrder: 696c98a1-69f3-4bbc-8a8e-da8bf1a31bbc</p>
        <p>IDEmployee: f9aaec71-d1d2-4fd7-8317-24950668e717</p>
        </Card.Text>
        <Button variant="dark border border-white">Completar pedido</Button>
      </Card.Body>
    </Card>
);
}
export default Employee;
