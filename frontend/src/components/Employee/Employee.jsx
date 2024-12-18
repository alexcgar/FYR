import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Table, Button, Alert } from "react-bootstrap";
import {
  fetchEmployeeInfo,
  generateOrder,
  generateEntity,
} from "../../Services/apiServices";

import "../components_css/Audio.css";

const Employee = ({ productos = [], audioBase64, setIsLoggedIn }) => {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [error, setError] = useState(null);
  const [entityGenerated, setEntityGenerated] = useState(false);
  const [orderGenerated, setOrderGenerated] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await fetchEmployeeInfo("1", "", "");
        setEmployeeInfo(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchInfo();
  }, []);

  useEffect(() => {
    if (!audioBase64 || entityGenerated) {
      return;
    }
    async function handleGenerateEntity() {
      const response = await fetch("http://localhost:5000/api/predicciones");

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Respuesta inesperada:", responseText);
        throw new Error("La respuesta no es un JSON válido");
      }

      const predicciones = await response.json();
      if (!Array.isArray(predicciones) || predicciones.length === 0) {
        throw new Error("No se encontraron predicciones");
      }

      const IdMessage = predicciones[0]?.correo_id;
      if (!IdMessage) {
        throw new Error("No se pudo obtener el ID del mensaje");
      }

      const entityData = {
        CodCompany: "1",
        IDWorkOrder: "696c98a1-69f3-4bbc-8a8e-da8bf1a31bbc", //ID de la orden de trabajo
        IDEmployee: "f9aaec71-d1d2-4fd7-8317-24950668e717", //ID del empleado que te ha mandado el audio
        IDMessage: IdMessage,
        TextTranscription: predicciones
          .map((producto) => `${producto.descripcion}${producto.cantidad}`)
          .join(","),
        FileMP3: audioBase64,
        
      };
      try {
        const response = await generateEntity(entityData);
        console.log("Entidad generada exitosamente:", response);
        console.log("aaa", IdMessage);

        setEntityGenerated(true);
      } catch (error) {
        console.error("Error al generar la entidad:", error);
      }
      

    }

    handleGenerateEntity();
  }, [audioBase64, entityGenerated]);

  const handleGenerateOrder = async () => {
    const response = await fetch("http://localhost:5000/api/predicciones");
    const predicciones = await response.json();
    if (!productos || productos.length === 0) {
      console.error("No hay productos seleccionados.");
      return;
    }

    const orderData = {
      CodCompany: "1",
      IDAudioMP3ToOrderSL: employeeInfo.IDAudioMP3ToOrderSL,
      TextPrediction: predicciones
        .map(
          (prediccion) =>
            `${prediccion.codigo_prediccion}-${prediccion.descripcion_csv}`
        )
        .join(","),
      Lines: productos
        .filter((producto) => producto.cantidad > 0)
        .map((producto) => ({
          IDArticle: producto.id_article,
          Quantity: producto.cantidad,
        })),
    };
    console.log("Generando pedido:", orderData);
    try {
      const response = await generateOrder(orderData);
      console.log("Pedido generado exitosamente:", response);
      setOrderGenerated(true);
      setTimeout(() => {
        setIsLoggedIn(false); // Redirigir al login después de 3 segundos
      }, 3000);
    } catch (error) {
      console.error("Error al generar el pedido:", error);
    }
  };

  return (
    <div>
      {error ? (
        <p className="text-danger">Error: {error}</p>
      ) : employeeInfo ? (
        <Table
          striped
          bordered
          hover
          variant="light"
          className="border border-5"
        >
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
              <td>
                {employeeInfo.CodEmployee} - {employeeInfo.DesEmployee}
              </td>
              <td>
                {employeeInfo.CodWorkOrder} ({employeeInfo.DateWorkerOrder})
              </td>
              <td>
                {employeeInfo.CodCustomer} - {employeeInfo.DesCustomer}
              </td>
              <td>{employeeInfo.DesCustomerDeliveryAddress}</td>
              <td>
                {employeeInfo.CodProject} {employeeInfo.VersionProject}{" "}
                {employeeInfo.DesProject}
              </td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <p>Cargando información del empleado...</p>
      )}
      {orderGenerated && (
        <Alert variant="success" className="text-center">
          Pedido generado correctamente
        </Alert>
      )}
      <div className="d-flex justify-content-center mb-3">
        <Button
          style={{ backgroundColor: "#283746", width: "80%" }}
          onClick={handleGenerateOrder}
        >
          GENERAR PEDIDO
        </Button>
      </div>
    </div>
  );
};

Employee.propTypes = {
  audioBase64: PropTypes.string.isRequired,
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id_article: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ).isRequired,
  setIsLoggedIn: PropTypes.func.isRequired,
};

export default Employee;
