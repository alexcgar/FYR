import axios from "axios"; // Importamos axios para realizar peticiones HTTP


export const fetchCorreos = async () => {
  try {
    // axios.get() retorna una promesa que resuelve con la respuesta del servidor
    const response = await axios.get("http://localhost:5000/api/predicciones");
    
    // response.data contiene los datos devueltos por el backend
    return response.data;
  } catch (error) {
    // Capturamos y registramos cualquier error que ocurra durante la petición
    console.error("Error al obtener los productos:", error);
    
    // Lanzamos un nuevo error con un mensaje más amigable para el usuario
    throw new Error("Hubo un problema al obtener los datos.");
  }
};



export const sendSeleccion = async (seleccion, descripcion) => {
  try {
    await axios.post("http://localhost:5000/api/send-seleccion", {
      seleccion, 
      descripcion  
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error al enviar la selección:", error);
    // throw new Error("Hubo un problema al enviar la selección.");
  }
};

export const buscarProductos = async (busqueda) => {
  try {
    const response = await axios.post("http://localhost:5000/api/buscar", { busqueda });
    return response.data.rango_descripciones;
  } catch (err) {
    console.error("Error al buscar productos:", err);
    return []; // Devuelve un array vacío en caso de error
  }
};
export const generateOrder = async (orderData) => {
  try {
    const response = await axios.post('/api/generate_order', orderData);
    return response.data;
  } catch (error) {
    console.error('Error al generar el pedido:', error);
    throw error;
  }
};