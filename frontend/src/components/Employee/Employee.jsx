import { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { getWorkOrderInfo } from '../../Services/apiServices';

const Employee = () => {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const workOrderId = '696c98a1-69f3-4bbc-8a8e-da8bf1a31bbc'; // Reemplaza con el ID real
        const employeeId = 'f9aaec71-d1d2-4fd7-8317-24950668e717'; // Reemplaza con el ID real
        const data = await getWorkOrderInfo(workOrderId, employeeId);
        setEmployeeInfo(data);
      } catch (error) {
        console.error('Error al obtener la información del empleado:', error);
        setError(error.message);
      }
    };

    fetchEmployeeInfo();
  }, []);

  return (
    <Card className='bg-dark text-white'>
      <Card.Body>
        <Card.Title>Detalles OT</Card.Title>
        {error && (
          <Card.Text className="text-danger">Error: {error}</Card.Text>
        )}
        {employeeInfo ? (
          <>
            <Card.Text>Empleado: {employeeInfo.CodEmployee} - {employeeInfo.DesEmployee}</Card.Text>
            <Card.Text>Orden de Trabajo: {employeeInfo.CodWorkOrder}</Card.Text>
            <Card.Text>Cliente: {employeeInfo.CodCustomer} - {employeeInfo.DesCustomer}</Card.Text>
            <Card.Text>Finca: {employeeInfo.DesCustomerDeliveryAddress}</Card.Text>
          </>
        ) : (
          !error && <Card.Text>Cargando información del empleado...</Card.Text>
        )}
        <Button variant="dark border border-white">Completar pedido</Button>
      </Card.Body>
    </Card>
  );
};

export default Employee;