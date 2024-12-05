/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  fetchCorreos,
  sendSeleccion,
  buscarProductos,
} from "../../Services/Api";
import "../components_css/Correos.css";
import { debounce } from "lodash";

const ProductoCard = ({ producto, onSeleccionChange, onBuscar }) => {
  const [busqueda, setBusqueda] = useState("");
  const [opcionesBusqueda, setOpcionesBusqueda] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [controller, setController] = useState(null);

  const debouncedBuscar = useCallback(
    debounce((valorBusqueda) => {
      manejarBusqueda(valorBusqueda);
    }, 800),
    []
  );

  const manejarBusqueda = async (valorBusqueda) => {
    if (valorBusqueda.length > 0) {
      setIsLoading(true);
      if (controller) {
        controller.abort();
      }
      const newController = new AbortController();
      setController(newController);

      try {
        const resultados = await onBuscar(valorBusqueda, newController.signal);
        console.log("Resultados de la búsqueda:", resultados);
        if (Array.isArray(resultados)) {
          setOpcionesBusqueda(resultados.slice(0, 10));
        } else {
          console.error(
            "Los resultados de la búsqueda no son un array:",
            resultados
          );
          setOpcionesBusqueda([]);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error al buscar productos:", err);
        }
        setOpcionesBusqueda([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setOpcionesBusqueda([]);
    }
  };

  const manejarSeleccion = (item) => {
    setBusqueda(item.Combined);
    setOpcionesBusqueda([]);
    onSeleccionChange(item.CodArticle, producto.descripcion);
  };

  const handleInputChange = (event) => {
    const valorBusqueda = event.target.value;
    setBusqueda(valorBusqueda);
    debouncedBuscar(valorBusqueda);
  };

  const exactitud = Number(producto.exactitud);
  let exactitudColor = "black";
  if (exactitud > 60) {
    exactitudColor = "#4caf50"; // green
  } else if (exactitud > 40 && exactitud < 60) {
    exactitudColor = "#ffeb3b"; // yellow
  } else if (exactitud <= 40) {
    exactitudColor = "#f44336"; // red
  }

  return (
    <div className="card m-3 border border-dark p-3" style={{ background: exactitudColor }}>
      <div className="row">
        <div className="col-12 col-lg-2 mb-1">
          {producto.imagen ? (
            <img
              src={`data:image/jpeg;base64,${producto.imagen}`}
              className="foto-personalizada"
              alt={`Imagen del producto ${producto.codigo_prediccion}`}
            />
          ) : (
            <img
              src="https://static.vecteezy.com/system/resources/previews/006/059/989/non_2x/crossed-camera-icon-avoid-taking-photos-image-is-not-available-illustration-free-vector.jpg"
              className="foto-personalizada"
              alt={`Imagen no disponible para el producto ${producto.codigo_prediccion}`}
            />
          )}
        </div>
        <div className="col-12 col-md-4 centrado">
          <h5 className="card-title">{producto.descripcion_csv}{producto.exactitud}%</h5>
         
        </div>
        <div className="col-12 col-md-3 centrado">
          <div>
            <strong>
              <span>Descripción:</span>
            </strong>{" "}
            {producto.descripcion}
          </div>
          <div>
            <strong>
              <span>Código Artículo:</span>
            </strong>{" "}
            {producto.codigo_prediccion}
          </div>
        </div>
        <div className="col-12 col-md-3 centrado">
          <div>
            <strong>
              <span>Buscar producto:</span>
            </strong>
          </div>
          <div className="dropdown-container position-relative">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar..."
              value={busqueda}
              onChange={handleInputChange}
            />
            {isLoading && <div>Cargando...</div>}
            {opcionesBusqueda.length > 0 && (
              <ul className="list-group mt-2 dropdown-list">
                {opcionesBusqueda.map((item) => (
                  <li
                    key={item.CodArticle}
                    className="list-group-item list-group-item-action bg-dark text-white p-4"
                    onClick={() => manejarSeleccion(item)}
                  >
                    {item.Combined}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            title="Cantidad"
            type="number"
            className="form-control mt-2"
            defaultValue={Number(producto.cantidad)}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

ProductoCard.propTypes = {
  producto: PropTypes.shape({
    descripcion: PropTypes.string.isRequired,
    descripcion_csv: PropTypes.string,
    codigo_prediccion: PropTypes.string,
    imagen: PropTypes.string,
    exactitud: PropTypes.string,
    rango_descripciones: PropTypes.arrayOf(
      PropTypes.shape({
        CodArticle: PropTypes.string,
        Description: PropTypes.string,
      })
    ),
    cantidad: PropTypes.number,
  }).isRequired,
  onSeleccionChange: PropTypes.func.isRequired,
  onBuscar: PropTypes.func.isRequired,
};

const Correos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener los productos:", err);
      }
    };
    obtenerProductos();
  }, []);

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

  const manejarBuscar = async (busqueda, signal) => {
    try {
      const resultados = await buscarProductos(busqueda, signal);
      return resultados;
    } catch (err) {
      console.error("Error al buscar productos:", err);
      return [];
    }
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
    <div className="row">
      {productos.map((producto, index) => (
        <div
          className="col-12 col-md-12"
          key={`${producto.codigo_prediccion}-${index}`}
        >
          <ProductoCard
            producto={producto}
            onSeleccionChange={manejarSeleccionChange}
            onBuscar={manejarBuscar}
          />
        </div>
      ))}
    </div>
  );
};

export default Correos;
