import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  fetchCorreos,
  buscarProductos,
  sendSeleccion,
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
        } else {
          console.error("Los datos recibidos no son un array:", data);
        }
      } catch (err) {
        console.error("Error al obtener los productos:", err);
      } finally {
        setLoading(false);
      }
    };
    obtenerProductos();
  }, []);

  useEffect(() => {
    // Update the parent component state only when `productos` changes
    setProductosSeleccionados(productos);
  }, [productos, setProductosSeleccionados]);

  const manejarSeleccionChange = (
    selectedOption,
    codigoPrediccion,
    combinedValue,
    descripcion
  ) => {
    setProductos((prevProductos) =>
      prevProductos.map((producto) =>
        producto.codigo_prediccion === codigoPrediccion
          ? {
              ...producto,
              descripcion_csv:
                combinedValue.split(" - ")[1]?.trim() || combinedValue,
              codigo_prediccion: selectedOption,
            }
          : producto
      )
    );
    sendSeleccion(selectedOption, descripcion);
    setBusquedas((prevState) => ({
      ...prevState,
      [codigoPrediccion]: combinedValue,
    }));
    setOpcionesBusqueda((prevState) => ({
      ...prevState,
      [codigoPrediccion]: [],
    }));
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
  }, 1000);

  const manejarInputBusqueda = (valor, productoId) => {
    setBusquedas((prev) => ({
      ...prev,
      [productoId]: valor,
    }));
    manejarBuscar(valor, productoId);
  };

  if (loading || productos.length === 0) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div >
      <div className="bg-white">
        <table className="table table-striped table-bordered border border-5 ">
          <thead className="thead-dark">
            <tr>
              <th>
                <strong>IMAGEN</strong>
              </th>
              <th>
                <strong>DESCRIPCIÓN TRANSCRITA</strong>
              </th>
              <th>
                <strong>PROBABILIDAD (%)</strong>
              </th>
              <th>
                <strong>DESCRIPCIÓN PRODUCTO</strong>
              </th>
              <th>
                <strong>CÓDIGO ARTÍCULO</strong>
              </th>
              <th>
                <strong>BUSCAR PRODUCTO</strong>
              </th>
              <th>
                <strong>CANTIDAD</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => {
              const exactitud = Number(producto.exactitud);
              const exactitudColor =
                exactitud > 60
                  ? "#a5d6a7"
                  : exactitud > 40
                  ? "#fff59d"
                  : "#ef9a9a";

              return (
                <tr
                  key={`${producto.codigo_prediccion}-${producto.descripcion}-${index}`}
                >
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
                  <td
                    style={{ backgroundColor: exactitudColor, color: "black" }}
                  >
                    {producto.exactitud}%
                  </td>
                  <td>{producto.descripcion_csv}</td>
                  <td>{producto.codigo_prediccion}</td>
                  <td>
                    <div className="dropdown-container position-relative">
                      <input
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
                      {opcionesBusqueda[producto.codigo_prediccion]?.length >
                        0 && (
                        <ul className="list-group mt-2 dropdown-list">
                          {opcionesBusqueda[producto.codigo_prediccion].map(
                            (item) => (
                              <button
                                key={item.CodArticle}
                                className="list-group-item list-group-item-action p-4"
                                onClick={() =>
                                  manejarSeleccionChange(
                                    item.CodArticle,
                                    producto.codigo_prediccion,
                                    item.Combined,
                                    producto.descripcion
                                  )
                                }
                              >
                                {item.Combined}
                              </button>
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
                      value={producto.cantidad}
                      min="1"
                      onChange={(e) => {
                        const nuevaCantidad = Number(e.target.value);
                        setProductos((prevProductos) =>
                          prevProductos.map((p) =>
                            p.codigo_prediccion === producto.codigo_prediccion
                              ? { ...p, cantidad: nuevaCantidad }
                              : p
                          )
                        );
                      }}
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
