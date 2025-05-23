const filas = "ABCDEFGHIJK".split("");
const columnas = 21;
const sala = document.getElementById("sala");
const encabezado = document.getElementById("encabezado");
const seleccionadosDiv = document.getElementById("seleccionados");
const seleccionados = new Set();

let ocupados = [];
let esAdmin = false;

const API_URL = "https://script.google.com/macros/s/AKfycbyr1FV2MyIxr3SNFKADresTCRwMLC9Sq6EtxdF-IRwEe0IPnOi1g8lmWmu2SIINXjQXDg/exec";

// Crear encabezado columnas 21 a 1 (de derecha a izquierda)
function crearEncabezado() {
  encabezado.innerHTML = "";
  for (let i = columnas; i >= 1; i--) {
    const numDiv = document.createElement("div");
    numDiv.className = "letra";
    numDiv.textContent = i;
    encabezado.appendChild(numDiv);
  }
}

async function obtenerButacasOcupadas() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    ocupados = data.ocupados || [];
  } catch (error) {
    console.error("Error al obtener butacas ocupadas:", error);
  }
}

function crearAsientos() {
  sala.innerHTML = "";
  filas.forEach(fila => {
    const filaDiv = document.createElement("div");
    filaDiv.className = "fila";

    for (let col = columnas; col >= 1; col--) {
      const id = fila + col;
      const seat = document.createElement("div");
      seat.className = "asiento";
      seat.textContent = id;

      if (["A", "B", "C"].includes(fila)) seat.classList.add("vip");
      if (ocupados.includes(id)) {
        seat.classList.add("ocupado");
      }

      seat.onclick = () => {
        if (seat.classList.contains("ocupado") && !esAdmin) return;

        if (seleccionados.has(id)) {
          seleccionados.delete(id);
          seat.style.backgroundColor = seat.classList.contains("vip") ? "gold" : "green";
        } else {
          seleccionados.add(id);
          seat.style.backgroundColor = "orange";
        }
        actualizarSeleccion();
      };

      filaDiv.appendChild(seat);
    }
    sala.appendChild(filaDiv);
  });
}

function actualizarSeleccion() {
  const lista = Array.from(seleccionados).sort().join(", ");
  if (!lista) {
    seleccionadosDiv.textContent = "Asientos seleccionados: ninguno";
    return;
  }

  let total = 0;
  Array.from(seleccionados).forEach(id => {
    const fila = id.charAt(0);
    total += ["A", "B", "C"].includes(fila) ? 27000 : 17000;
  });

  seleccionadosDiv.textContent = `Asientos seleccionados: ${lista} | Total: $${total.toLocaleString("es-CL")}`;
}

async function enviarReserva() {
  if (seleccionados.size === 0) {
    alert("Debes seleccionar al menos un asiento.");
    return;
  }

  // Preparar datos para enviar a Google Sheets
  const butacasArray = Array.from(seleccionados);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        butacas: butacasArray,
        estado: "vendido"
      }),
    });
    const data = await res.json();

    if (data.result === "ok") {
      alert("Reserva enviada y butacas bloqueadas correctamente.");
      // Actualizar localmente butacas ocupadas y refrescar UI
      ocupados.push(...butacasArray);
      seleccionados.clear();
      crearAsientos();
      actualizarSeleccion();
    } else {
      alert("Error al bloquear las butacas, intente nuevamente.");
    }
  } catch (error) {
    console.error("Error al enviar reserva:", error);
    alert("Error en la conexión, intente nuevamente.");
  }
}

function modoAdmin() {
  const clave = prompt("Ingrese clave de administrador:");
  if (clave === "cultur1sm0") {
    esAdmin = true;
    alert("Modo administrador activado.");
    // Mostrar aviso, tal vez agregar funciones admin en el futuro
  } else {
    alert("Clave incorrecta, modo visitante activado.");
    esAdmin = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  crearEncabezado();
  await obtenerButacasOcupadas();
  crearAsientos();
  actualizarSeleccion();
});
