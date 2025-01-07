import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Table, Button, Alert, Spinner } from "react-bootstrap";
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
  const [orderGenerated, setOrderGenerated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await fetchEmployeeInfo("1", "", "");
        setEmployeeInfo(data[0]);
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
      const numeroRandon = Math.floor(Math.random() * 1000);

      const IdMessage = predicciones[0]?.correo_id + numeroRandon;
      if (!IdMessage) {
        throw new Error("No se pudo obtener el ID del mensaje");
      }

      const entityData = {
        CodCompany: "1",
        IDWorkOrder: "696c98a1-69f3-4bbc-8a8e-da8bf1a31bbc",
        IDEmployee: "f9aaec71-d1d2-4fd7-8317-24950668e717",
        IDMessage: IdMessage,
        TextTranscription: predicciones
          .map((producto) => `${producto.descripcion}${producto.cantidad}`)
          .join(","),
        FileMP3: audioBase64,
      };
      try {
        const response = await generateEntity(entityData);
        console.log("Entidad generada exitosamente:", response);

        setEntityGenerated(true);
      } catch (error) {
        console.error("Error al generar la entidad:", error);
      }
    }

    handleGenerateEntity();
  }, [audioBase64, entityGenerated]);

  const handleGenerateOrder = async () => {
    setIsLoading(true); // Show the loader
    try {
      // Add a 35-second delay before proceeding
      await new Promise((resolve) => setTimeout(resolve, 35000));
  
      const response = await fetch("http://localhost:5000/api/predicciones");
      const predicciones = await response.json();
      console.log("Predicciones:", predicciones);
  
      if (!productos || productos.length === 0) {
        console.error("No hay productos seleccionados.");
        setIsLoading(false); // Hide the loader
        return;
      }
  
      const orderData = {
        CodCompany: "1",
        IDAudioMP3ToOrderSL: employeeInfo.IDAudioMP3ToOrderSL,
        TextPrediction: predicciones
          .map(
            (prediccion) =>
              `${prediccion.codigo_prediccion}-${prediccion.descripcion}`
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
        setOrderGenerated(response);
  
        // Delay logout (optional logic)
        setTimeout(() => {
          setIsLoggedIn(false);
        }, 988000);
      } catch (error) {
        console.error("Error al generar el pedido:", error);
      }
    } catch (error) {
      console.error("Error al obtener predicciones:", error);
    } finally {
      setIsLoading(false); // Hide the loader
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
          className="border border-5 m-1 mb-3"
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
                <strong>{employeeInfo.CodEmployee} - {employeeInfo.DesEmployee}</strong>
              </td>
              <td>
                <strong>{employeeInfo.CodWorkOrder} ({employeeInfo.DateWorkerOrder})</strong>
              </td>
              <td>
                <strong>{employeeInfo.CodCustomer} - {employeeInfo.DesCustomer}</strong>
              </td>
              <td><strong>{employeeInfo.DesCustomerDeliveryAddress}</strong></td>
              <td>
                <strong>{employeeInfo.CodProject} {employeeInfo.VersionProject}{" "}
                {employeeInfo.DesProject}</strong>
              </td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <p>Cargando información del empleado...</p>
      )}
      {orderGenerated && (
        <Alert variant="success" className="text-center">
          <strong>Pedido generado correctamente:</strong>
          <br />
          <br />
          <strong>ID de Pedido:</strong> {orderGenerated.data.IDOrder}
          <br />
          <br />
          <strong>Código de Pedido:</strong> {orderGenerated.data.CodOrder}
          <br />
          <br />
          <strong>Fecha de Pedido:</strong>{" "}
          {new Date(orderGenerated.data.OrderDate).toLocaleDateString()}
        </Alert>
      )}
      {isLoading && (
        <div className="d-flex justify-content-center mb-3">
          <Spinner animation="border" variant="primary" />
        </div>
      )}
      <div className="d-flex justify-content-center ">
        <Button
          style={{ backgroundColor: "#283746", width: "100%" }}
          onClick={handleGenerateOrder}
          disabled={isLoading}
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
