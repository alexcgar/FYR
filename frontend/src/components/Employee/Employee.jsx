// src/components/Employee/Employee.jsx

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { getWorkOrderInfo, generateOrder } from '../../Services/apiServices';
import '../components_css/Audio.css';

const Employee = ({ productos = [] }) => {
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

  const handleGenerateOrder = async () => {
    if (!productos || productos.length === 0) {
      console.error("No hay productos seleccionados.");
      return;
    }

    const orderData = {
      CodCompany: "1",
      IDWorkOrder: "696c98a1-69f3-4bbc-8a8e-da8bf1a31bbc", // Reemplaza con el ID real de la orden de trabajo
      IDEmployee: "f9aaec71-d1d2-4fd7-8317-24950668e717", // Reemplaza con el ID real del empleado
      Lines: productos
        .filter(producto => producto.cantidad > 0)
        .map(producto => ({
          IDArticle: producto.id_article, // Asegúrate de que este campo existe
          Quantity: producto.cantidad,
        })),
    };

    try {
      const response = await generateOrder(orderData);
      console.log("Pedido generado exitosamente:", response);
    } catch (error) {
      console.error("Error al generar el pedido:", error);
    }
  };

  return (
    <div>
      {error ? (
        <p className="text-danger">Error: {error}</p>
      ) : employeeInfo ? (
        <Table striped bordered hover variant="light" className="border border-5">
          <thead>
            <tr>
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
      <div className="d-flex justify-content-center mb-3">
        <Button
          style={{ backgroundColor: '#283746', width: '80%' }}
          onClick={handleGenerateOrder}
        >
          GENERAR PEDIDO
        </Button>
      </div>
    </div>
  );
};
Employee.propTypes = {
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id_article: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Employee;
