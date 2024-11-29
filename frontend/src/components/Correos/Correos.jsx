import React, { useState, useEffect } from "react";
import { fetchCorreos, sendSeleccion } from "../../Services/Api";
import "../components_css/Correos.css";

const ProductoCard = ({ producto, onSeleccionChange, onEliminar }) => {
  const [seleccion, setSeleccion] = useState("");

  const manejarCambio = (event) => {
    const selectedOption = event.target.value;
    setSeleccion(selectedOption);
    onSeleccionChange(selectedOption, producto.descripcion);
  };

  const ordenarOpciones = (opciones) => {
    const colores = {
      verde: 80,
      amarillo: 60,
      rojo: 30
    };

    return opciones.sort((a, b) => {
      const colorA = obtenerColor(a.idx);
      const colorB = obtenerColor(b.idx);
      return colores[colorB] - colores[colorA];
    });
  };

  const obtenerColor = (idx) => {
    if (idx === 0 || idx === producto.rango_descripciones.length - 1 || idx === producto.rango_descripciones.length - 2 || idx === 1) {
      return "verde";
    } else if (idx === 2 || idx === producto.rango_descripciones.length - 3 || idx === producto.rango_descripciones.length - 4 || idx === 3) {
      return "amarillo";
    } else {
      return "rojo";
    }
  };

  const opcionesOrdenadas = ordenarOpciones(producto.rango_descripciones.map((item, idx) => ({ ...item, idx })));

  return (
    <div className="card m-3 border border-dark">
      <div className="row no-gutters">
        <div className="col-12 col-lg-2 foto-personalizada">
          {producto.imagen ? (
            <img
              src={`data:image/jpeg;base64,${producto.imagen}`}
              className="card-img-top"
              alt={`Imagen del producto ${producto.codigo_prediccion}`}
            />
          ) : (
            <img
              src="https://static.vecteezy.com/system/resources/previews/006/059/989/non_2x/crossed-camera-icon-avoid-taking-photos-image-is-not-available-illustration-free-vector.jpg"
              className="card-img-top"
              alt={`Imagen no disponible para el producto ${producto.codigo_prediccion}`}
            />
          )}
        </div>
        <div className="col-12 col-md-3 centrado">
          <h5 className="card-title">{producto.descripcion_csv}</h5>
        </div>
        <div className="col-12 col-md-3 centrado">
          <p>
            <strong>Descripción:</strong> {producto.descripcion}
          </p>
          <p>
            <strong>Código Artículo:</strong> {producto.codigo_prediccion}
          </p>
        </div>
        <div className="col-12 col-md-2  centrado">
          <p>
            <strong>Cambiar producto:</strong>
          </p>
          <select
            className="form-control"
            onChange={manejarCambio}
            value={seleccion}
          >
            <option value="">Seleccionar</option>
            {opcionesOrdenadas.map((item) => {
              const color = obtenerColor(item.idx);
              const porcentaje = color === "verde" ? 80 : color === "amarillo" ? 60 : 30;
              const className = `option-${color}`;
              return (
                <option key={`${item.CodArticle}-${item.idx}`} value={item.CodArticle} className={className}>
                  {item.CodArticle} - {item.Description}   ({porcentaje}%)
                </option>
              );
            })}
          </select>

          <input title="Cantidad"
            type="number"
            className="form-control mt-2"
            defaultValue={producto.cantidad}
            min="0"
          />
        </div>
        <div className="col-12 col-md-2 centrado">
          <button className="btn btn-dark ">AÑADIR</button>
          <button onClick={() => onEliminar(producto.descripcion)} className="btn btn-danger m-1">
            BORRAR
          </button>
        </div>
      </div>
    </div>
  );
};


const Correos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const data = await fetchCorreos();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerProductos();
  }, []);

  const manejarSeleccionChange = async (selectedOption, descripcion) => {
    try {
      await sendSeleccion(selectedOption, descripcion);

      // Refrescar los productos desde el backend
      const dataActualizada = await fetchCorreos();
      setProductos(dataActualizada);
    } catch (err) {
      console.error("Error al enviar la selección:", err);
    }
  };

  const manejarEliminar = async (descripcion) => {
    try {
      const response = await fetch('/api/eliminar-producto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ descripcion })
      });

      if (response.ok) {
        // Refrescar los productos desde el backend
        const dataActualizada = await fetchCorreos();
        setProductos(dataActualizada);
      } else {
        console.error('Error al eliminar el producto:', response.statusText);
      }
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
    }
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container-fluid">
      <div className="row">
        {productos.map((producto, index) => (
          <div className="col-12 col-md-12" key={`${producto.codigo_prediccion}-${index}`}>
            <ProductoCard
              producto={producto}
              onSeleccionChange={manejarSeleccionChange}
              onEliminar={manejarEliminar}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Correos;
