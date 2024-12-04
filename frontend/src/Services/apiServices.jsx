/* eslint-disable react-refresh/only-export-components */


import axios from 'axios';



const API_SERVER = 'https://dinasa.wskserver.com:56544';
const USERNAME = "apiuser";
const PASSWORD = "XFBORp6srOlNY96qFLmr";

/**
 * Obtener información de la orden de trabajo.
 * @param {string} workOrderId - ID de la orden de trabajo.
 * @param {string} employeeId - ID del empleado.
 * @returns {Object} Datos de la orden de trabajo.
 */
export const getWorkOrderInfo = async (workOrderId, employeeId) => {
  try {
    // Autenticación para obtener el token
    const authResponse = await axios.post(`${API_SERVER}/api/login/authenticate`, {
      Username: USERNAME,
      Password: PASSWORD,
    });
    
    
    // Verificar si la respuesta de autenticación fue exitosa
    if (!authResponse.data || !authResponse.data) {
      throw new Error('Autenticación fallida: Token no recibido.');
    }
   
    const token = authResponse.data.replace(/'/g, '');
   console.log(token);
    
    // Solicitud a la API con el token
    const response = await axios.post(
      `${API_SERVER}/api/dinasa/getinfoworkorder`,
      {
        CodCompany: '1', // Código de la empresa
        IDWorkOrder: workOrderId, // ID de la orden de trabajo
        IDEmployee: employeeId, // ID del empleado
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.data || !response.data.success) {
      throw new Error('Solicitud fallida: Información de la orden de trabajo no recibida.');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error al obtener la información de la orden de trabajo:', error);
    throw error;
  }
};
