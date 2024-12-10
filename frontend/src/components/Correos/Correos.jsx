import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  fetchCorreos,
  sendSeleccion,
  buscarProductos,
} from "../../Services/Api";
import "../components_css/Correos.css";
import { debounce } from "lodash";

const Correos = ({ setProductosSeleccionados }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busquedas, setBusquedas] = useState({});
  const [opcionesBusqueda, setOpcionesBusqueda] = useState({});
  const [isLoadingBusqueda, setIsLoadingBusqueda] = useState({});

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const data = await fetchCorreos();
        if (Array.isArray(data)) {
          const productosConCantidadNumerica = data.map((producto) => ({
            ...producto,
            cantidad: Number(producto.cantidad),
          }));
          setProductos(productosConCantidadNumerica);
          setProductosSeleccionados(productosConCantidadNumerica); // Actualiza el estado en el componente padre

        } else {
          console.error("Los datos recibidos no son un array:", data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener los productos:", err);
        setLoading(false);
      }
    };
    obtenerProductos();
  }, [setProductosSeleccionados]);

  const manejarSeleccionChange = async (selectedOption, descripcion) => {
    try {
      await sendSeleccion(selectedOption, descripcion);
      const dataActualizada = await fetchCorreos();
      if (Array.isArray(dataActualizada)) {
        const productosConCantidadNumerica = dataActualizada.map(
          (producto) => ({
            ...producto,
            cantidad: Number(producto.cantidad),
          })
        );
        setProductos(productosConCantidadNumerica);
      } else {
        console.error(
          "Los datos actualizados no son un array:",
          dataActualizada
        );
      }
    } catch (err) {
      console.error("Error al enviar la selección:", err);
    }
  };

  const manejarBuscar = debounce(async (valorBusqueda, productoId) => {
    if (valorBusqueda.length > 0) {
      setIsLoadingBusqueda((prev) => ({ ...prev, [productoId]: true }));
      try {
        const resultados = await buscarProductos(valorBusqueda);
        setOpcionesBusqueda((prev) => ({
          ...prev,
          [productoId]: resultados.slice(0, 10),
        }));
      } catch (err) {
        console.error("Error al buscar productos:", err);
      } finally {
        setIsLoadingBusqueda((prev) => ({ ...prev, [productoId]: false }));
      }
    } else {
      setOpcionesBusqueda((prev) => ({ ...prev, [productoId]: [] }));
    }
  }, 800);
  
  const manejarInputBusqueda = (valor, productoId) => {
    setBusquedas((prev) => ({
      ...prev,
      [productoId]: valor,
    }));
    manejarBuscar(valor, productoId);
  };
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid  ">
    <div className="table-responsive bg-white">
      <table className="table table-striped table-bordered border border-5">
        <thead className="thead-dark">
          <tr>
            <th>Imagen</th>
            <th>Descripción Artículo</th>
            <th>Probabilidad (%)</th>
            <th>Descripción Transcrita</th>
            <th>Código Artículo</th>
            <th>Buscar Producto</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, index) => {
            const exactitud = Number(producto.exactitud);
            const exactitudColor =
              exactitud > 60
              ? "#66bb6a" // green
              : exactitud > 40
              ? "#ffee58" // yellow
              : "#ef5350"; // red

            return (
              <tr key={`${producto.codigo_prediccion}-${index}`}>
                <td>
                  {producto.imagen ? (
                    <img
                      src={`data:image/jpeg;base64,${producto.imagen}`}
                      className="img-thumbnail"
                      style={{ maxWidth: "50px" }}
                    />
                  ) : (
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/006/059/989/non_2x/crossed-camera-icon-avoid-taking-photos-image-is-not-available-illustration-free-vector.jpg"
                      className="img-thumbnail"
                      alt={`Imagen no disponible para el producto ${producto.codigo_prediccion}`}
                      style={{ maxWidth: "50px" }}
                    />

                    
                  )}
                </td>
                <td>{producto.descripcion_csv}</td>
                <td style={{ backgroundColor: exactitudColor, color: "black" }}>
                  {producto.exactitud}%
                </td>
                <td>{producto.descripcion}</td>
                <td>{producto.codigo_prediccion}</td>
                <td>
                  <div className="dropdown-container position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar..."
                      value={busquedas[producto.codigo_prediccion] || ""}
                      onChange={(e) =>
                        manejarInputBusqueda(e.target.value, producto.codigo_prediccion)
                      }
                    />
                    {isLoadingBusqueda[producto.codigo_prediccion] && (
                      <div>Cargando...</div>
                    )}
                    {opcionesBusqueda[producto.codigo_prediccion]?.length >
                      0 && (
                      <ul className="list-group mt-2 dropdown-list">
                        {opcionesBusqueda[producto.codigo_prediccion].map(
                          (item) => (
                            <li
                              key={item.CodArticle}
                              className="list-group-item list-group-item-action bg-dark text-white p-4"
                              onClick={() =>
                                manejarSeleccionChange(
                                  item.CodArticle,
                                  producto.descripcion
                                )
                              }
                            >
                              {item.Combined}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    title="Cantidad"
                    type="number"
                    className="form-control"
                    defaultValue={Number(producto.cantidad)}
                    min="0"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
};
Correos.propTypes = {
  setProductosSeleccionados: PropTypes.func.isRequired,
};

export default Correos;
