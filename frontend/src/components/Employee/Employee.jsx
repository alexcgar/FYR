import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Table, Button } from "react-bootstrap";
import {
  fetchEmployeeInfo,
  generateOrder,
  generateEntity,
} from "../../Services/apiServices";

import "../components_css/Audio.css";

const Employee = ({ productos = [], audioBase64 }) => {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [error, setError] = useState(null);
  const [entityGenerated, setEntityGenerated] = useState(false); // Estado para rastrear si la entidad ha sido generada

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await fetchEmployeeInfo("1", "", ""); // Pasa los valores adecuados para CodCompany, CodUser, y IDMessage
        setEmployeeInfo(data[0]); // Asumiendo que quieres el primer elemento del array
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

      // Verificar y registrar el encabezado Content-Type
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text(); // Leer respuesta completa
      console.error("Respuesta inesperada:", responseText); // Log de respuesta
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
      IDEmployee: "f9aaec71-d1d2-4fd7-8317-24950668e717",
      IDMessage: IdMessage,
      TextTranscription: predicciones
        .map((producto) => `${producto.descripcion}${producto.cantidad}`) //Jason - 1, etc.
        .join(","), // Concatenar todos los valores de descripcion y cantidad
      FileMP3: audioBase64,
      };
      try {
      const response = await generateEntity(entityData);
      console.log("Entidad generada exitosamente:", response);
      setEntityGenerated(true); // Actualizar el estado para indicar que la entidad ha sido generada
      console.log("Datos de la entidad generada:", response.data); // Log de todos los datos de la entidad generada
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
      CodCompany: "1", //Código de la empresa
      IDAudioMP3ToOrderSL: employeeInfo.IDAudioMP3ToOrderSL, //ID de la entidad
      TextPrediction: predicciones
      .map((prediccion) => `${prediccion.codigo_prediccion}-${prediccion.descripcion_csv}`)
      .join(","), // Concatenate all descripcion_csv values
      Lines: productos
      .filter((producto) => producto.cantidad > 0)
      .map((producto) => ({
        IDArticle: producto.id_article, // Asegúrate de que este campo existe
        Quantity: producto.cantidad,
      })),
    };
    console.log("Generando pedido:", orderData);
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
};

export default Employee;
