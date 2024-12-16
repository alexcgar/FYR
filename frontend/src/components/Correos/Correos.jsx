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
          setProductosSeleccionados(productosConCantidadNumerica);
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
  }, [setProductosSeleccionados]); // Añadir `reload` como dependencia

  const manejarSeleccionChange = async (selectedOption, descripcion, codigoPrediccion) => {
    try {
      // Enviar la selección al backend y obtener los detalles del producto
      const detallesProducto = await sendSeleccion(selectedOption, descripcion);

      // Actualizar el estado local de productos y productos seleccionados
      setProductos((prevProductos) => {
        const nuevosProductos = prevProductos.map((producto) =>
          producto.codigo_prediccion === codigoPrediccion
            ? { ...producto, ...detallesProducto }
            : producto
        );
        setProductosSeleccionados(nuevosProductos);
        return nuevosProductos;
      });

      // Actualizar el valor del input con la descripción del producto seleccionado
      setBusquedas((prevState) => ({
        ...prevState,
        [codigoPrediccion]: detallesProducto.Combined || selectedOption,
      }));

      // Limpiar las opciones de búsqueda para cerrar la lista
      setOpcionesBusqueda((prevState) => ({
        ...prevState,
        [codigoPrediccion]: [],
      }));
    } catch (err) {
      console.error('Error al manejar la selección:', err);
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
    <div className="container-fluid">
      <div className="bg-white">
        <table className="table table-striped table-bordered border border-5 p-3">
          <thead className="thead-dark">
            <tr>
              <th><strong>IMAGEN</strong></th>
              <th><strong>DESCRIPCIÓN TRANSCRITA</strong></th>
              <th><strong>PROBABILIDAD (%)</strong></th>
              <th><strong>DESCRIPCIÓN PRODUCTO</strong></th>
              <th><strong>CÓDIGO ARTÍCULO</strong></th>
              <th><strong>BUSCAR PRODUCTO</strong></th>
              <th><strong>CANTIDAD</strong></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => {
              const exactitud = Number(producto.exactitud);
                const exactitudColor =
                exactitud > 60
                  ? "#a5d6a7" // verde suave
                  : exactitud > 40
                  ? "#fff59d" // amarillo suave
                  : "#ef9a9a"; // rojo suave

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
                  <td>{producto.descripcion}</td>
                  <td style={{ backgroundColor: exactitudColor, color: "black" }}>
                    {producto.exactitud}%
                  </td>
                  <td>{producto.descripcion_csv}</td>
                  <td>{producto.codigo_prediccion}</td>
                  <td>
                    <div className="dropdown-container position-relative">
                      <input
                        key={`input-${producto.codigo_prediccion}-${index}`}
                        type="text"
                        className="form-control"
                        placeholder="Buscar..."
                        value={busquedas[producto.codigo_prediccion] || ""}
                        onChange={(e) =>
                          manejarInputBusqueda(
                            e.target.value,
                            producto.codigo_prediccion
                          )
                        }
                      />
                      {isLoadingBusqueda[producto.codigo_prediccion] && (
                        <div>Cargando...</div>
                      )}
                      {opcionesBusqueda[producto.codigo_prediccion]?.length > 0 && (
                        <ul className="list-group mt-2 dropdown-list">
                          {opcionesBusqueda[producto.codigo_prediccion].map((item) => (
                            <li
                              key={item.CodArticle}
                              className="list-group-item list-group-item-action p-4"
                              onClick={() =>
                                manejarSeleccionChange(
                                  item.CodArticle,
                                  producto.descripcion,
                                  producto.codigo_prediccion
                                )
                              }
                            >
                              {item.Combined}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </td>
                  <td>
                    <input
                      title="Cantidad"
                      type="number"
                      className="form-control"
                      value={producto.cantidad}
                      min="0"
                      onChange={(e) =>
                        setProductos((prevProductos) =>
                          prevProductos.map((p) =>
                            p.codigo_prediccion === producto.codigo_prediccion
                              ? { ...p, cantidad: Number(e.target.value) }
                              : p
                          )
                        )
                      }
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