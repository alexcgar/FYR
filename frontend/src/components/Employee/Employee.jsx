import { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { getWorkOrderInfo } from '../../Services/apiServices';
import '../components_css/Audio.css';
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
    <div>
      <div className=' m-5 '>
        {error ? (
          <p className="text-danger">Error: {error}</p>
        ) : employeeInfo ? (
          <Table striped bordered hover variant="light" className=" border border-5">
            <thead>
              <tr className=''>
                <th>EMPLEADO</th>
                <th>ORDEN DE TRABAJO</th>
                <th>CLIENTE</th>
                <th>FINCA</th>
                <th>PROYECTO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{employeeInfo.CodEmployee} - {employeeInfo.DesEmployee}</td>
                <td>{employeeInfo.CodWorkOrder} ({employeeInfo.DateWorkerOrder})</td>
                <td>{employeeInfo.CodCustomer} - {employeeInfo.DesCustomer}</td>
                <td>{employeeInfo.DesCustomerDeliveryAddress}</td>
                <td>{employeeInfo.CodProject} {employeeInfo.VersionProject} {employeeInfo.DesProject}</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <p>Cargando información del empleado...</p>
        )}
        <div className="d-flex justify-content-center ">
          <Button style={{ backgroundColor: '#283746', width: '80%' }}>
            GENERAR PEDIDO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Employee;
